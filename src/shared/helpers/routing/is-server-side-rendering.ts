/**
 * During Server side rendering there is not window object available
 */
export const isServerSideRendering = (): boolean => {
	return typeof window === 'undefined';
};
