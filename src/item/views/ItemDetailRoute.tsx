import React, { type FC } from 'react';
import { useMatch } from 'react-router';

import { APP_PATH } from '../../constants';

import { ItemDetail } from './ItemDetail';

import './ItemDetail.scss';

export const ItemDetailRoute: FC = () => {
	const match = useMatch<'id', string>(APP_PATH.ITEM_DETAIL.route);

	return <ItemDetail key={'item-detail'} id={match?.params?.id} />;
};
