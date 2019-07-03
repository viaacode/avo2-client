import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';
import { Action, Dispatch } from 'redux';

import {
	DetailActionTypes,
	SetDetailErrorAction,
	SetDetailLoadingAction,
	SetDetailSuccessAction,
} from './types';

const getDetail = (id: string) => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { detail } = getState();

		// don't fetch a detail we already have in store
		if (detail[id]) {
			return null;
		}

		dispatch(setDetailLoading(id));

		try {
			const response = await fetch(
				`${process.env.REACT_APP_PROXY_URL}/detail?${queryString.stringify({ id })}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			const data = await response.json();

			return dispatch(setDetailSuccess(id, data as Avo.Detail.Response));
		} catch (e) {
			return dispatch(setDetailError(id));
		}
	};
};

const setDetailSuccess = (id: string, data: Avo.Detail.Response): SetDetailSuccessAction => ({
	id,
	data,
	type: DetailActionTypes.SET_DETAIL_SUCCESS,
});

const setDetailError = (id: string): SetDetailErrorAction => ({
	id,
	type: DetailActionTypes.SET_DETAIL_ERROR,
	error: true,
});

const setDetailLoading = (id: string): SetDetailLoadingAction => ({
	id,
	type: DetailActionTypes.SET_DETAIL_LOADING,
	loading: true,
});

export { setDetailSuccess, setDetailError, setDetailLoading, getDetail };
