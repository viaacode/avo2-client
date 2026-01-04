import { AvoContentTypeEnglish, AvoItemItem } from '@viaa/avo2-types';
import { type ReactNode } from 'react';

export interface CuePoints {
  end: number | null;
  start: number | null;
}

export type FlowPlayerWrapperProps = {
  annotationText?: string;
  annotationTitle?: string;
  autoplay?: boolean;
  canPlay?: boolean;
  cuePoints?: CuePoints;
  duration?: string;
  external_id?: string;
  issuedDate?: string;
  item?: AvoItemItem;
  cuePointsVideo?: CuePoints;
  cuePointsLabel?: CuePoints;
  onEnded?: () => void;
  onPlay?: (playingSrc?: string) => void;
  organisationLogo?: string;
  organisationName?: string;
  poster?: string;
  seekTime?: number;
  src?: string | FlowplayerSourceList;
  title?: string;
  topRight?: ReactNode;
  seekable?: boolean;
  ui?: number;
  controls?: boolean;
  speed?: unknown | null;
  trackPlayEvent: boolean;
  placeholder?: boolean;
};

export type Cuepoints = {
  startTime: number | null | undefined;
  endTime: number | null | undefined;
}[];

export interface FlowplayerSourceItem {
  src: string;
  title: string;
  category: AvoContentTypeEnglish;
  provider: string;
  poster: string;
  cuepoints?: Cuepoints;
}

export type FlowplayerSourceListSchema = {
  type: 'flowplayer/playlist';
  items: FlowplayerSourceItem[];
};
export type FlowplayerSourceList = FlowplayerSourceListSchema;
