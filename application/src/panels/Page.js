import React from 'react';
import PropTypes from 'prop-types';
import BarChart  from './BarChart';
import Chart from 'chart.js/auto';

import { Panel, PanelHeader, Group, InfoRow, PanelHeaderBack, SimpleCell, Cell, Avatar, Button } from '@vkontakte/vkui';

function viewAct(){
	document.getElementById("group").style.display = "block";
	document.getElementById("button").style.display = "none";
  };

const Page = props => (
	<Panel id={props.id}>
		<PanelHeader
			before={<PanelHeaderBack onClick={props.go} data-to="home"/>}
		>
            Тематики групп и их количество 
		</PanelHeader>
		{props.fetchedUser &&
		<Group>
			<Cell
				before={props.fetchedUser.photo_200 ? <Avatar src={props.fetchedUser.photo_200}/> : null}
				subtitle={props.fetchedUser.city && props.fetchedUser.city.title ? props.fetchedUser.city.title : ''}
			>
				{`${props.fetchedUser.first_name} ${props.fetchedUser.last_name}`}
			</Cell>
		</Group>}
		{(props.fetchedUser  && !props.fetchedUser.deactivated) && 
		<Cell style={{flexDirection: 'column', display: 'flex', alignItems: 'center'}}>
			{props.max_data ? <BarChart chartData={props.max_data}/> : ''}
		</Cell>}
		<Button id='button' style={{backgroundColor: 'rgba(0,0,0,0)', color: '#818C99', marginTop: '10px', fontSize: 16}} onClick={viewAct}>
			Показать все тематики
		</Button>
		{/* {props.groups[0] == } */}
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
}

export default Page;
