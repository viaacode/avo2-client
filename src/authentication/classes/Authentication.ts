class Authentication {
	private profile: { id: number; role: string } | null = null;
	private expiresAt: number | null = null;

	public getProfile() {
		return this.profile;
	}

	public isAuthenticated() {
		return new Date().getTime() < (this.expiresAt || 0);
	}

	signIn() {
		this.profile = { id: 1, role: 'Teacher' }; // 87811
	}

	signOut() {
		// clear profile, and expiration
		this.profile = null;
		this.expiresAt = null;
	}
}

const authClient = new Authentication();
authClient.signIn(); // TODO: replace with actual dispatch action to backend to get user info

export default authClient;
