import { History } from 'history';

import { Avo } from '@viaa/avo2-types';

import { redirectToClientPage } from '../../authentication/helpers/redirects';

import { generateContentLinkString } from './link';

export function handleRelatedItemClicked(relatedItem: Avo.Search.ResultItem, history: History) {
	redirectToClientPage(
		generateContentLinkString(relatedItem.administrative_type, relatedItem.id),
		history
	);
}
