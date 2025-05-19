import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { getEnv } from '../../shared/helpers/env';

export const useGetLoginStateForEmbed = () => {
	return useQuery<Avo.Auth.LoginResponse>(
		[QUERY_KEYS.GET_LOGIN_STATE_EMBED],
		async () => {
			const response = await fetch(`${getEnv('PROXY_URL')}/auth/check-login`, {
				method: 'GET',
				credentials: 'include', // TODO include JWT token
			});
			if (!response.ok) {
				throw new Error('Failed to fetch login state');
			}
			return await response.json();
		},
		{
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		}
	);
};
