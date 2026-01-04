import { AvoCoreBlockItemType } from '@viaa/avo2-types';
import { ContentTypeNumber } from '../../../../collection/collection.types';
import { BlockType } from './BlockIconWrapper.consts';

export function getBlockType(
  type: AvoCoreBlockItemType,
  typeId?: ContentTypeNumber,
): BlockType {
  if (type === AvoCoreBlockItemType.ITEM) {
    if (typeId === ContentTypeNumber.audio) {
      return BlockType.AUDIO;
    }
    return BlockType.VIDEO;
  }
  return type as unknown as BlockType;
}
