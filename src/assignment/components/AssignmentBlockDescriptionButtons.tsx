import { Button, ButtonGroup } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

import i18n from '../../shared/translations/i18n';
import { EditableBlockItem } from '../assignment.types';

export enum AssignmentBlockItemDescriptionType {
	original = 'original',
	custom = 'custom',
	none = 'none',
}

const getButtonLabels = (): Record<AssignmentBlockItemDescriptionType, string> => ({
	[AssignmentBlockItemDescriptionType.original]: i18n.t(
		'assignment/views/assignment-edit___origineel'
	),
	[AssignmentBlockItemDescriptionType.custom]: i18n.t(
		'assignment/views/assignment-edit___aangepast'
	),
	[AssignmentBlockItemDescriptionType.none]: i18n.t(
		'assignment/views/assignment-edit___geen-beschrijving'
	),
});

const getButtonTooltips = (): Record<AssignmentBlockItemDescriptionType, string | undefined> => ({
	[AssignmentBlockItemDescriptionType.original]: i18n.t(
		'assignment/components/assignment-block-description-buttons___zoals-bij-origineel-fragment'
	),
	[AssignmentBlockItemDescriptionType.custom]: i18n.t(
		'assignment/components/assignment-block-description-buttons___zoals-in-collectie'
	),
	[AssignmentBlockItemDescriptionType.none]: undefined,
});

export interface AssignmentBlockDescriptionButtonsProps {
	block: EditableBlockItem;
	setBlock: (updatedBlock: EditableBlockItem) => void;
	types?: AssignmentBlockItemDescriptionType[];
}

export const AssignmentBlockDescriptionButtons: FunctionComponent<
	AssignmentBlockDescriptionButtonsProps
> = ({
	block,
	setBlock,
	types = [
		AssignmentBlockItemDescriptionType.original,
		AssignmentBlockItemDescriptionType.custom,
		AssignmentBlockItemDescriptionType.none,
	],
}) => {
	const BUTTON_LABELS = getButtonLabels();
	const BUTTON_TOOLTIPS = getButtonTooltips();

	const onBlockClicked = (type: AssignmentBlockItemDescriptionType) => {
		if (type === AssignmentBlockItemDescriptionType.original) {
			setBlock({
				...block,
				editMode: AssignmentBlockItemDescriptionType.original,
			});
		} else if (type === AssignmentBlockItemDescriptionType.custom) {
			setBlock({
				...block,
				editMode: AssignmentBlockItemDescriptionType.custom,
				ownTitle:
					block.ownTitle ?? (block.custom_title || block.item_meta?.title || undefined),
				ownDescription:
					block.ownDescription ??
					(block.custom_description || block.item_meta?.description || undefined),
			});
		} else if (type === AssignmentBlockItemDescriptionType.none) {
			setBlock({
				...block,
				editMode: AssignmentBlockItemDescriptionType.none,
				noTitle:
					block.noTitle ?? (block.custom_title || block.item_meta?.title || undefined),
			});
		}
	};

	return (
		<ButtonGroup>
			{types.map((type) => {
				return (
					<Button
						type="secondary"
						active={block.editMode === type}
						label={BUTTON_LABELS[type]}
						title={BUTTON_TOOLTIPS[type]}
						onClick={() => onBlockClicked(type)}
						key={'customise-item-form__button--' + block.id + '--' + type}
					/>
				);
			})}
		</ButtonGroup>
	);
};
