import { type Avo } from '@viaa/avo2-types';

import { isPupil } from '../../shared/helpers/is-pupil';
import { isTeacher } from '../../shared/helpers/is-teacher';
import { type MinimalClientEvent } from '../../shared/services/event-logging-service';
import { type EmbedCode } from '../embed-code.types';

export function createResource(
	embedCode: EmbedCode,
	commonUser: Avo.User.CommonUser
): MinimalClientEvent['resource'] {
	const content = embedCode.content as Avo.Item.Item;
	return {
		// User related
		profileId: commonUser?.profileId || '',
		isTeacher: isTeacher(commonUser?.userGroup?.id),
		isPupil: isPupil(commonUser?.userGroup?.id),

		// Content related
		pidVideo: embedCode.contentId,
		organisation: content.organisation?.name,

		// Embed code related
		externalWebsite: embedCode.externalWebsite,
	};
}
