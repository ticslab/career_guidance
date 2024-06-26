import React from 'react';
import PropTypes from 'prop-types';

import { PanelHeader, Panel, Spacing, Button, Div, Checkbox, 
	Progress, FormItem, Input, FormLayoutGroup,ModalPage, PanelHeaderSubmit, 
	ModalPageHeader,SplitLayout, Avatar, Search, ModalRoot, Group  } from '@vkontakte/vkui';

import icon from '../img/icon.png';
import './Icon.css';

const Home = ({ id, fetch_foreign, fetch_my, 
	get, go, flag, fetchInt, onChange, user, chosenonChange, progress }) => {
	const [activeModal, setActiveModal] = React.useState(null);
	const [friends, setFriends] = React.useState(null);
	const [search, setSearch] = React.useState('');
	const [selectedCheckboxes, setSelectedCheckboxes] = React.useState([user ? user.id : null]);
	const [chosenCheckboxes, setChosenCheckboxes] = React.useState([user ? user.id : null]);


	const availableScreenWidth = document.documentElement.scrollWidth
	const availableScreenHeight = window.screen.availHeight


	const getFriends = () => {
		getFrineds();
	}

	async function getFrineds(){
		var friends = await fetchInt();
		setFriends(friends);
		setActiveModal('hint');
	};

	const handleChange = (event) => {
		onChange(event);
	};

	const handleChosenChange = (event) => {
		chosenonChange(event);
	}

	const fetchMy = (event) => {
		fetch_my(event);
	}

	const handleCheckboxChange = (event) => {
		const name = event.target.id;
		const checked = event.target.checked;
		const updatedCheckboxes = [...selectedCheckboxes];
	  
		if (checked) {
		  updatedCheckboxes.push(name);
		} else {
		  updatedCheckboxes.splice(updatedCheckboxes.indexOf(name), 1);
		}
	  
		setSelectedCheckboxes(updatedCheckboxes);
	  };

	const handleChosenCheckboxChange = (event) => {
		const name = event.target.id;
		const checked = event.target.checked;
		const updatedCheckboxes = [...chosenCheckboxes];
	  
		if (checked) {
		  if (updatedCheckboxes.length < 4) {
			updatedCheckboxes.push(name);
		  } else {
			event.target.checked = false;
			return;
		  }
		} else {
		  updatedCheckboxes.splice(updatedCheckboxes.indexOf(name), 1);
		}
	  
		if (updatedCheckboxes.length === 3) {
		  const allCheckboxes = document.getElementsByName('friend');
		  for (let i = 0; i < allCheckboxes.length; i++) {
			if (!updatedCheckboxes.includes(allCheckboxes[i].id)) {
			  allCheckboxes[i].disabled = true;
			}
		  }
		} else {
		  const allCheckboxes = document.getElementsByName('friend');
		  for (let i = 0; i < allCheckboxes.length; i++) {
			allCheckboxes[i].disabled = false;
		  }
		}
	  
		setChosenCheckboxes(updatedCheckboxes);
	  };

	const friendsFiltered = React.useMemo(() => {
		try{ 
			var s = friends.filter( friend  => 
				friend[1].toLowerCase().indexOf(search.toLowerCase()) > -1)
			return s;
		}
		catch (err){
			return []
		}
	}, [friends, search]); 

	const SearchonChange = (e) => {
		setSearch(e.target.value);
	  };

	const friendsToChoose = React.useMemo(() => {
		return friends?.filter(friend => selectedCheckboxes.includes(friend[0].toString())) || [];
	}, [friends, selectedCheckboxes]);

	const modal = (
		<ModalRoot activeModal={activeModal} onClose={() => {setActiveModal(null); 
		setSelectedCheckboxes([null]); setChosenCheckboxes([null]);}}>
				<ModalPage id="modal" settlingHeight={100}>
					<ModalPageHeader 
					after={<PanelHeaderSubmit onClick={() => {handleChange(selectedCheckboxes);
						if(selectedCheckboxes.length>4)
						{setActiveModal('choose_friends')}
						else if (selectedCheckboxes.length>1)
						{handleChosenChange(selectedCheckboxes);go('intpage');}} }
						 data-to={'intpage'} />}
					>
						Друзья
					</ModalPageHeader>
					<Search value={search} onChange={SearchonChange} after={null}/>
						{friendsFiltered.length > 0 && 
          				friendsFiltered.map((friend) =>  
								<Checkbox id={friend[0]} 
								onClick={(event) => handleCheckboxChange(event)}
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
				<ModalPage id='choose_friends' settlingHeight={100}>
					<ModalPageHeader 
					after={<PanelHeaderSubmit onClick={() => {handleChosenChange(chosenCheckboxes)
						;if (chosenCheckboxes?.length == 4){go('intpage')}}} data-to={'intpage'}/>}
					>
						Выберите друзей
					</ModalPageHeader>
					{progress != 100 && 
					<Group>
						<Div>Идёт загрузка. Пожалуйста, подождите... {progress.toFixed(2)}%</Div>
						<Progress appearance="positive" aria-labelledby="progresslabelPositive" 
						value={progress} />
						<Spacing size={16} />
					</Group>

						}
					{progress == 100 && 
						<Group>
							<Div>
							Выберите 3 друзей, для которых хотите посмотреть график с вашими общими тематиками
							</Div>
							{
								friendsToChoose.map((friend) =>
								<Checkbox id={friend[0].toString()} 
								onClick={(event) => handleChosenCheckboxChange(event)}
								checked={chosenCheckboxes.includes(friend[0].toString())}
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
								
								</Checkbox>	)
							}
						</Group>
						
					}
					

				</ModalPage>
				<ModalPage id='hint'>
					<ModalPageHeader 
					after={<PanelHeaderSubmit onClick={() => setActiveModal('modal')}/>}

					>
						Инструкция
					</ModalPageHeader>
					<Div>
						Вам будет предложено выбрать друзей из приведенного списка. Для удобства можно воспользоваться <b>строкой для поиска.</b><br/>
						<br/>
						После нажатия на кнопку в правом верхнем углу, приложение рассчитает 
						пересечение Ваших тематик с тематиками выбранных друзей.<br/><br/>
						При выборе трех и более друзей будет изображен график, на котором отражено количество Ваших общих с выбранными пользователями тематик. 
						<br/><br/>Помимо этого, нажав на кнопку <b>«Показать список всех друзей»</b>, на странице появится пересечение тематик.
						<br/><br/><b>Пример расчета пересечения:</b><br/>
						У вас 12 групп с тематикой «Юмор», а у Вашего друга таких групп 7. Тогда пересечение по тематике «Юмор» равняется 7.
					</Div>
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
						data-to={'info'}
						>
						Меню
					</Button>
				</Div>
				<SplitLayout style={{position: 'relative', 
					display: 'flex', 
					alignItems: 'center', 
					flexDirection: 'column' }}>
				<Div style={
					{position: 'absolute', 
					top: availableScreenWidth * 0.25, 
					paddingTop: 0,
					display: 'flex', 
					alignItems: 'center', 
					flexDirection: 'column' }}>
					<Div style={{position: 'relative', 
					display: 'flex', 
					paddingBottom: 0,
					flexDirection: availableScreenWidth > 600 ? 'row' : 'column', 
					alignItems: 'center'}}>
					<Button className='my_page'
						style={{'backgroundColor': '#2688EB',
						height: availableScreenHeight > 800 ? availableScreenHeight * 0.03 : availableScreenHeight * 0.05,
								width: availableScreenWidth > 600 ? availableScreenWidth * 0.31 : availableScreenWidth * 0.6,
							marginRight: availableScreenWidth > 600 ? 5 : 0,
							marginBottom: availableScreenWidth > 600 ? 0 : 5}}
						onClick={ fetchMy } 
						data-to={"page"} >
						Анализ моей старницы
					</Button>
					
					<Button style={{
						backgroundColor: '#2688EB', 
						height: availableScreenHeight > 800 ? availableScreenHeight * 0.03 : availableScreenHeight * 0.05,
						width: availableScreenWidth > 600 ? availableScreenWidth * 0.31 : availableScreenWidth * 0.6
						}} onClick={ getFriends }>
						Анализ общих тематик
					</Button>
					
					</Div>
					<Div style={
					{position: 'relative', 
					paddingTop: 0, 
					display: 'flex', 
					alignItems: 'center', 
					flexDirection: 'column' }}>
					<FormLayoutGroup mode="horizontal">
						<FormItem 
							top='Узнать про чужую страницу:'  
							status={flag ? '' : 'error'}
							bottom={flag ? "" : 'Введите корректный id, например: 228725426'}
							>
							<Input onChange={get} style={{marginRight: 5,width: availableScreenWidth * 0.5, height: availableScreenHeight * 0.05}} 
							placeholder='Введите id'/>
						</FormItem>
						<Button style={
							{backgroundColor: '#2688EB', height: availableScreenHeight * 0.05}
						} 
						onClick={ fetch_foreign } 
						data-to="page" >
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
