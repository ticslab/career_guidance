import pandas as pd
import asyncio
import numpy
import queue
import vk_api
import vkbottle
import time


# path = str(input('Введите путь к csv-файлу с id пользователей:' + '\n'))
# C:\Users\artem\Downloads\Telegram Desktop\users_info_0.csv

df = pd.read_csv('C:/Users/artem/Downloads/Telegram Desktop/users_info_0.csv', engine='python')
tokens_ = ['vk1.a.Sjbrtifp5ddYgtNq2DFcnse0WpGyQaE2bhmBkLfg0HPo117t-UT8eHUIQkyfnUvldrWRTyCr36uHLVdrPlxjrHOOItd7ahIjQQWUkWJgLshMcWlMcp5BhGZgTmDilyCCboB0ske_gA4jP2iC2GCZOLS5NWo0nYjcMeltXYr4dTXYPOk3aGlpmj0X_M5Rz2qHcMsut8pfsCwS4G0CaEerHQ',
           'vk1.a.aPdOAhc4bjJVDm1cxRmH7iSBOvioe188wdaWWkuoda_4Iz7UpHd2SE2JSV9bqDHHVUvcHAvgTvIci1b_kVRQdeOVlJWZDGCmCgYDsZzmeFuLVpfIpT63pWkq-vnRuhwXKb95gq9_thlGjLepT6_q2aW9s9dj1lykyZTjsqsJ9l88zf233v0TOr1cQoFTn3Pqsq0Ov0BpMnwtrVsF1dkxZA']


async def get_apis(tokens):
    apis_queue = queue.Queue()
    for token in tokens:
        apis_queue.put(item=vkbottle.API(token=token))
    return apis_queue


async def user_info(users: list):
    info = []
    for user in users:
        user_id = user['id']
        user_is_closed = 1 if user['is_closed'] else 0
        user_bdate = user['bdate'][-4:] if user.get('bdate',0) and len(user['bdate']) > 5 else 0
        user_occupation = user['occupation'] if user.get('occupation', '') else 0
        user_career = [[job.get('position', 0), job.get('from', 0), job.get('intil', 0)] for job in user['career']] \
            if user.get('career', []) else 0
        user_university = 1 if user.get('university', 0) else 0
        user_education = [user.get('faculty_name', 0), user.get('graduation', 0)]
        info.append([user_id, user_is_closed, user_bdate, user_occupation, user_career, user_university, user_education[0], user_education[1]])
    return info


async def group_info(groups: list):
    result = []

    list_of_activities = []
    for group in groups:
        activities = []
        if type(group) != str:
            for item in group['items']:
                activities.append(item.get('activity', 'Private group'))
            list_of_activities.append(activities)
        else:
            list_of_activities.append([])
    for li in list_of_activities:
        res_dict = {}
        if li:
            for act in li:
                res_dict[act] = res_dict.get(act, 0) + 1
            result.append(res_dict)
        else:
            result.append({})
    return result


async def get_info(ids, tokens: list):
    apis = await get_apis(tokens)
    divided_list = numpy.array_split(ids, len(tokens))
    print(len(divided_list), len(divided_list[0]))
    list_of_users, list_of_groups = [], []
    coros_users = (get_users(ids, False, apis) for ids in divided_list)
    coros_groups = (get_users(ids, True, apis) for ids in divided_list)
    for coro in list(coros_users):
        users = await coro
        info = await user_info(users)
        list_of_users.extend(info)
    print(list_of_users)
    user_df = pd.DataFrame(list_of_users, columns=['id','is_closed', 'bdate_year', 'occupation', 'career',
                                                   'edu_information', 'edu_faculty', 'edu_graduation'])
    user_df.to_csv('C:/Users/artem/OneDrive/Рабочий стол/data_users.csv', index=False)
    # for coro in list(coros_groups):
    #     groups = await coro
    #     info = await group_info(groups)
    #     list_of_groups.extend(info)
    # data = numpy.array([list(ids), list_of_groups]).transpose()
    # group_df = pd.DataFrame(data, columns=['id', 'activities'])
    # group_df.to_csv('C:/Users/artem/OneDrive/Рабочий стол/data_groups.csv', index=False)
    # print('end')


async def get_users(user_ids: list, one_by_one: bool, apis) -> list:
    list_of_users = []
    api_requests = queue.Queue()
    if one_by_one:
        # Здесь мы хотим узнавать информацию про группы
        user_ids_list = user_list_handler(user_ids, 1)
        for i in range(len(user_ids_list)):
            api_requests.put(('groups.get', {'user_id': user_ids_list[i], 'fields': 'activity', 'extended': 1}))
    else:
        user_ids_list = user_list_handler(user_ids, len(user_ids)//3)
        for i in range(len(user_ids_list)):
            api_requests.put(('users.get',
                              {'user_id': user_ids_list[i], 'fields': 'sex, bdate, occupation, education, career'}))
    while not api_requests.empty():
        api_request = api_requests.get()
        response = await response_executor(api_request, apis)
        if one_by_one:
            list_of_users.append(response['response'])
        else:
            list_of_users.extend(response['response'])
    return list_of_users


def user_list_handler(user_ids: list, num: int) -> list:
    if num == 1:
        return [str(id) for id in user_ids]
    else:
        user_list = []
        # а если len(user_ids)//num == 0? Тут либо правильно подобрать
        # num, либо отдельно обрабатывать случай равенства 0
        for i in range(len(user_ids)//num):
            user_list.append(','.join(user_ids[i * num: (i + 1) * num]))
        if len(user_ids) % num != 0:
            user_list.append(','.join(user_ids[(-1)*(len(user_ids) % num):]))
        return user_list


async def vk_error_handler(apis, api):
    asyncio.create_task(put_with_timeout(apis, api, 600))


async def put_with_timeout(apis, api, t):
    time.sleep(t)
    apis.put(api)


async def response_executor(api_request: tuple, apis: queue.Queue):
    api = None
    while True:
        try:
            request, dictionary = api_request
            api = apis.get()
            response = await api.request(request, dictionary)
            await put_with_timeout(apis, api, 0.34)
            return response
        except vkbottle.VKAPIError as error:
            if error.code == 29:
                await vk_error_handler(apis, api)
            else:
                await put_with_timeout(apis, api, 0.34)
                return {'response': 'Error'}

asyncio.run(get_info(df['id'].astype('str')[:500], tokens_))



