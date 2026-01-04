import { AvoItemItem } from '@viaa/avo2-types';

import { DEFAULT_AUDIO_STILL } from '../constants';

export const addDefaultAudioStillToItem = (item: AvoItemItem): AvoItemItem => {
  if (item?.type?.label === 'audio') {
    return {
      ...item,
      thumbnail_path: DEFAULT_AUDIO_STILL,
    };
  }

  return item;
};
