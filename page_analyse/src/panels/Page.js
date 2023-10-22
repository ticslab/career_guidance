import React from 'react';
import PropTypes from 'prop-types';
import BarChart  from './BarChart';
import Artistic from '../img/Artistic.png';
import Conventional from '../img/Conventional.png';
import Enterprising from '../img/Enterprising.png';
import Investigative from '../img/Investigative.png';
import Realistic from '../img/Realistic.png';
import Social from '../img/Social.png';

function selectImage(type){
	switch (type){
		case 'Реалистичный': 
			return Realistic;
		case 'Интеллектуальный': 
			return Investigative;
		case 'Артистический':
			return Artistic;
		case 'Социальный':
			return Social;
		case 'Предприимчивый':
			return Enterprising;
		case 'Конвенциональный':
			return Conventional;
	}
}


import { Panel, PanelHeader, Group, InfoRow, PanelHeaderBack, SimpleCell, Cell, Avatar, Button, Spinner, Image } from '@vkontakte/vkui';

var di = {'Реалистичный': 'Вы — человек действия, результат Вашего труда осязаем и предметен. Вы охотнее делаете, чем говорите, настойчивы и уверены в себе, отличаетесь эмоциональной стабильностью и надежностью. Подходящие профессии:  механик, электрик, инженер, моряк, водитель, повар, пожарный, техник, ювелир, фермер и др.', 
		  "Интеллектуальный": "Вы склонны к профессиям умственного труда, позволяющим проявлять свойственные Вам любопытство, креативность, а также аналитичность мышления. Подходящие профессии: научный работник, философ, физик, математик, инженер и др.к", 
		  "Артистический": 'Вы эмоциональны, оригинальны, творчески одарены.  Для Вас важна красота, эстетика, самовыражение. Вы отличаетесь необычным взглядом на жизнь и независимостью в принятии решений. Не любите рутину, предпочитаете свободный график работы. Подходящие профессии: музыкант, актер, писатель, фотограф, художник, дизайнер, модельер и т.д.', 
		  "Социальный": 'Вы склонны к профессиям, предполагающим социальное взаимодействие, особенно связанное с воспитанием, объяснением, просвещением, помощью другим. Подходящие профессии: врач, учитель, психолог, социальный работник, менеджер по персоналу, организатор мероприятий, представитель службы поддержки клиентов и др.', 
		  "Предприимчивый": 'Вы предприимчивы, энергичны, инициативны и амбициозны, любите генерировать креативные идеи, стремитесь к достижению вершин. Выбираете цели, ценности и задачи, позволяющие проявить энтузиазм, доминантность, реализовать авантюризм. Подходящие профессии: предприниматель, адвокат, страховой агент, брокер на бирже, агент по недвижимости, политик, пиарщик.', 
		  "Конвенциональный": 'Вы предпочитаете работать в структурированной среде и имеете талант к организации и администрированию. Ориентированы на работу с информацией, ее систематизацией и управлением. Подходящие профессии: секретарь, бухгалтер, патентовед, нотариус, топограф, корректор, страховой агент, офис-менеджер.'};
function viewAct(){
	document.getElementById("group").style.display = "block";
	document.getElementById("button").style.display = "none";
  };

const Page = props => (
	<Panel id={props.id}>
		<div
		aria-busy={true}
		aria-live="polite">
		</div>
		<PanelHeader
			before={<PanelHeaderBack onClick={props.go} data-to="home"/>}
		>
            Тематики групп и их количество 
		</PanelHeader>
		
		{!props.loading && props.fetchedUser &&
		<Group>
			<Cell
				before={props.fetchedUser.photo_200 ? <Avatar src={props.fetchedUser.photo_200}/> : null}
				subtitle={props.fetchedUser.city && props.fetchedUser.city.title ? props.fetchedUser.city.title : ''}
			>
				{`${props.fetchedUser.first_name} ${props.fetchedUser.last_name}`}
			</Cell>
		</Group>}
		{ !props.fId && 
		<Group>
			{ props.loading ? 
		<Spinner size="medium" style={{ margin: '20px 0' }}>
		</Spinner> : 
		<Group>
		<div style={{justifyContent: 'center', display: 'flex', alignItems: 'center', fontSize: 25}}>
			<img src={selectImage(props.type['type'])} style={{flexDirection: 'column', margin: '0 5px', display: 'block', alignItems: 'center', width: '65px'}}></img>

			{props.type['type'].toUpperCase()}
			</div>
		<div style={{flexDirection: 'column', display: 'flex', alignItems: 'center', fontSize: 20, color: '#2F71F1', fontWeight: 600, textAlign: 'center', whiteSpace: 'normal'}}>Вероятно Вы относитесь к {props.type['type'].slice(0, -2).toLowerCase()}ому <br/>типу личности</div>
		<div style={{flexDirection: 'column', display: 'flex', alignItems: 'center', fontSize: 15, margin: '10px 50px', textAlign: 'center'}}>{di[props.type['type']]}</div>
		<div style={{flexDirection: 'column', display: 'flex', alignItems: 'center', margin: '10px 0'}}><Button style={
				{backgroundColor: '#2688EB', height: '35px'}} size='m' onClick={() => location.href='https://vk.com/ticspsytests'}>Уточнить результаты</Button></div>
		</Group>
		}

			</Group>}
		{!props.loading && (props.fetchedUser  && !props.fetchedUser.deactivated && props.fetchedUser.can_access_closed) && 
		<Cell style={{flexDirection: 'column', display: 'flex', alignItems: 'center'}}>
			{props.max_data ? <BarChart chartData={props.max_data}/> : ''}
		</Cell>}
		{!props.loading && <Button id='button' style={{backgroundColor: 'rgba(0,0,0,0)', color: '#818C99', marginTop: '10px', fontSize: 16}} onClick={viewAct}>
			Показать все тематики
		</Button>
		}
		<Group id='group' style={{display: 'none'}}>
			<SimpleCell>
                {props.groups.map(group => <InfoRow header={group[0]}>{group[1]}</InfoRow>)}
			</SimpleCell>
		</Group>
		
	</Panel>
);
// && !props.fetchedUser.is_closed


Page.propTypes = {
    id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	groups: PropTypes.array,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
	max_data: PropTypes.object,
	type: PropTypes.object,
	loading: PropTypes.bool, 
	fId: PropTypes.bool
}

export default Page;
