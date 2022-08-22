import { Avo } from '@viaa/avo2-types';
import React, { FC } from 'react';

import { CollectionFragmentRichText } from '../../../../collection/components';
import CollectionFragmentTitle, {
	CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';

export interface CollectionFragmentTypeTextProps {
	title?: CollectionFragmentTitleProps;
	block?: Avo.Core.BlockItemBase;
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
