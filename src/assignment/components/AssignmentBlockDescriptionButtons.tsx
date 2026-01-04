import { Button, ButtonGroup, Select } from '@viaa/avo2-components';
import { type FC } from 'react';

import { tText } from '../../shared/helpers/translate-text';
import { type EditableAssignmentBlock } from '../assignment.types';

import './AssignmentBlockDescriptionButtons.scss';

export enum AssignmentBlockItemDescriptionType {
  original = 'original',
  custom = 'custom',
  none = 'none',
}

const getButtonLabels = (): Record<
  AssignmentBlockItemDescriptionType,
  string
> => ({
  [AssignmentBlockItemDescriptionType.original]: tText(
    'assignment/views/assignment-edit___origineel',
  ),
  [AssignmentBlockItemDescriptionType.custom]: tText(
    'assignment/views/assignment-edit___aangepast',
  ),
  [AssignmentBlockItemDescriptionType.none]: tText(
    'assignment/views/assignment-edit___geen-beschrijving',
  ),
});

const getButtonTooltips = (): Record<
  AssignmentBlockItemDescriptionType,
  string | undefined
> => ({
  [AssignmentBlockItemDescriptionType.original]: tText(
    'assignment/components/assignment-block-description-buttons___zoals-bij-origineel-fragment',
  ),
  [AssignmentBlockItemDescriptionType.custom]: tText(
    'assignment/components/assignment-block-description-buttons___zoals-in-collectie',
  ),
  [AssignmentBlockItemDescriptionType.none]: undefined,
});

interface AssignmentBlockDescriptionButtonsProps {
  block: EditableAssignmentBlock;
  setBlock: (updatedBlock: EditableAssignmentBlock) => void;
  types?: AssignmentBlockItemDescriptionType[];
}

export const AssignmentBlockDescriptionButtons: FC<
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
          block.ownTitle ??
          (block.custom_title || block.original_title || undefined),
        ownDescription:
          block.ownDescription ??
          (block.custom_description || block.original_description || undefined),
      };
    } else if (editMode === AssignmentBlockItemDescriptionType.none) {
      updated = {
        ...updated,
        noTitle:
          block.noTitle ??
          (block.custom_title || block.original_title || undefined),
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
        onChange={(value) =>
          onBlockClicked(value as AssignmentBlockItemDescriptionType)
        }
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
