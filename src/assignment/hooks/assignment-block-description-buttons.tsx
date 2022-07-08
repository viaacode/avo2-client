import { ButtonProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { isRichTextEmpty } from '../../shared/helpers';

export enum CustomFieldOption {
	original = 'original',
	custom = 'custom',
	none = 'none',
}

export function useBlockDescriptionButtons(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void,
	customFieldOptions: CustomFieldOption[]
	// 		= [
	// 	CustomFieldOption.original,
	// 	CustomFieldOption.custom,
	// 	CustomFieldOption.none,
	// ]
): (block: Avo.Core.BlockItemBase) => { label: string; items: Partial<ButtonProps>[] } {
	const [t] = useTranslation();

	const buttons = useCallback(
		(block: Avo.Core.BlockItemBase): Partial<ButtonProps>[] => {
			const customFieldOptionButtons = [];

			if (customFieldOptions.includes(CustomFieldOption.original)) {
				customFieldOptionButtons.push({
					active: !block.use_custom_fields,
					label: t('assignment/views/assignment-edit___origineel'),
					onClick: () => {
						setBlock(block, {
							use_custom_fields: false,
						});
					},
				});
			}

			if (customFieldOptions.includes(CustomFieldOption.custom)) {
				customFieldOptionButtons.push({
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
				});
			}

			if (customFieldOptions.includes(CustomFieldOption.none)) {
				customFieldOptionButtons.push({
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
				});
			}

			return customFieldOptionButtons;
		},
		[setBlock, customFieldOptions, t]
	);

	return useCallback(
		(block: Avo.Core.BlockItemBase) => ({
			label: t('assignment/views/assignment-edit___titel-en-beschrijving'),
			items: buttons(block),
		}),
		[buttons, t]
	);
}
