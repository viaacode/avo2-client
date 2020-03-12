import { TranslationsAction, TranslationsActionType } from './translations.types';

export const translationsReducer = (state: any, action: TranslationsAction) => {
	switch (action.type) {
		case TranslationsActionType.SET_TRANSLATIONS:
			return action.payload;
		case TranslationsActionType.UPDATE_TRANSLATIONS:
			return {
				...state,
				value: action.payload,
			};
		default:
			return state;
	}
};
