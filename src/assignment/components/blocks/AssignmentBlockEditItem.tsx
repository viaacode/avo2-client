import { convertToHtml } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';

import { FilterState } from '../../../search/search.types';
import { BlockItemMetadata, FlowPlayerWrapper } from '../../../shared/components';
import { CustomiseItemForm } from '../../../shared/components/CustomiseItemForm';
import { RICH_TEXT_EDITOR_OPTIONS_AUTHOR } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { isRichTextEmpty } from '../../../shared/helpers';
import { useCutModal } from '../../../shared/hooks/use-cut-modal';
import useTranslation from '../../../shared/hooks/useTranslation';
import {
	AssignmentBlock,
	BaseBlockWithMeta,
	EditableAssignmentBlock,
	EditBlockProps,
} from '../../assignment.types';
import {
	AssignmentBlockDescriptionButtons,
	AssignmentBlockItemDescriptionType,
} from '../AssignmentBlockDescriptionButtons';

function getBlockEditMode(block: BaseBlockWithMeta | EditableAssignmentBlock) {
	if ((block as EditableAssignmentBlock).editMode) {
		return (block as EditableAssignmentBlock).editMode;
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
	EditBlockProps & {
		AssignmentBlockItemDescriptionTypes?: AssignmentBlockItemDescriptionType[];
		buildSearchLink?: (props: Partial<FilterState>) => ReactNode | string;
	}
> = ({ block, setBlock, AssignmentBlockItemDescriptionTypes, buildSearchLink }) => {
	const { tText } = useTranslation();

	const [cutButton, cutModal] = useCutModal();
	const editableBlock = {
		...block,
		editMode: block.editMode || getBlockEditMode(block),
		ownTitle: block.ownTitle ?? (block.custom_title || undefined),
		ownDescription: block.ownDescription ?? (block.custom_description || undefined),
		noTitle: block.noTitle ?? (block.custom_title || undefined),
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
				const item = editableBlock.item_meta as Avo.Item.Item;

				return (
					<>
						<FlowPlayerWrapper
							item={item}
							poster={item.thumbnail_path}
							external_id={item.external_id}
							duration={item.duration}
							title={item.title}
							cuePointsVideo={{
								start: editableBlock.start_oc || null,
								end: editableBlock.end_oc || null,
							}}
							cuePointsLabel={{
								start: editableBlock.start_oc || null,
								end: editableBlock.end_oc || null,
							}}
						/>

						{cutButton({
							className: 'u-spacer-top u-spacer-bottom',
						})}
						{cutModal({
							itemMetaData: item,
							fragment: {
								...block,
								start_oc: block.start_oc ?? null,
								end_oc: block.end_oc ?? null,
								thumbnail_path: block.thumbnail_path ?? null,
								external_id: `${editableBlock.id}`,
							},
							onConfirm: (update) => setBlock({ ...editableBlock, ...update }),
						})}
					</>
				);
			}}
			buttonsLabel={tText(
				'assignment/components/blocks/assignment-block-edit-item___titel-en-beschrijving'
			)}
			buttons={
				<AssignmentBlockDescriptionButtons
					block={editableBlock}
					setBlock={setBlock}
					types={AssignmentBlockItemDescriptionTypes}
				/>
			}
			title={{
				label: tText('assignment/views/assignment-edit___titel-fragment'),
				placeholder: tText(
					'assignment/views/assignment-edit___instructies-of-omschrijving'
				),
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
							label: tText(
								'assignment/views/assignment-edit___beschrijving-fragment'
							),
							initialHtml: convertToHtml(description),
							controls: RICH_TEXT_EDITOR_OPTIONS_AUTHOR,
							enabledHeadings: ['h3', 'h4', 'normal'],
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
			<BlockItemMetadata
				block={editableBlock}
				buildSeriesLink={
					buildSearchLink
						? (series) => buildSearchLink({ filters: { serie: [series] } })
						: undefined
				}
			/>
		</CustomiseItemForm>
	);
};
