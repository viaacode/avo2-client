import React, { FC } from 'react';

import { BaseBlockWithMeta } from '../../../../assignment/assignment.types';
import { CollectionFragmentRichText } from '../../../../collection/components';
import CollectionFragmentTitle, {
	CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';

export interface CollectionFragmentTypeTextProps {
	title?: CollectionFragmentTitleProps;
	block?: BaseBlockWithMeta;
}

const CollectionFragmentTypeText: FC<CollectionFragmentTypeTextProps> = ({ title, block }) => {
	return (
		<>
			{title && <CollectionFragmentTitle {...title} />}
			{block && <CollectionFragmentRichText block={block} />}
		</>
	);
};

export default CollectionFragmentTypeText;
