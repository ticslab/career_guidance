import re
import pymysql
import pandas as pd
import asyncio
import numpy
import queue
import vkbottle
import time
from configparser import ConfigParser


async def get_apis(tokens: list) -> queue.Queue:
    apis_queue = queue.Queue()
    for token in tokens:
        apis_queue.put(item=vkbottle.API(token=token))
    return apis_queue


def create_tables(connection):
    with connection.cursor() as cur:
        cur.execute(
            'CREATE TABLE IF NOT EXISTS USERS(USER_ID VARCHAR(15), IS_CLOSED INT, SEX INT, BDATE_YEAR VARCHAR(4), '
            'OCCUPATION VARCHAR(1000), CAREER VARCHAR(5000), EDU_INFO INT, EDU_FACULTY VARCHAR(200), '
            'EDU_GRADUATION INT,PRIMARY KEY (USER_ID));')
        connection.commit()
        cur.execute(
            'CREATE TABLE IF NOT EXISTS USER_GROUPS(USER_ID VARCHAR(15), ACTIVITIES VARCHAR(5000), FOREIGN KEY '
            '(USER_ID) REFERENCES USERS (USER_ID));')
        connection.commit()


async def user_info(users: list, connection) -> list:
    info = []
    for user in users:
        user_id = str(user['id'])
        user_sex: int = user['sex']
        user_is_closed: int = 1 if user['is_closed'] else 0
        user_bdate: str = user['bdate'][-4:] if user.get('bdate', 0) and len(user['bdate']) > 5 else '0'
        user_occupation: dict or str = user['occupation'] if user.get('occupation', '') else '0'
        user_career: list or str = [[job.get('position', 0), job.get('from', 0), job.get('until', 0)] for job in
                                    user['career']] \
            if user.get('career', []) else '0'
        user_university: int = 1 if user.get('university', 0) else 0
        user_education: list = [user.get('faculty_name', '0'), user.get('graduation', 0)]
        info.append([user_id, user_is_closed, user_sex, user_bdate, user_occupation, user_career, user_university,
                     user_education[0], user_education[1]])
        with connection.cursor() as cur:
            cur.execute(
                'INSERT USERS(USER_ID, IS_CLOSED, SEX, BDATE_YEAR, OCCUPATION, CAREER, EDU_INFO, EDU_FACULTY,'
                'EDU_GRADUATION) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s);', (user_id, user_is_closed,
                                                                        user_sex, user_bdate, str(user_occupation),
                                                                        str(user_career), user_university,
                                                                        user_education[0], user_education[1]))
        connection.commit()
    return info


async def group_info(groups: list, ids: list, connection) -> list:
    result = []
    list_of_activities = []
    for group in groups:
        activities = []
        if group:
            if group['count'] == 0:
                list_of_activities.append(tuple())
            else:
                for item in group['items']:
                    act = item.get('activity', 'Private group')
                    meeting = re.search('\d+:\d\d', act)
                    if 'Этот материал заблокирован' not in act and not meeting:
                        activities.append(act)
                    elif meeting:
                        activities.append('Meeting')
                list_of_activities.append(activities)
        else:
            list_of_activities.append([])
    for i in range(len(list_of_activities)):
        res_dict = {}
        if len(list_of_activities[i]) > 0:
            for act in list_of_activities[i]:
                res_dict[act] = res_dict.get(act, 0) + 1
            result.append(res_dict)
        elif type(list_of_activities[i]) == tuple:
            result.append({'No groups': 1})
        else:
            result.append({})
        with connection.cursor() as cur:
            cur.execute('INSERT USER_GROUPS(USER_ID, ACTIVITIES) VALUES(%s, %s);', (ids[i], str(result[i])))
        connection.commit()
    return result


