import { PlayerTokenState } from './types';

export const playerTokenInitialState: PlayerTokenState = Object.freeze({
	data: null,
	loading: false,
	error: false,
});
