import defaultAudioStillPath from '../../assets/images/audio-still.svg';
import { tText } from '../helpers/translate';

export { LANGUAGES } from './languages';
export { ROUTE_PARTS } from './routes';

export const DEFAULT_AUDIO_STILL = defaultAudioStillPath;

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const NOT_NOW_LOCAL_STORAGE_KEY = 'AVO.nudging_not_now';
export const NOT_NOW_VAL = 'Yes';

export const ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS =
	'AVO.assignment_overview_back_button_filters';

export function getMoreOptionsLabel(): string {
	return tText('shared/constants/index___meer-opties');
}
// Refetch interval of 15 seconds
export const EDIT_STATUS_REFETCH_TIME = 15_000;
// Initial time of 1 minute until warning modal pops up
export const IDLE_TIME_UNTIL_WARNING = 60_000;
// Max idle time of 14 minutes after warning modal pops up
export const MAX_EDIT_IDLE_TIME = 840_000;
