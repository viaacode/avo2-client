import { ButtonProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { isRichTextEmpty } from '../../shared/helpers';

export function useBlockDescriptionButtons(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void
): (block: Avo.Core.BlockItemBase) => { label: string; items: Partial<ButtonProps>[] } {
	const [t] = useTranslation();

	const buttons = useCallback(
		(block: Avo.Core.BlockItemBase): Partial<ButtonProps>[] => [
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
						custom_title:
							(block as AssignmentBlock).original_title || block.item_meta?.title,
						custom_description:
							(block as AssignmentBlock).original_description ||
							block.item_meta?.description,
					});
				},
			},
			{
				active: block.use_custom_fields && isRichTextEmpty(block.custom_description),
				label: t('assignment/views/assignment-edit___geen-beschrijving'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: true,
						custom_title:
							(block as AssignmentBlock).original_title || block.item_meta?.title,
						custom_description: '',
					});
				},
			},
		],
		[setBlock, t]
	);

	return useCallback(
		(block: Avo.Core.BlockItemBase) => ({
			label: t('assignment/views/assignment-edit___titel-en-beschrijving'),
			items: buttons(block),
		}),
		[buttons, t]
	);
}
