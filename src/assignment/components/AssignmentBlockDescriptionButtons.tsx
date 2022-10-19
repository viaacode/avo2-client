import { Button, ButtonGroup, Select } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

import i18n from '../../shared/translations/i18n';
import { EditableAssignmentBlock } from '../assignment.types';

import './AssignmentBlockDescriptionButtons.scss';

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
	block: EditableAssignmentBlock;
	setBlock: (updatedBlock: EditableAssignmentBlock) => void;
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

	const onBlockClicked = (editMode: AssignmentBlockItemDescriptionType) => {
		let updated = { ...block, editMode };

		if (editMode === AssignmentBlockItemDescriptionType.custom) {
			updated = {
				...updated,
				ownTitle:
					block.ownTitle ?? (block.custom_title || block.item_meta?.title || undefined),
				ownDescription:
					block.ownDescription ??
					(block.custom_description || block.item_meta?.description || undefined),
			};
		} else if (editMode === AssignmentBlockItemDescriptionType.none) {
			updated = {
				...updated,
				noTitle:
					block.noTitle ?? (block.custom_title || block.item_meta?.title || undefined),
			};
		}

		setBlock(updated);
	};

	const renderButtons = () => {
		return (
			<ButtonGroup className="c-assignment-block-description-buttons--default">
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

	const renderDropdown = () => {
		return (
			<Select
				className={'c-assignment-block-description-buttons--select'}
				isSearchable={false}
				value={block.editMode}
				options={types.map((type) => {
					return {
						label: BUTTON_LABELS[type],
						value: type,
					};
				})}
				onChange={(value) => onBlockClicked(value as AssignmentBlockItemDescriptionType)}
			/>
		);
	};

	return (
		<>
			{renderButtons()}
			{renderDropdown()}
		</>
	);
};
