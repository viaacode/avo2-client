const AVO_LAST_RELOAD_BECAUSE_UNAUTH = 'AVO_LAST_RELOAD_BECAUSE_UNAUTH';

export async function fetchWithLogout(input: RequestInfo, init?: RequestInit): Promise<Response> {
	const response = await fetch(input, init);
	if (response.status === 401) {
		// User is no longer logged in => force them to login again
		goToLoginBecauseOfUnauthorizedError();
	}
	return response;
}

export function goToLoginBecauseOfUnauthorizedError() {
	const lastReloadDate = localStorage.getItem(AVO_LAST_RELOAD_BECAUSE_UNAUTH);
	if (
		!lastReloadDate ||
		new Date(lastReloadDate).getTime() < new Date().getTime() - 5 * 60 * 1000
	) {
		localStorage.setItem(AVO_LAST_RELOAD_BECAUSE_UNAUTH, new Date().toISOString());
		window.location.reload();
	}
}
