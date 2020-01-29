import { Reducer } from 'react';

import { ContentOverviewState } from '../../content.types';

export enum ContentOverviewActionType {
	SET_FILTER_FORM = '@@admin-content-overview/SET_FILTER_FORM',
	UPDATE_FILTER_FORM = '@@admin-content-overview/UPDATE_FILTER_FORM',
}

type ReactAction<T, P = any> = { type: T; payload: P };
type ContentOverviewAction = ReactAction<ContentOverviewActionType>;

export type ContentOverviewReducer = Reducer<ContentOverviewState, ContentOverviewAction>;

export const contentOverviewReducer = (
	state: ContentOverviewState,
	action: ContentOverviewAction
): ContentOverviewState => {
	const { payload, type } = action;

	switch (type) {
		case ContentOverviewActionType.SET_FILTER_FORM:
			return { ...state, filterForm: payload };
		case ContentOverviewActionType.UPDATE_FILTER_FORM:
			return {
				...state,
				filterForm: {
					...state.filterForm,
					...payload,
				},
			};
		default:
			return state;
	}
};
