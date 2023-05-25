import React from 'react';
import PropTypes from 'prop-types';

import { PanelHeader, Panel, PanelHeaderBack, Div, Link, Group, SimpleCell } from '@vkontakte/vkui';
import { Icon28GlobeOutline,Icon28MailOutline } from '@vkontakte/icons';

const Info = props => (
    <Panel id = {props.id}>
        <PanelHeader
			before={<PanelHeaderBack onClick={props.go} data-to="home"/>}
		>
            Информация
		</PanelHeader>
        <Group>
            <Div style={{fontSize: '25px', fontWeight: '600', marginBottom: '-20px'}}>
            ТиМПИ — 
            </Div>
            <Div>
            лаборатория теоретических и междисциплинарных проблем информатики
            </Div>
            <SimpleCell before={<Icon28GlobeOutline />}>
                <Link href='https://dscs.pro/'>Сайт лаборатории ТиМПИ</Link>
            </SimpleCell>
            <SimpleCell indicator="st087200@student.spbu.ru" before={<Icon28MailOutline />}>
            Email
          </SimpleCell>
        </Group>
    </Panel>
);

Info.propTypes = {
    id: PropTypes.string.isRequired,
}

export default Info;