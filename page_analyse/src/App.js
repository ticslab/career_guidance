import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, AdaptivityProvider, AppRoot, ConfigProvider, SplitLayout, Div,Avatar,InfoRow,  SplitCol } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import axios from 'axios';

import Home from './panels/Home';
import Page from './panels/Page';
import Info from './panels/Info';
import IntersectionPage from './panels/IntersectionPage';



const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [fetchedId, setId] = useState(0);
	const [groups, setGroups] = useState([]);
	const [boolText, setBool] = useState(true);
	const [maxData, setMax] = useState(null);
	const [predictedType, setType] = useState(Object());
	const [loading, setLoading] = useState(true);
	const [intObject, setIntObject] = useState([]);
	const [chartData, setChartData] = useState([]);
	const [labels, setLabels] = useState([]);
	const [names, setNames] = useState([]);


	async function handleChange(value){
		if (!loading){
			setLoading(true);
		};
		var res = await getIntersection(value);
		var s = await prepare(res);
		setIntObject(s);
	};


	async function sendAct(flag, g){
		try {
			if (flag){
				if (!loading){
					setLoading(true);
				};
				var res = await axios.post('http://127.0.0.1:5000/act', g, {'Content-Type': 'application/json', 'charset': 'utf-8'})
				setType(res.data);
				setLoading(false);
			}
			
        } catch (err) {
            console.log(err);
        }
    }

	async function fetchFriends(id){
		var token = await bridge.send('VKWebAppGetAuthToken', { 
			app_id: 51591939, 
			scope: 'friends'
			});
		var data = '';
		data = await bridge.send("VKWebAppCallAPIMethod", {"method": "friends.get", "request_id": "getFriends",  "params": {"user_id": id, "v":"5.131","fields": "photo_100", "access_token": token.access_token}});
		return data.response.items;
	}

	async function fetchGroups (id,flag, sex) {
			var data = '';
			var token = await bridge.send('VKWebAppGetAuthToken', { 
				app_id: 51591939, 
				scope: 'groups'
				});
			data = await bridge.send("VKWebAppCallAPIMethod", {"method": "groups.get", "request_id": "getGroups", "params": {"user_id": id, "v":"5.131", "fields":"activity", "extended":"1", "access_token": token.access_token}});
			try{
				var activity_array = data.response.items.map(item => item.activity);
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
					g.sort((a, b) => a[1] < b[1] ? 1 : -1);
					if (sex){	
						setGroups(g);
						create_max_data(g.slice(0, 3));
						var send_groups = g.slice(0);
						send_groups.push(['sex', sex]);
						await sendAct(flag, send_groups);
					}			
					else{
						return res;
					};
			}
			catch{
				setGroups([["Error", error.error_data.error_msg]]);
			};
	};

	const intersectionOfTwoObjects = (firstObject, secondObject) => {
		const newObj = {};
		
		for (const key in firstObject) { 
			if (key in secondObject) {
				newObj[key] = Math.min(firstObject[key], secondObject[key]);
			}
		}          
		
		return newObj;
	};

	function transformArray(arr) {
		var count = {};
	  
		for (var i = 1; i < arr.length; i++) {
		  if (count[arr[i]] === undefined) {
			count[arr[i]] = 1;
		  } else {
			count[arr[i]]++;
		  }
		}
	  
		var result = [];
	  
		for (var i = 1; i < arr.length; i++) {
		  if (count[arr[i]] % 2 === 0) {
			continue;
		  }
	  
		  if (!result.includes(arr[i])) {
			result.push(arr[i]);
		  }
		}
		result.sort((a, b) => a - b);
		return result;
	};

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	  }

	function intersectForPicture(my, result, all_g, all_act){
		var data = [];
		var randoms = [];
		var rnd = 0;
		try{
			for (let j=0;j<4;j++){
				rnd = getRandomInt(4);
				randoms.push(all_act[rnd]);
				all_act.splice(rnd, 1);
			};
			var keys = Object.keys(all_g);
			var names = [];
			for (var key in keys){
				for (let t=0; t < result[result.length-1].length;t++){
					if (keys[key] == result[result.length-1][t].id.toString()){
						names.push(result[result.length-1][t].first_name + ' ' + result[result.length-1][t].last_name)
					};
				};
			};
			setNames(names);
			for (let i=0;i<randoms.length;i++){
				var line = [];
				for (let j=0;j< randoms.length; j++){
					if (i == 0){
						line.push(my[randoms[j]]);
					}
					else{
						line.push(all_g[keys[i-1]][randoms[j]] ? all_g[keys[i-1]][randoms[j]] : 0);
	
					}
				}
				var sum_of_others = 0;
				if (i == 0){
					for (let key in my){
						if (!randoms.includes(key)){
							sum_of_others += my[key]
						}
					}
				}
				else{
					for (let key in all_g[keys[i-1]]){
						if (!randoms.includes(key)){
							sum_of_others += all_g[keys[i-1]][key]
						}
					}
				}
				// line.push(sum_of_others);
				data.push(line);
			};
			// randoms.push('Остальное');
			setChartData(data);
			setLabels(randoms);
		}
		catch{
			setChartData([]);
			setLabels([]);
		}
		
	}

	async function getIntersection(user_list){
		try{
			if (user_list.includes(null) || user_list[0] != fetchedUser.id){
				user_list[0] = fetchedUser.id;
			}
		}
		catch{

		}
		var result = [];			
		var token = await bridge.send('VKWebAppGetAuthToken', { 
			app_id: 51591939, 
			scope: 'friends'
			});
		var all_g = Object();
		var my_act = await fetchGroups(user_list[0], 0);
		var u_list = transformArray(user_list);
		let sleep = ms => new Promise(res=>setTimeout(res,ms));
		var data = Object.entries(await bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "request_id": "getUsers", "params": {"user_ids": u_list.toString(), "v":"5.131","fields": "photo_100", "access_token": token.access_token}}));
		var all_activities_in_intersection = []
		for (let i=0;i<u_list.length;++i){
			var g = await fetchGroups(u_list[i], 0);
			
				
			all_g[u_list[i]] = g;
			if (u_list.length>7){
				await sleep(500);
				console.log(1);
			};
			var intersection = intersectionOfTwoObjects(my_act, g)
			var keys = Object.keys(intersection);
			if (i==0){
				all_activities_in_intersection = keys;
			}
			else{
				for (let j=0; j<keys.length;j++){
					if (!all_activities_in_intersection.includes(keys[j])){
						all_activities_in_intersection.push(keys[j]);
					}
				}
			}
			result.push(Object.entries(intersection));
		}
		result.push(data[0][1]);
		intersectForPicture(my_act, result, all_g, all_activities_in_intersection);
		return result;
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
		if (typeof(e) === 'string'){
			setActivePanel(e);
		}
		else{
			setActivePanel(e.currentTarget.dataset.to);
		}
	};

	async function fetchIntersection(){
		var user = await bridge.send("VKWebAppGetUserInfo");
		setUser(user);
		var fr = await fetchFriends(user.id);
		fr = fr.map(friend => [friend.id, friend.first_name + ' ' + friend.last_name, friend.photo_100]);
		return fr;
	};

	async function fetchMyPage (e) {
		go(e);
		setId(0);
		var user = await bridge.send("VKWebAppGetUserInfo");
		setUser(user);
		await fetchGroups(user.id,true, user.sex);
	};

	async function fetchForeignPage (e) {
		if (onlyNumber(fetchedId))
		{
			setLoading(false);
			go(e);
			var user = await bridge.send("VKWebAppGetUserInfo", {'user_id' : Number(fetchedId)});
			setUser(user);
			await fetchGroups(fetchedId,false, user.sex);
		}
		else
		{
			setBool(false);
		}
	};


	const makeList = (obj) =>{
        var lines = [];
        for (let i=0;i<obj.length;i++){
            lines.push(<InfoRow header={obj[i][0]}>{obj[i][1]}</InfoRow>);
        }
        return lines;
    };

    async function prepare(res){
        var lines = [];
        if (res){
            for (let i=0;i<res.length-1;i++){
                lines.push(
                    <Div>
                        <Div style={{position: 'relative', 
							display: 'flex', 
							alignItems: 'center',
							padding: '0px 0px'}}>
                            <Avatar src={res[res.length-1][i]['photo_100']} style={{marginRight: '5px', marginBottom: '5px'}}/>
                            {res[res.length-1][i]['first_name'] + ' ' + res[res.length-1][i]['last_name']}
                        </Div>
                    {makeList(res[i])}
                    </Div>
                );
                
            };
        };
		setLoading(false);
        return lines;
    };


	return (
		<ConfigProvider>
			<AdaptivityProvider>
				<AppRoot>
					<SplitLayout>
						<SplitCol>
							<View activePanel={activePanel}>
								<Home id='home' fetch_foreign={fetchForeignPage} fetch_my={fetchMyPage} get={getUserId} go={go} flag={boolText} fetch_int={fetchIntersection} onChange={handleChange} user={fetchedUser} />
								<Page id='page' groups={groups} go={go} fetchedUser={fetchedUser} max_data={maxData} type={predictedType} loading={loading} fId={Boolean(fetchedId)}/>
								<Info id='info' go={go}/>
								<IntersectionPage id='intpage' go={go} intObject={intObject} loading={loading} chartData={chartData} labels={labels} names={names}/>
							</View>
						</SplitCol>
					</SplitLayout>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
}

export default App;