async def get_info(ids: pd.Series, tokens: list, connection) -> None:
    apis = await get_apis(tokens)
    divided_list = numpy.array_split(ids, len(tokens))
    list_of_users, list_of_groups = [], []
    coros_users = (get_users(ids, False, apis) for ids in divided_list)
    coros_groups = (get_users(ids, True, apis) for ids in divided_list)
    create_tables(connection)
    for coro in list(coros_users):
        users = await coro
        info = await user_info(users, connection)
        list_of_users.extend(info)
    user_df = pd.DataFrame(list_of_users, columns=['id', 'is_closed', 'sex', 'bdate_year', 'occupation', 'career',
                                                   'edu_information', 'edu_faculty', 'edu_graduation'])
    user_df.to_csv('data_users.csv', index=False)
    print('users parsed')
    for coro in list(coros_groups):
        groups = await coro
        info = await group_info(groups, list(ids), connection)
        list_of_groups.extend(info)
    data = numpy.array([list(ids), list_of_groups]).transpose()
    group_df = pd.DataFrame(data, columns=['id', 'activities'])
    group_df.to_csv('data_groups.csv', index=False)
    print('groups parsed')


async def get_users(user_ids: list, one_by_one: bool, apis) -> list:
    list_of_users = []
    api_requests = queue.Queue()
    if one_by_one:
        user_ids_list = user_list_handler(user_ids, 25)
        for li in user_ids_list:
            api_requests.put(li)
    else:
        user_ids_list = user_list_handler(user_ids, len(user_ids) // 3)
        for i in range(len(user_ids_list)):
            api_requests.put(('users.get',
                              {'user_id': user_ids_list[i], 'fields': 'sex, bdate, occupation, education, career'}))
    while not api_requests.empty():
        api_request = api_requests.get()
        response = await response_executor(api_request, apis, one_by_one)
        if one_by_one:
            list_of_users.extend(response['response'])
        else:
            list_of_users.extend(response['response'])
    return list_of_users


def user_list_handler(user_ids: list, num: int) -> list:
    if num == 1:
        return [str(user_id) for user_id in user_ids]
    else:
        user_list = []
        for i in range(len(user_ids) // num):
            user_list.append(','.join(user_ids[i * num: (i + 1) * num]))
        if len(user_ids) % num != 0:
            user_list.append(','.join(user_ids[(-1) * (len(user_ids) % num):]))
        return user_list


async def put_with_timeout(apis, api, t):
    time.sleep(t)
    apis.put(api)


async def response_executor(api_request: tuple or str, apis: queue.Queue, one_by_one: bool) -> dict:
    api = None
    while True:
        if not one_by_one:
            try:
                request, dictionary = api_request
                api = apis.get()
                response = await api.request(request, dictionary)
                await put_with_timeout(apis, api, 0.34)
                return response
            except vkbottle.VKAPIError as error:
                print(error)
                if error.code == 29:
                    task = asyncio.create_task(put_with_timeout(apis, api, 600))
                    await task
                else:
                    await put_with_timeout(apis, api, 0.34)
                    break
        else:
            api = apis.get()
            response = await api.execute(
                f"var u = [{str(api_request)}];"
                "var i = 0;"
                "var res = [];"
                "while (i < u.length){"
                "var api = API.groups.get({'user_id': u[i], 'fields':'activity', 'extended': 1});"
                "if (api){"
                "res.push(api);"
                "}"
                "else{"
                "res.push([]);"
                "}"
                "i = i + 1;"
                "};"
                "return res;"
            )
            await put_with_timeout(apis, api, 0.34)
            return response


def read_config(filename):
    parser = ConfigParser()
    parser.read(filename)
    res = []
    for section in parser.sections():
        items = parser.items(section)
        li_section = []
        for item in items:
            li_section.append(str(item[1]))
        res.append(li_section)
    return res


async def main(filename, path):
    database, tokens = read_config(filename)
    connection = None
    try:
        connection = pymysql.connect(
            host=database[0],
            user=database[1],
            password=database[2],
            db=database[3],
            charset=database[4]
        )
        print("Connection to DB successful")
    except pymysql.Error as error:
        print(f'An error occurred: {error}')
    if connection is not None:
        ids_file = pd.read_csv(path, engine='python')
        task = asyncio.create_task(get_info(ids_file['id'].astype('str')[:500], tokens, connection))
        await task


# 'C:/Users/artem/PycharmProjects/pd/venv/config.ini'
# 'C:/Users/artem/Downloads/Telegram Desktop/users_info_0.csv'
config_path = input('Enter config file path: \n')
ids_path = input('Enter ids file path: \n')
asyncio.run(main(config_path, ids_path))
