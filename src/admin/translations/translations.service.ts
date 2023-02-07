import {
	GetTranslationsDocument,
	GetTranslationsQuery,
	UpdateTranslationsDocument,
	UpdateTranslationsMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services/data-service';

export const fetchTranslations = async (): Promise<any> => {
	try {
		// retrieve translations
		const response = await dataService.query<GetTranslationsQuery>({
			query: GetTranslationsDocument,
		});

		return response?.app_site_variables || null;
	} catch (err) {
		const error = new CustomError('Failed to fetch translations', err, {
			query: 'GET_TRANSLATIONS',
		});

		console.error(error);

		throw error;
	}
};

export const updateTranslations = async (name: string, translations: any) => {
	try {
		// update translation by name
		await dataService.query<UpdateTranslationsMutation>({
			query: UpdateTranslationsDocument,
			variables: {
				name,
				translations,
			},
		});
	} catch (err) {
		const error = new CustomError('Failed to update translations', err, {
			query: 'UPDATE_TRANSLATIONS',
			variables: {
				name,
				translations,
			},
		});

		console.error(error);

		throw error;
	}
};
