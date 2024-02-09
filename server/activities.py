import pandas as pd
import json
from flask import Flask, request
from flask_cors import CORS
import joblib


class act_list():
    list_of_act = []


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
types = ('Реалистичный', "Интеллектуальный", "Артистический", "Социальный", "Предприимчивый", "Конвенциональный")
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/act', methods=['POST'])
def get_act():
    act_list.list_of_act = json.loads(request.data)
    print(f'post - {act_list.list_of_act}')
    model = joblib.load('model_boosting.pkl')
    columns = pd.read_csv('columns.csv')
    act_dict = dict(act_list.list_of_act)
    line = []
    for i in range(columns.shape[0]):
        line.append(act_dict.get(columns.loc[i]['0'], 0))
    line.append(act_dict['sex'])
    pr = model.predict([line])
    res_dict = {'R': 'Реалистичный', 'I': "Интеллектулаьный", 'A': 'Артистический',
                "S": "Социальный", "E": 'Предприимчивый', 'C': 'Конвенциональный'}
    return json.dumps({'type': res_dict[pr[0]]})


if __name__ == '__main__':
    app.run(debug=True, port='5000')
