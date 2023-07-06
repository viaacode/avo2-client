import { AssignmentBlockType, AssignmentType } from '../../assignment/assignment.types';

export function getLomLearningResourceTypesFromBlocks(
	blocks: { type: string }[]
): AssignmentType[] {
	const lomLearningResourceTypes = [];
	if (blocks?.find((block) => block.type === AssignmentBlockType.ZOEK)) {
		lomLearningResourceTypes.push(AssignmentType.ZOEK);
	}
	if (blocks?.find((block) => block.type === AssignmentBlockType.BOUW)) {
		lomLearningResourceTypes.push(AssignmentType.BOUW);
	}
	if (blocks?.find((block) => block.type === AssignmentBlockType.ITEM)) {
		lomLearningResourceTypes.push(AssignmentType.KIJK);
	}
	return lomLearningResourceTypes;
}
