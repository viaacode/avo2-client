export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const EXTENSION_TO_TYPE: { [extension: string]: string } = {
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	mp4: 'video/mp4',
	webm: 'video/webm',
};

export function isPhoto(url: string): boolean {
	return PHOTO_TYPES.includes(EXTENSION_TO_TYPE[getUrlInfo(url).extension.toLowerCase()]);
}

export function isVideo(url: string): boolean {
	return VIDEO_TYPES.includes(EXTENSION_TO_TYPE[getUrlInfo(url).extension.toLowerCase()]);
}

export function getUrlInfo(url: string): { fileName: string; extension: string } {
	const extension = url.split('.').pop() || '';
	const fullFilename = url.split('/').pop() || '';
	const fileName = fullFilename.substring(0, fullFilename.length - extension.length - 1);
	return {
		extension,
		fileName,
	};
}
