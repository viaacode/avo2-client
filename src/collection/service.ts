import queryString from 'query-string';
import { getEnv } from '../shared/helpers/env';

// TODO replace with interface from avo2-types when we release v1.7.0
export interface VideoStill {
	absoluteTimecode: string;
	relativeTimecode: string;
	previewImagePath: string;
	thumbnailImagePath: string;
}

export async function getVideoStills(
	externalIds: string[],
	numberOfStills: number
): Promise<VideoStill[]> {
	try {
		const query: string = queryString.stringify({
			numberOfStills,
			externalIds: externalIds.join(','),
		});
		const response = await fetch(`${getEnv('PROXY_URL')}/video-stills?${query}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	} catch (err) {
		throw {
			message: 'Failed to get video stills',
		};
	}
}
