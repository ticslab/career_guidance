import React from 'react';
import PropTypes from 'prop-types';

import { PanelHeader, Panel, Button, Div, Checkbox,Cell, Group, FormItem, Input, FormLayoutGroup,ModalPage, PanelHeaderSubmit, ModalPageHeader,SplitLayout, Avatar, Search, ModalRoot  } from '@vkontakte/vkui';

import icon from '../img/icon.png';
import './Icon.css';

const Home = ({ id, fetch_foreign, fetch_my, get, go, flag, fetch_int, onChange, user, getInt }) => {
	const [activeModal, setActiveModal] = React.useState(null);
	const [friends, setFriends] = React.useState(null);
	const [search, setSearch] = React.useState('');
	const [selectedCheckboxes, setSelectedCheckboxes] = React.useState([user ? user.id : null]);

	async function getFrineds(){
		var friends = await fetch_int();
		setFriends(friends);
	};

	const handleChange = (event) => {
		onChange(event)
	};

	const handleCheckboxChange = (event) => {
		var name = event.target.id;
		var checked = event.target.checked; 
		console.log(name);
		console.log(checked);
		var updatedSelectedCheckboxes = [...selectedCheckboxes];
		
		if (checked) {
			updatedSelectedCheckboxes.push(name);
		} else {
			updatedSelectedCheckboxes = updatedSelectedCheckboxes.filter(
			(checkboxName) => checkboxName !== name
			);
		}
		setSelectedCheckboxes(updatedSelectedCheckboxes);
		console.log(selectedCheckboxes);

	};

	const friendsFiltered = () => {
		
		try{ //friend.toLowerCase().indexOf(search.toLowerCase()) > -1
			var s = friends.filter( friend  => friend[1].toLowerCase().indexOf(search.toLowerCase()) > -1)
			return s;
		}
		catch (err){
			return []
		}
	} 

	const SearchonChange = (e) => {
		setSearch(e.target.value);
	  };

	const modal = (
		<ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
				<ModalPage id="modal">
					<ModalPageHeader 
					after={<PanelHeaderSubmit onClick={() => {handleChange(selectedCheckboxes);if(selectedCheckboxes.length>1){go('intpage');}} } data-to={'intpage'} />}
					>
						Друзья
					</ModalPageHeader>
					<Search value={search} onChange={SearchonChange} after={null}/>
						{friendsFiltered().length > 0 && 
          				friendsFiltered().map((friend) => 
						// onClick={() => {userList.push(friend[0])}} 
								<Checkbox id={friend[0]} 
								onClick={handleCheckboxChange} 
								checked={selectedCheckboxes.includes(friend[0].toString())}
								>
									<Div style={{position: 'relative', 
												display: 'flex', 
												alignItems: 'center',
												padding: '0px 0px'}}
												id={friend[0]} 
												>
												<Avatar src={friend[2]} style={{margin:'10px'}} />
												{friend[1]}
									</Div>
								
								</Checkbox>	
						
						)}
				</ModalPage>
		</ModalRoot>
	);

	return(
		<SplitLayout modal={modal}>
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
				<SplitLayout style={{position: 'relative', 
					display: 'flex', 
					alignItems: 'center', 
					flexDirection: 'column' }}>
				<Div style={
					{position: 'relative', 
					top: '50px', 
					display: 'flex', 
					alignItems: 'center', 
					flexDirection: 'column' }}>
					<Div style={{position: 'relative', 
					top: '50px', 
					display: 'flex', 
					alignItems: 'center'}}>
					<Button style={
						{backgroundColor: '#2688EB', 
						height: '35px',
						margin: '0 5px'}
					} 
						onClick={ fetch_my } 
						data-to={"page"} 
						size='m' >
						Анализ моей старницы
					</Button>
					
					<Button style={
						{backgroundColor: '#2688EB', //onClick
						height: '35px'}} size='m' onClick={() => {getFrineds();setActiveModal('modal');}}>
						Анализ общих тематик
					</Button>
					
					</Div>
					<Div style={
					{position: 'relative', 
					top: '20px', 
					display: 'flex', 
					alignItems: 'center', 
					flexDirection: 'column' }}>
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
				</Div>
				</SplitLayout>
				
			</Panel>
		</SplitLayout>
	)
	
};


Home.propTypes = {
	id: PropTypes.string.isRequired,
};

export default Home;
