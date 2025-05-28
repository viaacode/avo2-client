import { type AppState } from '../store';

export const selectShowNudgingModal = ({ uiState }: AppState) => {
	return uiState?.showNudgingModal;
};

export const selectLastVideoPlayedAt = ({ uiState }: AppState) => {
	return uiState?.lastVideoPlayedAt;
};

export const selectHistoryLocations = ({ uiState }: AppState) => {
	return uiState?.historyLocations || [];
};

export const selectIsSmartSchoolEmbedFlow = ({ uiState }: AppState) => {
	return uiState?.embedFlow === 'smartschool';
};
