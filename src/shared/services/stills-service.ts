import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers/env';

export const getVideoStills = async (
	stillRequests: Avo.Stills.StillRequest[]
): Promise<Avo.Stills.StillInfo[]> => {
	try {
		if (!stillRequests || !stillRequests.length) {
			return [];
		}
		const response = await fetch(`${getEnv('PROXY_URL')}/video-stills`, {
			method: 'POST',
			body: JSON.stringify(stillRequests),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	} catch (err) {
		throw new Error('Failed to get video stills');
	}
};

export const getVideoStillsForCollection = async (collection: Avo.Collection.Collection): Promise<Avo.Stills.StillInfo[]> => {
	const stillRequests: Avo.Stills.StillRequest[] = compact(
		collection.collection_fragments.map(fragment =>
			isVideoFragment(fragment)
				? { externalId: fragment.external_id, startTime: (fragment.start_oc || 0) * 1000 }
				: undefined
		)
	);
	return getVideoStills(stillRequests);
};
