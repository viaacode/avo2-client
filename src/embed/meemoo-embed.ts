/**
 * Script to add an iframe at the location of this script
 * the iframe should look like:
 * <iframe src="http://localhost:8080/embed/item/qsn58fhr6k" width="100%" height="100vh"></iframe>
 * The url should be built by using "http://localhost:8080/embed/item/" concatenated with the data-embed-id attribute of the script tag
 */
(function () {
	const meemooScript = document.currentScript;
	const embedId = meemooScript?.getAttribute('data-embed-id');
	if (!embedId) {
		console.error(
			'meemoo embed could not initialize because no data-embed-id attribute was found on the script tag'
		);
		return;
	}
	const iframe = document.createElement('iframe');
	iframe.src = 'http://localhost:8080/embed/item/' + embedId;
	iframe.width = '100%';
	iframe.height = '100vh';
	meemooScript?.parentNode?.insertBefore(iframe, meemooScript);
})();

// Add a message listener to receive messages from the iFrame
window.addEventListener('message', function (event) {
	if (event.data === 'MEEMOO_EMBED__LOGIN_SUCCESSFUL') {
		// User logged in on new tab using one of the idp providers of meemoo archief voor onderwijs
		document.querySelectorAll('iframe').forEach(function (iframe) {
			iframe.contentWindow?.postMessage('MEEMOO_EMBED__REFRESH_LOGIN', '*');
		});
	}

	if (event.data === 'MEEMOO_EMBED__INITIALIZED') {
		// meemooo embed iframe was initialized
		// Send a refresh login to the iFrame
		event.source?.postMessage('EMBED__REFRESH_LOGIN', { targetOrigin: '*' });
	}
});
