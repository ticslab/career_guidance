import React from 'react';
import PropTypes from 'prop-types';
import LineChart  from './LineChart';


import { PanelHeader, Panel, PanelHeaderBack, Cell, Div, Group, Button, Spinner } from '@vkontakte/vkui';

function viewAct(){
	document.getElementById("group").style.display = "block";
	document.getElementById("button").style.display = "none";
  };


const IntersectionPage = (props) => {

    function reset(){
        props.reset();
        props.go('home');
    }

    return(
        <Panel id = {props.id}>
            <PanelHeader
                before={<PanelHeaderBack onClick={reset} data-to="home"/>}
            >
                Тематики друзей
            </PanelHeader>
                    {props.loading && <Spinner size="medium" style={{ margin: '20px 0' }}/>}
                    {!props.loading && 
                    <Group>
                        {props.chartData.length >= 3 &&
                            <Cell style={{flexDirection: 'column', display: 'flex', alignItems: 'center'}}>
                                <LineChart chartData={props.chartData} chartLabels={props.labels} names={props.names}/>
                            </Cell>
                        }
                        
                        <Div style={{flexDirection: 'column', display: props.chartData.length >=3 ? 'flex' : 'none', alignItems: 'center'}}>
                            <Button id='button' style={{backgroundColor: 'rgba(0,0,0,0)', color: '#818C99', fontSize: 16}} onClick={viewAct}>
                                Показать список всех друзей
                            </Button>
                        </Div>
                        <Div id='group' style={{fontSize: '15px', fontWeight: '600', marginBottom: '-20px', display: props.chartData.length >=3 ? 'none' : 'block' }}>
                            <Div>
                                {props.intObject}
                            </Div>
                        </Div>    
                    </Group>
                                            
                    }
                    
            
            
        </Panel>
    )

};
    
IntersectionPage.propTypes = {
    id: PropTypes.string.isRequired,
    prep: PropTypes.func,
    intObject: PropTypes.array,
    reset: PropTypes.func
}

export default IntersectionPage;