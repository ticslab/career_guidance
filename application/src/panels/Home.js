import React from 'react';
import PropTypes from 'prop-types';

import { PanelHeader, Panel, Button, Div, Cell, FormItem, Input, FormLayoutGroup, Image } from '@vkontakte/vkui';

import icon from '../img/icon.png';
import './Icon.css';


const Home = ({ id, fetch_foreign, fetch_my, get, go, flag }) => (
	<Panel id={id}>
		<PanelHeader>Анализ страниц Вконтакте</PanelHeader>
		<Div style={{position: 'relative'}}>
			<Button style={
				{backgroundColor: '#2688EB', 
				margin: 13, 
				position: 'absolute', 
				top: 0, 
				right: 0}
			} 
				onClick={go} 
				data-to={'info'}>
				Меню
			</Button>
		</Div>
		<Div style={
			{position: 'relative', 
			top: '50px', 
			display: 'flex', 
			alignItems: 'center', 
			flexDirection: 'column' }}>
			<Button style={
				{backgroundColor: '#2688EB', 
				height: '35px'}
			} 
				onClick={ fetch_my } 
				data-to={"page"} 
				size='m' >
				Анализ моей старницы
			</Button>
			<FormLayoutGroup mode="horizontal">
				<FormItem 
					top='Узнать про чужую страницу:'  
					status={flag ? '' : 'error'}
					bottom={flag ? "" : 'Введите корректный id'}
					>
					<Input onChange={get} style={{width: '300px'}} placeholder='Ввести id:'/>
				</FormItem>
				<Button style={
					{marginLeft: 15, 
					backgroundColor: '#2688EB'}
				} 
				onClick={ fetch_foreign } 
				data-to="page" 
				size='l'>
					<img className="Icon" src={icon}/>
				</Button>
			</FormLayoutGroup >
		</Div>
	</Panel>
);


Home.propTypes = {
	id: PropTypes.string.isRequired,
};

export default Home;
