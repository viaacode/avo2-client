export async function fetchWithLogout(input: RequestInfo, init?: RequestInit): Promise<Response> {
	const response = await fetch(input, init);
	if (response.status === 401) {
		// User is no longer logged in => force them to login again
		window.location.reload();
	}
	return response;
}
