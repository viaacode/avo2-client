import { type FlowplayerTrackSchema } from '@meemoo/react-components';
import { AvoItemItem, AvoItemSubtitle } from '@viaa/avo2-types';
import { getEnv } from './env';
import { tText } from './translate-text';

export function getSubtitles(
  item: AvoItemItem | undefined | null,
): FlowplayerTrackSchema[] | undefined {
  const collaterals = item?.item_collaterals || [];
  if (!collaterals.length) {
    return undefined;
  }
  return collaterals.map(
    (collateral: AvoItemSubtitle, index: number): FlowplayerTrackSchema => {
      return {
        id: collateral.external_id,
        default: index === 0,
        src: `${getEnv('PROXY_URL')}/subtitles/convert-srt-to-vtt${collateral.path}`,
        label: tText('shared/helpers/get-subtitles___nederlands') + (index + 1),
      };
    },
  );
}
