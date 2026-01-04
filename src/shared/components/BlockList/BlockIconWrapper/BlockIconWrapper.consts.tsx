import { IconName } from '@viaa/avo2-components';
import { AvoCoreBlockItemBase } from '@viaa/avo2-types';
import { ContentTypeNumber } from '../../../../collection/collection.types';

export enum BlockType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  ZOEK = 'ZOEK',
  BOUW = 'BOUW',
  COLLECTION = 'COLLECTION',
  ASSIGNMENT = 'ASSIGNMENT',
}

export const BLOCK_TYPE_TO_ICON_NAME: Record<BlockType, IconName> = {
  AUDIO: IconName.headphone,
  VIDEO: IconName.video,
  TEXT: IconName.type,
  ZOEK: IconName.search,
  BOUW: IconName.search,
  COLLECTION: IconName.collection,
  ASSIGNMENT: IconName.clipboard,
};

export function GET_BLOCK_ICON(block: AvoCoreBlockItemBase): IconName {
  if (block.type === 'ITEM') {
    if (block.item_meta?.type_id === ContentTypeNumber.audio) {
      return IconName.headphone;
    }
    return IconName.video;
  }

  return BLOCK_TYPE_TO_ICON_NAME[block.type];
}
