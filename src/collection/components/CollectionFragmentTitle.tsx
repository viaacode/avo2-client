import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { BlockHeading } from '@viaa/avo2-components';

import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers';
import { FragmentComponent } from '../collection.types';

export interface CollectionFragmentTitleProps extends FragmentComponent {
	canViewAnyPublishedItems?: boolean;
}

const CollectionFragmentTitle: FC<CollectionFragmentTitleProps> = ({
	fragment,
	canViewAnyPublishedItems,
}) => {
	const heading = (
		<BlockHeading type="h2">
			{fragment.use_custom_fields ? fragment.custom_title : fragment.item_meta?.title}
		</BlockHeading>
	);

	if (
		canViewAnyPublishedItems &&
		fragment.type === 'ITEM' &&
		fragment.item_meta?.type?.label &&
		['video', 'audio'].includes(fragment.item_meta?.type?.label)
	) {
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, {
			id: fragment.item_meta.external_id || '',
		});

		return <Link to={link}>{heading}</Link>;
	}

	return heading;
};

export default CollectionFragmentTitle;
