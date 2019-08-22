class Auth {
	private profile = null;
	private expiresAt: number | null = null;

	constructor() {}

	public getProfile() {
		return this.profile;
	}

	public isAuthenticated() {
		return new Date().getTime() < (this.expiresAt || 0);
	}

	signIn() {}

	handleAuthentication() {}

	signOut() {
		// clear profile, and expiration
		this.profile = null;
		this.expiresAt = null;
	}
}

const authClient = new Auth();

export default authClient;
