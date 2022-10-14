export function setModalVideoSeekTime(newTime: number): void {
	const video: HTMLVideoElement | null = document.querySelector(
		'.c-modal .c-video-player video'
	) as HTMLVideoElement | null;
	if (video) {
		video.currentTime = newTime;
	}
}
