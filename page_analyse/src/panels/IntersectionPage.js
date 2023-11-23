import React from 'react';
import PropTypes from 'prop-types';

import { PanelHeader, Panel, PanelHeaderBack, Div,InfoRow, Link, Group, SimpleCell, Button, Avatar, Spinner } from '@vkontakte/vkui';

const IntersectionPage = (props) => {

    return(
        <Panel id = {props.id}>
            <PanelHeader
                before={<PanelHeaderBack onClick={props.go} data-to="home"/>}
            >
                Тематики друзей
            </PanelHeader>
                <Group>
                    {props.loading && <Spinner size="medium" style={{ margin: '20px 0' }}/>}
                    {!props.loading && 
                        <Div style={{fontSize: '15px', fontWeight: '600', marginBottom: '-20px'}}>
                            <Div>
                                {props.intObject}
                            </Div>
                        </Div>
                    }
                    
                </Group>
            
            
        </Panel>
    )

};
    
IntersectionPage.propTypes = {
    id: PropTypes.string.isRequired,
    prep: PropTypes.func,
    intObject: PropTypes.array
}

export default IntersectionPage;