import gensim.models.word2vec
from translate import Translator
from gensim.models.word2vec import KeyedVectors
from  gensim.models import Word2Vec
import gensim.downloader as api
import re
import numpy as np
import cryptography
import pymysql


translator = Translator(from_lang='Russian', to_lang="English")
key_words = ('Build,Drive,Install,Maintain,Repair,Work with Hands,Animals,Electronics,Equipment,Machines,Plants,'
          'Real-World Materials like Wood,Tools,Mechanics/Electronics,Construction/Woodwork,'
          'Transportation/Machine Operation,Physical/Manual Labor,Protective Service,Agriculture,Nature/Outdoors,'
          'Animal Service,Athletics,Engineering',
          'Analyze,Diagnose,Discover,Problem Solve,Research,Study,Test,Think,Facts,'
          'Ideas,Knowledge,Laboratory,Science,Physical Science,Life Science,Medical Science,Social Science,Humanities,'
          'Mathematics/Statistics,Health Care Service', 'Compose,Create,Dance,Design,Perform,Self - Express,Write,Art,'
            'Graphics,Media,Music,Theatre,Humanities,Visual Arts,Applied Arts and Design,Performing Arts,Music,'
                                                        'Creative Writing,Media,Culinary Art,Marketing / Advertising',
          'Advise,Educate,Guide,Help,Nurture,Teach,'
          'Communication,Health,People,Service,Social,Animal Service,Social Science,Culinary Art,Teaching / Education,'
          'Social Service,Health Care Service,Religious Activities,Personal Service,Professional Advising,'
          'Human Resources', 'Direct,Lead,Manage,Market,Negotiate,Sell,Supervise,Business,Customer,Employee,Law',
          'Politics,'
          'Product,Athletics,Religious Activities,Professional Advising,Business Initiatives,Sales,'
          'Marketing / Advertising,Finance,Management / Administration,Public Speaking,Politics,Law,Attention to Detail,'
          'File,Inspect,Organize,Record,Sort,Data,Files,Information,Office,Procedures,Regulations,Rules,'
          'Mathematics / Statistics,Information Technology,Finance,Accounting,Human Resources,Office Work')


def get_marks(activity: str, model):
    """
    Функция, в которую передается тематика групп, а на выходе получается список со значениями схожести с ключевыми
    словами профессиональных типов. Схожесть проверяется по заранее обученной модели Word2Vec(а точнее, KeyedVectors).
    Модель обучалась на данных из запросов в гугл (300000 объектов).
    """

    if re.search(r'[^a-zA-Z]', activity):
        # если тематика на русском, то переводим ее на анлийский
        activity = translator.translate(activity)
    act_list = []
    if " " in activity:
        # если в тематике несколько слов, то разобьем их по пробелам
        act_list = activity.split(' ')
    else:
        act_list.append(activity)

    types = ('Реалистичный', "Интеллектуальный", "Артистический", "Социальный", "Предприимчивый", "Конвенциональный")
    similarity_list = np.zeros(len(types))
    for i, key in enumerate(key_words):
        tokens = [token.strip() for token in key.split(',')]
        similarity_score = model.n_similarity(tokens, act_list)
        print(f'{types[i]}: ', similarity_score)
        similarity_list[i] += similarity_score
    return similarity_list


def main():
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='EBW6fV4N#Wp8WBn',
        db='user_info',
        charset='utf8mb4'
    )
    print('Connected to DB')
    # Список, который будет передан из JS.
    list_of_act = [['Интернет-СМИ', 22], ['Наука', 15], ['СМИ', 11], ['Образование', 8], ['Общество', 7],
                   ['Публичная страница', 7], ['ВКонтакте', 5], ['Юмор', 5], ['Программирование', 4], ['Сайт', 4],
                   ['Писатель', 3], ['Сайты', 2], ['Учёный, преподаватель', 2], ['Кино', 2], ['Библиотека', 2],
                   ['Образовательное учреждение', 2], ['Государственная организация', 2], ['Страна', 2],
                   ['Городское сообщество', 2], ['Бизнес', 2], ['Соседи', 1], ['Производство контента', 1],
                   ['Фотограф', 1], ['Дискуссионный клуб', 1], ['Техника, электроника', 1],
                   ['Программное обеспечение', 1],
                   ['Общественная организация', 1], ['Сериал', 1], ['Публицист', 1], ['Художник', 1], ['Книга', 1],
                   ['Предпринимательница', 1], ['Шоу, передача', 1], ['Фильм', 1], ['Издательский дом', 1],
                   ['Университет', 1], ['Политик', 1], ['Медицина', 1], ['Творчество', 1], ['Поэт', 1],
                   ['Общественный деятель', 1], ['Журналист', 1], ['Тренинг, семинар', 1], ['Ювелирные изделия', 1],
                   ['Музыкальная группа', 1], ['Политика', 1], ['Домашние и дикие животные', 1], ['Философия', 1]]
    act_dict = dict(list_of_act)
    number_of_act = sum(act_dict.values())
    for item in act_dict:
        act_dict[item] /= number_of_act
    db_list = []
    with connection.cursor() as cur:
        cur.execute('select act_name from activities;')
        db_list = [el[0] for el in cur.fetchall()]
    k = np.count_nonzero(np.array(list(act_dict.values())) > 0.03)
    act_in_db = list(set(list(act_dict.keys())[:k+1]).intersection(set(db_list)))
    act_not_in_db = list(set(list(act_dict.keys())[:k+1]) - set(act_in_db))
    res_list = np.zeros(6)
    with connection.cursor() as cur:
        for act in act_in_db:
            cur.execute('select R,I,A,S,E,C from activities where act_name=%s', act)
            res_list += act_dict[act]*np.array(cur.fetchall())[0]
    print('Values from DB - successful')
    if act_not_in_db:
        print('Loading model...')
        model = KeyedVectors.load('google-model')
        for act in act_not_in_db:
            print(act)
            marks = get_marks(act, model)
            # connection.cursor().execute('insert activities(act_name, R,I,A,S,E,C) values(%s, %s,%s, %s,%s, %s,%s)',
            #                                     (act, marks[0], marks[1], marks[2], marks[3], marks[4],
            #                                      marks[5]))
            # connection.commit()
            res_list += act_dict[act]*marks
            print('------------------------------')
    print(res_list)


if __name__ == '__main__':
    main()
