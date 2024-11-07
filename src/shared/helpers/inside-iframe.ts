export function insideIframe(): boolean {
	return window !== window.parent;
}
