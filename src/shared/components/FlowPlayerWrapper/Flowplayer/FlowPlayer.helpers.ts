import { GoogleAnalyticsEvent } from './FlowPlayer.types';

export function setPlayingVideoSeekTime(seekTime: number): void {
	const playingVideo: HTMLVideoElement | null = document.querySelector(
		'.c-video-player .is-playing video'
	) as HTMLVideoElement | null;
	if (playingVideo) {
		playingVideo.currentTime = seekTime;
	}
}

export function getPlayingVideoSeekTime(): number | null {
	const playingVideo: HTMLVideoElement | null = document.querySelector(
		'.c-video-player .is-playing video'
	) as HTMLVideoElement | null;
	if (playingVideo) {
		return playingVideo.currentTime;
	} else {
		return null;
	}
}

export const convertGAEventsArrayToObject = (googleAnalyticsEvents: GoogleAnalyticsEvent[]) => {
	return googleAnalyticsEvents.reduce((acc: any, curr: GoogleAnalyticsEvent) => {
		acc[curr] = curr;

		return acc;
	}, {});
};
