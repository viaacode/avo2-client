import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';

import { setLoginSuccess } from '../../authentication/store/actions';
import { EmbedCodeService } from '../../embed-code/embed-code-service';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { getEnv } from '../../shared/helpers/env';
import store from '../../store';

export const useGetLoginStateForEmbed = () => {
	return useQuery<Avo.Auth.LoginResponse>(
		[QUERY_KEYS.GET_LOGIN_STATE_EMBED],
		async () => {
			const jwtToken = EmbedCodeService.getJwtTokenFromUrl();
			const response = await fetch(`${getEnv('PROXY_URL')}/auth/check-login`, {
				method: 'GET',
				credentials: 'include',
				cache: 'no-store',
				headers: {
					'Content-Type': 'application/json',
					authorization: jwtToken ? `Bearer ${jwtToken}` : '', // JWT token authentication for embed codes inside an iframe on external sites
				},
			});
			if (!response.ok) {
				throw new Error('Failed to fetch login state');
			}
			const loginResponse = await response.json();
			store.dispatch(setLoginSuccess(loginResponse));
			return loginResponse as Avo.Auth.LoginResponse;
		},
		{
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
			refetchOnMount: true,
			keepPreviousData: true,
		}
	);
};
