import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { CollectionBlockType } from '../collection.const';
import { type BlockItemComponent, ContentTypeNumber } from '../collection.types';

import './CollectionFragmentTitle.scss';
import { buildLink } from '../../shared/helpers/build-link';

export interface CollectionFragmentTitleProps extends BlockItemComponent {
	canClickHeading?: boolean;
}

const CollectionFragmentTitle: FC<CollectionFragmentTitleProps> = ({ block, canClickHeading }) => {
	const heading = (
		<BlockHeading type="h2" className="c-collection-fragment-title">
			{block?.use_custom_fields || block?.type === CollectionBlockType.TEXT
				? block.custom_title || block?.item_meta?.title
				: (block as Avo.Assignment.Block).original_title || block?.item_meta?.title}
		</BlockHeading>
	);

	if (
		canClickHeading &&
		block &&
		block.type === 'ITEM' &&
		block.item_meta?.type_id &&
		[ContentTypeNumber.video, ContentTypeNumber.audio].includes(block.item_meta?.type_id)
	) {
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, {
			id: (block.item_meta as Avo.Item.Item).external_id || '',
		});

		return <Link to={link}>{heading}</Link>;
	}

	return heading;
};

export default CollectionFragmentTitle;
