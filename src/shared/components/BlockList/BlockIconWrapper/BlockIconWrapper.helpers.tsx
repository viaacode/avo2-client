import {Avo} from '@viaa/avo2-types';

import {ContentTypeNumber} from '../../../../collection/collection.types.js';

import {BlockType} from './BlockIconWrapper.consts.js';

export function getBlockType(type: Avo.Core.BlockItemType, typeId?: ContentTypeNumber): BlockType {
	if (type === Avo.Core.BlockItemType.ITEM) {
		if (typeId === ContentTypeNumber.audio) {
			return BlockType.AUDIO;
		}
		return BlockType.VIDEO;
	}
	return type as unknown as BlockType;
}
