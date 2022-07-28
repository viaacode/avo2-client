import { Avo } from '@viaa/avo2-types';

import { AssignmentBlockType, EditableBlockItem } from '../assignment.types';
import { AssignmentBlockItemDescriptionType } from '../components/AssignmentBlockDescriptionButtons';

/**
 * To be able to keep track of the custom_title and custom_description for all editModes: original, custom and none, we need som extra fields to store these values
 * So the EditableBlockItem interface was created to store:
 *  - ownTitle
 *  - ownDescription
 *  - noTitle
 *
 * These fields are used to store the values while the user is editing the assignment/pupil collection
 * Once the save button is pressed, we need to collapse these fields back to:
 *  - use_custom_fields
 *  - custom_title
 *  - custom_description
 *
 * This function does that collapsing
 * @param blocks
 */
export function cleanupTitleAndDescriptions(
	blocks: EditableBlockItem[] = []
): Avo.Core.BlockItemBase[] {
	return blocks.map((block) => {
		if (block.type === AssignmentBlockType.ITEM) {
			switch (block.editMode) {
				case AssignmentBlockItemDescriptionType.original:
					block.use_custom_fields = false;
					break;
				case AssignmentBlockItemDescriptionType.custom:
					block.custom_title = block.ownTitle || null;
					block.custom_description = block.ownDescription || null;
					block.use_custom_fields = true;
					break;
				case AssignmentBlockItemDescriptionType.none:
					block.custom_title = block.noTitle || null;
					block.custom_description = null;
					block.use_custom_fields = true;
					break;
			}
		}

		delete block.editMode;
		delete block.ownTitle;
		delete block.ownDescription;
		delete block.noTitle;

		return block;
	});
}
