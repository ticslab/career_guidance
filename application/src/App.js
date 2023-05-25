import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, AdaptivityProvider, AppRoot, ConfigProvider, SplitLayout, SplitCol } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Page from './panels/Page';
import Info from './panels/Info';

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [fetchedId, setId] = useState(0);
	const [groups, setGroups] = useState([]);
	const [boolText, setBool] = useState(true);
	const [maxData, setMax] = useState(null);

	async function fetchGroups (id) {
			var data = '';
			var token = await bridge.send('VKWebAppGetAuthToken', { 
				app_id: 51591939, 
				scope: 'groups'
				});
			data = bridge.send("VKWebAppCallAPIMethod", {"method": "groups.get", "request_id": "getGroups", "params": {"user_id": id, "v":"5.131", "fields":"activity", "extended":"1", "access_token": token.access_token}});
			data.then(
				result => 
				{
					var activity_array = result.response.items.map(item => item.activity);
					var res = activity_array.reduce(function(acc, el) 
					{
						if (el && !(el.match(/заблокирован/)))
						{
							if (el.match(/\d\d:\d\d/))
							{
								el = 'Meeting';
							}
							acc[el] = (acc[el] || 0) + 1;
						}
							return acc;
			  		}, {});
					var g = Object.entries(res);
					g.sort((a, b) => a[1] < b[1] ? 1 : -1)
					console.log(g);
					setGroups(g);
					create_max_data(g.slice(0, 3));
				}, 
				error => 
				{
					setGroups([["Error", error.error_data.error_msg]]);
				});
	};

	function create_max_data (max_d){
		var data = 
		{
			labels: max_d.map(pair => pair[0]),
			datasets: [
				{
				  data: max_d.map(pair => pair[1]),
				  backgroundColor: [
					'#2688EB',
					'#2688EB',
					'#2688EB'
				  ],
				  
				}
			]
		};
		setMax(data);
	};
	
	function onlyNumber (str) {
		return /^\d+$/.test(str);
	};

	const getUserId = e => {
		setId(e.currentTarget.value);
		setBool(onlyNumber(e.currentTarget.value));

	};

	async function go (e) {
		setActivePanel(e.currentTarget.dataset.to);
	};


	async function fetchMyPage (e) {
		go(e);
		var user = await bridge.send("VKWebAppGetUserInfo");
		setUser(user);
		await fetchGroups(user.id);
	};

	async function fetchForeignPage (e) {
		if (onlyNumber(fetchedId))
		{
			go(e);
			var user = await bridge.send("VKWebAppGetUserInfo", {'user_id' : Number(fetchedId)});
			setUser(user);
			await fetchGroups(fetchedId);
		}
		else
		{
			setBool(false);
		}
	};


	return (
		<ConfigProvider>
			<AdaptivityProvider>
				<AppRoot>
					<SplitLayout>
						<SplitCol>
							<View activePanel={activePanel}>
								<Home id='home' fetch_foreign={fetchForeignPage} fetch_my={fetchMyPage} get={getUserId} go={go} flag={boolText}/>
								<Page id='page' groups={groups} go={go} fetchedUser={fetchedUser} max_data={maxData}/>
								<Info id='info' go={go}/>
							</View>
						</SplitCol>
					</SplitLayout>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
}

export default App;
