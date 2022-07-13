import { BlockHeading } from '@viaa/avo2-components';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { AssignmentBlockType } from '../../assignment/assignment.types';
import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers';
import { BlockItemComponent } from '../collection.types';

export interface CollectionFragmentTitleProps extends BlockItemComponent {
	canClickHeading?: boolean;
}

const CollectionFragmentTitle: FC<CollectionFragmentTitleProps> = ({ block, canClickHeading }) => {
	const heading = (
		<BlockHeading type="h2">
			{block?.use_custom_fields || block?.type === AssignmentBlockType.TEXT
				? block.custom_title
				: block?.item_meta?.title}
		</BlockHeading>
	);

	if (
		canClickHeading &&
		block &&
		block.type === 'ITEM' &&
		block.item_meta?.type?.label &&
		['video', 'audio'].includes(block.item_meta?.type?.label)
	) {
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, {
			id: block.item_meta.external_id || '',
		});

		return <Link to={link}>{heading}</Link>;
	}

	return heading;
};

export default CollectionFragmentTitle;
