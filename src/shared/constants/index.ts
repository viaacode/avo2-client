import defaultAudioStillPath from '../../assets/images/audio-still.svg';
import i18n from '../translations/i18n';

export { LANGUAGES } from './languages';
export { ROUTE_PARTS } from './routes';
export {
	WYSIWYG_OPTIONS_DEFAULT,
	WYSIWYG_OPTIONS_AUTHOR,
	WYSIWYG_OPTIONS_FULL,
	WYSIWYG_OPTIONS_ALIGN,
	WYSIWYG_OPTIONS_FULL_WITHOUT_ALIGN,
} from './wysiwyg';

export const DEFAULT_AUDIO_STILL = defaultAudioStillPath;

export const NOT_NOW_LOCAL_STORAGE_KEY = 'AVO.nudging_not_now';
export const NOT_NOW_VAL = 'Yes';

export const ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS =
	'AVO.assignment_overview_back_button_filters';

export function getMoreOptionsLabel() {
	return i18n.t('shared/constants/index___meer-opties');
}
