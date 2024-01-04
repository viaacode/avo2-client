export async function getCollectionInviteToken(
	collectionId: string,
	email: string
): Promise<string> {
	const emailSwapSymbol = email.replace('+', '%2B');
	const response = await fetch(
		`http://localhost:3000/collections/${collectionId}/share/get-invite-token?inviteEmail=${emailSwapSymbol}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);

	const json = await response.json();
	return json.inviteToken;
}
