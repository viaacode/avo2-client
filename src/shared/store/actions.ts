import { Action, Dispatch } from 'redux';

import { CustomWindow } from '../../shared/types/global';

import {
	PlayerTokenActionTypes,
	PlayerTokenResponse,
	SetPlayerTokenErrorAction,
	SetPlayerTokenLoadingAction,
	SetPlayerTokenSuccessAction,
} from './types';

export const getPlayerTokenState = (externalId: string) => {
	return async (dispatch: Dispatch): Promise<Action | null> => {
		dispatch(setPlayerTokenLoading());

		try {
			const url = `${
				(window as CustomWindow)._ENV_.PROXY_URL
			}/player-ticket?externalId=${externalId}`;

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			const data = await response.json();

			return dispatch(setPlayerTokenSuccess(data.url as PlayerTokenResponse));
		} catch (err) {
			console.error('failed to check player token state', err);
			return dispatch(setPlayerTokenError());
		}
	};
};

export const setPlayerTokenSuccess = (data: PlayerTokenResponse): SetPlayerTokenSuccessAction => ({
	data,
	type: PlayerTokenActionTypes.SET_PLAYER_TOKEN_SUCCESS,
});

export const setPlayerTokenError = (): SetPlayerTokenErrorAction => ({
	type: PlayerTokenActionTypes.SET_PLAYER_TOKEN_ERROR,
	error: true,
});

export const setPlayerTokenLoading = (): SetPlayerTokenLoadingAction => {
	return {
		type: PlayerTokenActionTypes.SET_PLAYER_TOKEN_LOADING,
		loading: true,
	};
};
