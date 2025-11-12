import { type Avo } from '@viaa/avo2-types';
import React, { type FC } from 'react';

import { CollectionFragmentRichText } from '../../../../collection/components/CollectionFragmentRichText.js';
import {
	CollectionFragmentTitle,
	type CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle.js';

export interface CollectionFragmentTypeTextProps {
	title?: CollectionFragmentTitleProps;
	block?: Avo.Core.BlockItemBase;
}

export const CollectionFragmentTypeText: FC<CollectionFragmentTypeTextProps> = ({
	title,
	block,
}) => {
	return (
		<>
			{title && <CollectionFragmentTitle {...title} />}
			{block && <CollectionFragmentRichText block={block} />}
		</>
	);
};
