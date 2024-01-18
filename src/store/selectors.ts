import { AppState } from '../store';

export const selectShowNudgingModal = ({ uiState }: AppState) => {
	return uiState?.showNudgingModal;
};

export const selectLastVideoPlayedAt = ({ uiState }: AppState) => {
	return uiState?.lastVideoPlayedAt;
};
