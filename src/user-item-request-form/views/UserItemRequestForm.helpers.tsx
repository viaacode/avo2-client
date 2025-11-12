import queryString from 'query-string';
import { type ReactNode } from 'react';

import { isPhoto } from '../../shared/helpers/files.js';
import { tText } from '../../shared/helpers/translate-text.js';

export function renderAttachment(
	attachmentUrl: string | null,
	wantsToUploadAttachment: boolean
): ReactNode {
	const filename =
		queryString.parse((attachmentUrl || '').split('?').pop() || '')?.name ||
		tText('user-item-request-form/views/user-item-request-form___bestand');
	if (wantsToUploadAttachment && attachmentUrl) {
		if (isPhoto(attachmentUrl)) {
			return `<img src="${attachmentUrl}" alt="Bijlage"/>`;
		}
		return `<a href="${attachmentUrl}">${filename}</a>`;
	}
	return tText(
		'user-item-request-form/views/user-item-request-form___er-werd-geen-bijlage-toegevoegd'
	);
}
