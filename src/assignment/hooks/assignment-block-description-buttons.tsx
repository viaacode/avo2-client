import { ButtonProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isRichTextEmpty } from '../../shared/helpers';

export enum AssignmentBlockItemDescriptionType {
	original = 'original',
	custom = 'custom',
	none = 'none',
}

export function useBlockDescriptionButtons(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void,
	types: AssignmentBlockItemDescriptionType[] = [
		AssignmentBlockItemDescriptionType.original,
		AssignmentBlockItemDescriptionType.custom,
		AssignmentBlockItemDescriptionType.none,
	]
): (block: Avo.Core.BlockItemBase) => { label: string; items: Partial<ButtonProps>[] } {
	const [t] = useTranslation();

	const [edited, setEdited] =
		useState<Pick<Avo.Core.BlockItemBase, 'custom_title' | 'custom_description'>>();

	const editedTitle = (block: Avo.Core.BlockItemBase) =>
		edited?.custom_title || // Grab any transient state
		block.custom_title || // Fall back to any previous custom entry
		(block as AssignmentBlock).original_title || // Fall back to the original block
		block.item_meta?.title; // Fall back to the underlying item

	const editedDescription = (block: Avo.Core.BlockItemBase) =>
		edited?.custom_description || // Grab any transient state
		// block.custom_description || // Do NOT fall back to any previous custom entry
		(block as AssignmentBlock).original_description || // Fall back to the original block
		block.item_meta?.description; // Fall back to the underlying item

	const buttons = useCallback(
		(block: Avo.Core.BlockItemBase): Partial<ButtonProps>[] =>
			types.map((type) => {
				switch (type) {
					case AssignmentBlockItemDescriptionType.original:
						return {
							active: !block.use_custom_fields,
							label: t('assignment/views/assignment-edit___origineel'),
							onClick: () => {
								setBlock(block, {
									use_custom_fields: false,
								});

								// Remember edits
								const { custom_title, custom_description } = block;
								(custom_title || custom_description) &&
									setEdited({ custom_title, custom_description });
							},
						};
					case AssignmentBlockItemDescriptionType.custom:
						return {
							active:
								block.use_custom_fields &&
								!isRichTextEmpty(block.custom_description),
							label: t('assignment/views/assignment-edit___aangepast'),
							onClick: () => {
								setBlock(block, {
									use_custom_fields: true,
									custom_title: editedTitle(block),
									custom_description: editedDescription(block),
								});

								// Wipe edits
								setEdited(undefined);
							},
						};
					case AssignmentBlockItemDescriptionType.none:
						return {
							active:
								block.use_custom_fields &&
								isRichTextEmpty(block.custom_description),
							label: t('assignment/views/assignment-edit___geen-beschrijving'),
							onClick: () => {
								setBlock(block, {
									use_custom_fields: true,
									custom_title: editedTitle(block),
									custom_description: '', // Force to empty
								});

								// Wipe edits
								setEdited(undefined);
							},
						};
				}
			}),
		[setBlock, setEdited, types, t]
	);

	return useCallback(
		(block: Avo.Core.BlockItemBase) => ({
			label: t('assignment/views/assignment-edit___titel-en-beschrijving'),
			items: buttons(block),
		}),
		[buttons, t]
	);
}
