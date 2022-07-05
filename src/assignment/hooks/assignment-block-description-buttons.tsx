import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { isRichTextEmpty } from '../../shared/helpers';

export function useAssignmentBlockDescriptionButtons(
	setBlock: (block: AssignmentBlock, update: Partial<AssignmentBlock>) => void
) {
	const [t] = useTranslation();

	const buttons = useCallback(
		(block: AssignmentBlock) => [
			{
				active: !block.use_custom_fields,
				label: t('assignment/views/assignment-edit___origineel'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: false,
					});
				},
			},
			{
				active: block.use_custom_fields && !isRichTextEmpty(block.custom_description),
				label: t('assignment/views/assignment-edit___aangepast'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: true,
						custom_title: block.original_title || block.item_meta?.title,
						custom_description:
							block.original_description || block.item_meta?.description,
					});
				},
			},
			{
				active: block.use_custom_fields && isRichTextEmpty(block.custom_description),
				label: t('assignment/views/assignment-edit___geen-beschrijving'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: true,
						custom_title: block.original_title || block.item_meta?.title,
						custom_description: '',
					});
				},
			},
		],
		[setBlock, t]
	);

	return useCallback(
		(block: AssignmentBlock) => ({
			label: t('assignment/views/assignment-edit___titel-en-beschrijving'),
			items: buttons(block),
		}),
		[buttons, t]
	);
}
