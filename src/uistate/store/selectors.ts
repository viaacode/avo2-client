import { get } from 'lodash-es';

import { AppState } from '../../store';

export const selectShowNudgingModal = ({ uiState }: AppState) => {
	return get(uiState, ['showNudgingModal']);
};
