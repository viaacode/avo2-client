import { LinkTarget } from '@viaa/avo2-components';

import { PickerSelectItem } from '../../types';

/**
 * Find all blocks that have an anchorId specified and return those anchorIds
 * @param keyword
 * @param limit
 */
export const retrieveAnchorBlocks = async (
	keyword: string | null,
	limit: number
): Promise<PickerSelectItem[]> => {
	let anchorIds: string[] = [];
	document.querySelectorAll('[data-anchor]').forEach(block => {
		const anchorId = block.getAttribute('data-anchor');
		if (anchorId) {
			anchorIds.push(anchorId);
		}
	});
	if (keyword) {
		anchorIds = anchorIds.filter(anchorId =>
			anchorId.toLowerCase().includes(keyword.toLowerCase())
		);
	}
	return anchorIds.slice(0, limit).map(anchorId => ({
		label: anchorId,
		value: {
			value: anchorId,
			type: 'ANCHOR_LINK',
			target: LinkTarget.Self,
		},
	}));
};
