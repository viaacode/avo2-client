import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';
import { Action, Dispatch } from 'redux';

import {
	ItemActionTypes,
	SetItemErrorAction,
	SetItemLoadingAction,
	SetItemSuccessAction,
} from './types';

const getItem = (id: string) => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { item } = getState();

		// don't fetch a item we already have in store
		if (item[id]) {
			return null;
		}

		dispatch(setItemLoading(id));

		try {
			const response = await fetch(
				`${process.env.REACT_APP_PROXY_URL}/item?${queryString.stringify({ id })}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				}
			);

			const data = await response.json();

			return dispatch(setItemSuccess(id, data as Avo.Item.Response));
		} catch (e) {
			return dispatch(setItemError(id));
		}
	};
};

const setItemSuccess = (id: string, data: Avo.Item.Response): SetItemSuccessAction => ({
	id,
	data,
	type: ItemActionTypes.SET_ITEM_SUCCESS,
});

const setItemError = (id: string): SetItemErrorAction => ({
	id,
	type: ItemActionTypes.SET_ITEM_ERROR,
	error: true,
});

const setItemLoading = (id: string): SetItemLoadingAction => ({
	id,
	type: ItemActionTypes.SET_ITEM_LOADING,
	loading: true,
});

export { setItemSuccess, setItemError, setItemLoading, getItem };
