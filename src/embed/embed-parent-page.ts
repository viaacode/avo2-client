/**
 * Script to add an iframe at the location of this script
 * the iframe should look like:
 * <iframe src="http://localhost:8080/embed/item/qsn58fhr6k" width="100%" height="100vh"></iframe>
 * The url should be built by using "http://localhost:8080/embed/item/" concatenated with the data-embed-id attribute of the script tag
 */
async function bootstrapEmbed() {
	const EMBED_DOMAIN = 'http://localhost:8080';

	const embedScriptTag = document.currentScript;
	const embedId = embedScriptTag?.getAttribute('data-embed-id');
	const jwtToken = embedScriptTag?.getAttribute('data-token');

	console.log('bootstrapping meemoo embed: ', embedId);

	if (!embedId) {
		console.error(
			'meemoo embed could not initialize because no data-embed-id attribute was found on the script tag'
		);
		return;
	}

	// Boostrap the iframe that will load the avo login / video
	const iframe = document.createElement('iframe');
	iframe.setAttribute('src', EMBED_DOMAIN + '/embed/item/' + embedId + `?jwtToken=` + jwtToken);
	iframe.setAttribute('width', '100%');
	iframe.setAttribute('height', '100vh');
	iframe.setAttribute('data-embed-id', 'qsn58fhr6k');
	embedScriptTag?.parentNode?.insertBefore(iframe, embedScriptTag);

	/**
	 * Init iframe-resizer script on parent page
	 */
	const embedScripts = document.querySelectorAll(
		`script[src^="${EMBED_DOMAIN.split(':')[0]}"][data-embed-id]` // TODO replace with EMBED_DOMAIN once it's a real domain and no longer contains a port
	);
	const isFirstEmbed =
		embedScripts.item(0).getAttribute('data-embed-id') ===
		embedScriptTag?.getAttribute('data-embed-id');
	// Only the first embed should bootstrap the iframe resize handler on the parent page
	if (isFirstEmbed) {
		const iframeResizerScript = document.createElement('script');
		iframeResizerScript.setAttribute(
			'src',
			'https://cdn.jsdelivr.net/npm/@iframe-resizer/parent@5.3.2'
		); // TODO self host this js file under a meemoo domain
		iframeResizerScript.onload = () => {
			(window as any).iframeResize({
				license: 'GPLv3',
				onMessage: handleIframeMessage,
			});
			window.iFrameResizer = {
				targetOrigin: EMBED_DOMAIN,
			};
		};
		embedScriptTag?.parentNode?.insertBefore(iframeResizerScript, embedScriptTag);
	}

	// Listen for messages from the idp page in a new tab
	document.addEventListener('visibilitychange', () => sendFocusMessageToIframe(iframe));
}

function sendFocusMessageToIframe(iframe: HTMLIFrameElement) {
	iframe.contentWindow?.postMessage('MEEMOO_EMBED__PARENT_FOCUS', '*');
}

// Trigger a scroll to the iframe when the description is collapsed inside the embed iframe, so the experience isn't too jarring
function handleIframeMessage({ iframe, message }: { iframe: HTMLIFrameElement; message: any }) {
	if (message.startsWith('MEEMOO_EMBED__')) {
		if (message === 'MEEMOO_EMBED__SCROLL_TO_IFRAME') {
			iframe.scrollIntoView();
		}
	}
}

bootstrapEmbed();
