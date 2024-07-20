import { Flex, FlexItem, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC } from 'react';

import { CollectionBlockType } from '../../../../collection/collection.const';
import { CollectionFragmentRichText } from '../../../../collection/components';
import CollectionFragmentTitle, {
	type CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';
import { tText } from '../../../helpers/translate-text';
import { TextToSpeechButton } from '../../TextToSpeechButton/TextToSpeechButton';

export interface CollectionFragmentTypeTextProps {
	title?: CollectionFragmentTitleProps;
	block?: Avo.Core.BlockItemBase;
}

const CollectionFragmentTypeText: FC<CollectionFragmentTypeTextProps> = ({ title, block }) => {
	const descriptionHtml =
		block?.use_custom_fields || block?.type === CollectionBlockType.TEXT
			? block.custom_description
			: block?.item_meta?.description;
	return (
		<>
			{title && (
				<Flex>
					<FlexItem>
						<CollectionFragmentTitle {...title} />
					</FlexItem>
					{descriptionHtml && (
						<FlexItem shrink>
							<TextToSpeechButton
								text={descriptionHtml}
								buttonLabel={tText('Lees opdracht voor')}
								buttonIcon={IconName.volume2}
							/>
						</FlexItem>
					)}
				</Flex>
			)}
			{block && <CollectionFragmentRichText block={block} />}
		</>
	);
};

export default CollectionFragmentTypeText;
