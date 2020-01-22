import { History } from 'history';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Avo } from '@viaa/avo2-types';

import toastService from '../../../shared/services/toast-service';

import { CONTENT_PATH, INITIAL_CONTENT_FORM } from '../content.const';
import { fetchContentItemById } from '../content.service';
import { ContentEditFormState } from '../content.types';

type UseContentItemTuple = [
	ContentEditFormState,
	Dispatch<SetStateAction<ContentEditFormState>>,
	boolean
];

export const useContentItem = (history: History, id?: string): UseContentItemTuple => {
	const [contentForm, setContentForm] = useState<ContentEditFormState>(INITIAL_CONTENT_FORM);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (id) {
			setIsLoading(true);

			fetchContentItemById(Number(id))
				.then((contentItem: Avo.Content.Content | null) => {
					if (contentItem) {
						setContentForm({
							title: contentItem.title,
							description: contentItem.description || '',
							isProtected: contentItem.is_protected,
							path: contentItem.path,
							contentType: contentItem.content_type,
							contentWidth: 'default', // TODO: replace this with correct value
							publishAt: contentItem.publish_at || '',
							depublishAt: contentItem.depublish_at || '',
						});
					} else {
						toastService.danger(
							`Er ging iets mis tijdens het ophalen van de content met id: ${id}`,
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

	return [contentForm, setContentForm, isLoading];
};
