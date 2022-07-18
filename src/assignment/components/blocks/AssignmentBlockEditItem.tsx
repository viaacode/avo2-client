import { convertToHtml } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowPlayerWrapper } from '../../../shared/components';
import { CustomiseItemForm } from '../../../shared/components/CustomiseItemForm';
import { WYSIWYG_OPTIONS_AUTHOR } from '../../../shared/constants';
import { isRichTextEmpty } from '../../../shared/helpers';
import { EditableBlockItem, EditBlockProps } from '../../assignment.types';
import {
	AssignmentBlockDescriptionButtons,
	AssignmentBlockItemDescriptionType,
} from '../AssignmentBlockDescriptionButtons';
import { AssignmentBlockMeta } from '../AssignmentBlockMeta';

function getBlockEditMode(block: Avo.Core.BlockItemBase | EditableBlockItem) {
	if ((block as EditableBlockItem).editMode) {
		return (block as EditableBlockItem).editMode;
	}
	if (!block.use_custom_fields) {
		return AssignmentBlockItemDescriptionType.original;
	}
	if (block.use_custom_fields && isRichTextEmpty(block.custom_description)) {
		return AssignmentBlockItemDescriptionType.none;
	}
	return AssignmentBlockItemDescriptionType.custom;
}

export const AssignmentBlockEditItem: FC<
	EditBlockProps & { AssignmentBlockItemDescriptionTypes?: AssignmentBlockItemDescriptionType[] }
> = ({ block, setBlock, AssignmentBlockItemDescriptionTypes }) => {
	const [t] = useTranslation();
	const editableBlock = {
		...block,
		editMode: block.editMode || getBlockEditMode(block),
		ownTitle:
			block.ownTitle ||
			block.custom_title ||
			(block as unknown as AssignmentBlock).original_title ||
			block.item_meta?.title ||
			undefined,
		ownDescription:
			block.ownDescription ||
			block.custom_description ||
			(block as AssignmentBlock).original_description ||
			block.item_meta?.description ||
			undefined,
		noTitle:
			block.noTitle ||
			(block as unknown as AssignmentBlock).original_title ||
			block.item_meta?.title ||
			undefined,
	};

	if (!editableBlock.item_meta) {
		return null;
	}

	let title: string | undefined = undefined;
	if (editableBlock.editMode === AssignmentBlockItemDescriptionType.original) {
		title =
			(editableBlock as unknown as AssignmentBlock).original_title ||
			editableBlock.item_meta?.title;
	} else if (editableBlock.editMode === AssignmentBlockItemDescriptionType.custom) {
		title = editableBlock.ownTitle;
	} else if (editableBlock.editMode === AssignmentBlockItemDescriptionType.none) {
		title = editableBlock.noTitle;
	}

	let description: string | undefined = undefined;
	if (editableBlock.editMode === AssignmentBlockItemDescriptionType.original) {
		description =
			(block as AssignmentBlock).original_description ||
			block.item_meta?.description ||
			undefined;
	} else if (editableBlock.editMode === AssignmentBlockItemDescriptionType.custom) {
		description = editableBlock.ownDescription;
	}
	return (
		<CustomiseItemForm
			className="u-padding-l"
			id={editableBlock.item_meta.id}
			preview={() => {
				const item = editableBlock.item_meta as ItemSchema;

				return (
					<FlowPlayerWrapper
						item={item}
						poster={item.thumbnail_path}
						external_id={item.external_id}
						duration={item.duration}
						title={item.title}
						cuePoints={{
							start: editableBlock.start_oc,
							end: editableBlock.end_oc,
						}}
					/>
				);
			}}
			buttons={
				<AssignmentBlockDescriptionButtons
					block={editableBlock}
					setBlock={setBlock}
					types={AssignmentBlockItemDescriptionTypes}
				/>
			}
			title={{
				label: t('assignment/views/assignment-edit___titel-fragment'),
				placeholder: t('assignment/views/assignment-edit___instructies-of-omschrijving'),
				value: title,
				disabled: editableBlock.editMode === AssignmentBlockItemDescriptionType.original,
				onChange: (value) => {
					if (editableBlock.editMode === AssignmentBlockItemDescriptionType.custom) {
						setBlock({ ...editableBlock, ownTitle: value });
					}
					if (editableBlock.editMode === AssignmentBlockItemDescriptionType.none) {
						setBlock({ ...editableBlock, noTitle: value });
					}
				},
			}}
			description={
				editableBlock.editMode !== AssignmentBlockItemDescriptionType.none
					? {
							label: t('assignment/views/assignment-edit___beschrijving-fragment'),
							initialHtml: convertToHtml(description),
							controls: WYSIWYG_OPTIONS_AUTHOR,
							disabled:
								editableBlock.editMode ===
								AssignmentBlockItemDescriptionType.original,
							onChange: (value) =>
								setBlock({
									...editableBlock,
									ownDescription: value.toHTML(),
								}),
					  }
					: undefined
			}
		>
			<AssignmentBlockMeta block={editableBlock} />
		</CustomiseItemForm>
	);
};
