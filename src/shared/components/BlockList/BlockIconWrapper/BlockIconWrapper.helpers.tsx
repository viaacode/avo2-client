import type { Avo } from '@viaa/avo2-types';

import { ContentTypeNumber } from '../../../../collection/collection.types';

import { BlockType } from './BlockIconWrapper.consts';

export function getBlockType(type: Avo.Core.BlockItemType, typeId?: ContentTypeNumber): BlockType {
	if (type === 'ITEM') {
		if (typeId === ContentTypeNumber.audio) {
			return BlockType.AUDIO;
		}
		return BlockType.VIDEO;
	}
	return type as BlockType;
}
