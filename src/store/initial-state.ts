import { type UiState } from './types';

const initialState: UiState = Object.freeze({
	showNudgingModal: null,
	lastVideoPlayedAt: null,
	historyLocations: [],
	embedFlow: null,
});

export default initialState;
