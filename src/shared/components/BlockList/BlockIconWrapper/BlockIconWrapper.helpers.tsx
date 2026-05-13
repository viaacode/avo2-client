import { AvoCoreBlockItemType, AvoCoreContentTypeId } from '@viaa/avo2-types';

import { BlockType } from './BlockIconWrapper.consts';

export function getBlockType(
  type: AvoCoreBlockItemType,
  typeId?: AvoCoreContentTypeId,
): BlockType {
  if (type === AvoCoreBlockItemType.ITEM) {
    if (typeId === AvoCoreContentTypeId.AUDIO) {
      return BlockType.AUDIO;
    }
    return BlockType.VIDEO;
  }
  return type as unknown as BlockType;
}
