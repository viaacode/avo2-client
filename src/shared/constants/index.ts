import defaultAudioStillPath from '../../assets/images/audio-still.svg';
import { tText } from '../helpers/translate';

export { LANGUAGES } from './languages';
export { ROUTE_PARTS } from './routes';

export const DEFAULT_AUDIO_STILL = defaultAudioStillPath;

export const NOT_NOW_LOCAL_STORAGE_KEY = 'AVO.nudging_not_now';
export const NOT_NOW_VAL = 'Yes';

export const ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS =
	'AVO.assignment_overview_back_button_filters';

export function getMoreOptionsLabel(): string {
	return tText('shared/constants/index___meer-opties');
}
