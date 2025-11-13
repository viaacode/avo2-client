import { type Avo } from '@viaa/avo2-types'

import { DEFAULT_AUDIO_STILL } from '../constants/index';

export const addDefaultAudioStillToItem = (
  item: Avo.Item.Item,
): Avo.Item.Item => {
  if (item?.type?.label === 'audio') {
    return {
      ...item,
      thumbnail_path: DEFAULT_AUDIO_STILL,
    }
  }

  return item
}
