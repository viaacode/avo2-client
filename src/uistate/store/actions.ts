import { SetShowNudgingModalAction, UiStateActionTypes } from './types';

export const setShowNudgingModalAction = (data: boolean): SetShowNudgingModalAction => ({
	data,
	type: UiStateActionTypes.SET_SHOW_NUDGING_MODAL,
});
