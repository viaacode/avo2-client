export async function getCollectionInviteToken(
  collectionId: string,
  email: string,
): Promise<string> {
  const emailSwapSymbol = email.replace('+', '%2B');
  const response = await fetch(
    // TODO: change to INT env
    `http://localhost:3000/collections/${collectionId}/share/get-invite-token?inviteEmail=${emailSwapSymbol}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const json = (await response.json()) as {
    collectionId: string;
    inviteToken: string;
    url: string;
  };
  return json.inviteToken;
}
