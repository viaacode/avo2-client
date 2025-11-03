import React, { type FC } from 'react';
import { useParams } from 'react-router';

import { ItemDetail } from './ItemDetail';

import './ItemDetail.scss';

export const ItemDetailRoute: FC = () => {
	const { id } = useParams<{ id: string }>();

	return <ItemDetail key={'item-detail'} id={id} />;
};
