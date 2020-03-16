import { History } from 'history';
import { flatten } from 'lodash-es';
import { Reducer, useEffect, useReducer, useState } from 'react';

import { Avo } from '@viaa/avo2-types';

import { ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import { ReactAction } from '../../../shared/types';

import { CONTENT_PATH, INITIAL_CONTENT_FORM } from '../content.const';
import { ContentService } from '../content.service';
import { ContentEditFormState, ContentWidth, DbContent } from '../content.types';

type SetContentFormParams = Parameters<
	<K extends keyof ContentEditFormState>(key: K, value: ContentEditFormState[K]) => void
>;

type UseContentItemTuple = [
	ContentEditFormState,
	ContentEditFormState,
	(...args: SetContentFormParams) => void,
	boolean
];

interface ContentItemState {
	readonly contentForm: ContentEditFormState;
	readonly initialContentForm: ContentEditFormState;
}

enum ContentItemActionType {
	SET_CONTENT_FORM = '@@admin-content-item/SET_CONTENT_FORM',
	UPDATE_CONTENT_FORM = '@@admin-content-item/UPDATE_CONTENT_FORM',
}

type ContentItemAction = ReactAction<ContentItemActionType>;

const INITIAL_CONTENT_ITEM_STATE = () => ({
	contentForm: INITIAL_CONTENT_FORM(),
	initialContentForm: INITIAL_CONTENT_FORM(),
});

const reducer = (state: ContentItemState, action: ContentItemAction) => {
	switch (action.type) {
		case ContentItemActionType.SET_CONTENT_FORM:
			return {
				...state,
				contentForm: action.payload,
				initialContentForm: action.payload,
			};
		case ContentItemActionType.UPDATE_CONTENT_FORM:
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

export const useContentItem = (history: History, id?: string): UseContentItemTuple => {
	// Hooks
	const [{ contentForm, initialContentForm }, dispatch] = useReducer<
		Reducer<ContentItemState, ContentItemAction>
	>(reducer, INITIAL_CONTENT_ITEM_STATE());
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (id) {
			setIsLoading(true);
			ContentService.getContentPageById(Number(id))
				.then((dbContentPage: DbContent | null) => {
					if (dbContentPage) {
						dispatch({
							type: ContentItemActionType.SET_CONTENT_FORM,
							payload: {
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
									dbContentPage.content_content_labels.map(
										link => link.content_label
									)
								),
							} as Partial<Avo.Content.Content>,
						});
					} else {
						ToastService.danger(
							i18n.t(
								'admin/content/hooks/use-content-item___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-met-id-id',
								{ id }
							),
							false
						);
						history.push(CONTENT_PATH.CONTENT);
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [id, history]);

	// Methods
	const setContentForm = (key: SetContentFormParams[0], value: SetContentFormParams[1]): void => {
		dispatch({
			type: ContentItemActionType.UPDATE_CONTENT_FORM,
			payload: { [key]: value },
		});
	};

	return [initialContentForm, contentForm, setContentForm, isLoading];
};
