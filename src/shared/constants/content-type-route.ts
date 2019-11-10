import { Avo } from '@viaa/avo2-types';

import { RouteParts } from '../../constants';

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: RouteParts.Item,
	audio: RouteParts.Item,
	collectie: RouteParts.Collection,
	bundel: RouteParts.Folder,
};
