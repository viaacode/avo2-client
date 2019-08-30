class Auth {
	private profile: { id: string; role: string } | null = null;
	private expiresAt: number | null = null;

	public getProfile() {
		return this.profile;
	}

	public isAuthenticated() {
		return new Date().getTime() < (this.expiresAt || 0);
	}

	signIn() {
		this.profile = { id: '1', role: 'Teacher' };
	}

	signOut() {
		// clear profile, and expiration
		this.profile = null;
		this.expiresAt = null;
	}
}

const authClient = new Auth();

export default authClient;
