import queryString from 'query-string';
import { getEnv } from '../shared/helpers/env';

// TODO replace with interface from avo2-types when we release v1.7.0
export interface VideoStill {
	previewImagePath: string;
	thumbnailImagePath: string;
}

export interface StillRequest {
	externalId: string;
	startTime: number; // milliseconds
}

export async function getVideoStills(stillRequests: StillRequest[]): Promise<VideoStill[]> {
	try {
		const response = await fetch(`${getEnv('PROXY_URL')}/video-stills`, {
			method: 'POST',
			body: JSON.stringify(stillRequests),
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
