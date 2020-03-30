import { ReactAction } from '../../shared/types';

export enum TranslationsActionType {
	SET_TRANSLATIONS = '@@admin-translations/SET_TRANSLATIONS',
	UPDATE_TRANSLATIONS = '@@admin-translations/UPDATE_TRANSLATIONS',
}

export type TranslationsAction = ReactAction<TranslationsActionType>;

export type Translation = [string, string];

export interface TranslationsState {
	name: string;
	value: any;
}
