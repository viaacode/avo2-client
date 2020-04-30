import { History } from 'history';
import { flatten } from 'lodash-es';
import { Reducer, useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ReactAction } from '../../../shared/types';
import { CONTENT_PATH, INITIAL_CONTENT_FORM } from '../content.const';
import { ContentService } from '../content.service';
import { ContentPageEditFormState, ContentWidth, DbContent } from '../content.types';

type SetContentFormParams = Parameters<
	<K extends keyof ContentPageEditFormState>(key: K, value: ContentPageEditFormState[K]) => void
>;

type UseContentPageTuple = [
	ContentPageEditFormState,
	ContentPageEditFormState,
	(...args: SetContentFormParams) => void,
	boolean
];

interface ContentPageState {
	readonly contentForm: ContentPageEditFormState;
	readonly initialContentForm: ContentPageEditFormState;
}

enum ContentPageActionType {
	SET_CONTENT_PAGE_FORM = '@@admin-content-page/SET_CONTENT_PAGE_FORM',
	UPDATE_CONTENT_FORM = '@@admin-content-page/UPDATE_CONTENT_PAGE_FORM',
}

type ContentPageAction = ReactAction<ContentPageActionType>;

const INITIAL_CONTENT_ITEM_STATE = () => ({
	contentForm: INITIAL_CONTENT_FORM(),
	initialContentForm: INITIAL_CONTENT_FORM(),
});

const reducer = (state: ContentPageState, action: ContentPageAction) => {
	switch (action.type) {
		case ContentPageActionType.SET_CONTENT_PAGE_FORM:
			return {
				...state,
				contentForm: action.payload,
				initialContentForm: action.payload,
			};
		case ContentPageActionType.UPDATE_CONTENT_FORM:
			return {
				...state,
				contentForm: {
					...state.contentForm,
					...action.payload,
				},
			};
		default:
			return state;
	}
};

export const useContentPage = (history: History, id?: string): UseContentPageTuple => {
	// Hooks
	const [t] = useTranslation();
	const [{ contentForm, initialContentForm }, dispatch] = useReducer<
		Reducer<ContentPageState, ContentPageAction>
	>(reducer, INITIAL_CONTENT_ITEM_STATE());
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchContentPage = useCallback(async () => {
		if (!id) {
			return;
		}
		try {
			setIsLoading(true);
			const dbContentPage: DbContent | null = await ContentService.getContentPageById(
				Number(id)
			);
			if (dbContentPage) {
				dispatch({
					type: ContentPageActionType.SET_CONTENT_PAGE_FORM,
					payload: {
						thumbnail_path: (dbContentPage as any).thumbnail_path, // Remove cast after update to typings 2.15.0
						title: dbContentPage.title,
						description: dbContentPage.description || '',
						isProtected: dbContentPage.is_protected,
						path: dbContentPage.path,
						contentType: dbContentPage.content_type,
						contentWidth: dbContentPage.content_width || ContentWidth.REGULAR,
						publishAt: dbContentPage.publish_at || '',
						depublishAt: dbContentPage.depublish_at || '',
						userGroupIds: dbContentPage.user_group_ids,
						labels: flatten(
							dbContentPage.content_content_labels.map(link => link.content_label)
						),
					} as Partial<Avo.Content.Content>,
				});
			} else {
				throw new CustomError('Failed to find content page by id');
			}
		} catch (err) {
			console.error(new CustomError('Failed to fetch content page by id', err, { id }));
			ToastService.danger(
				t(
					'admin/content/hooks/use-content-item___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-met-id-id',
					{ id }
				),
				false
			);
			history.push(CONTENT_PATH.CONTENT);
		}
		setIsLoading(false);
	}, [id, history, t, setIsLoading]);

	useEffect(() => {
		fetchContentPage();
	}, [fetchContentPage]);

	// Methods
	const setContentForm = (key: SetContentFormParams[0], value: SetContentFormParams[1]): void => {
		dispatch({
			type: ContentPageActionType.UPDATE_CONTENT_FORM,
			payload: { [key]: value },
		});
	};

	return [initialContentForm, contentForm, setContentForm, isLoading];
};
