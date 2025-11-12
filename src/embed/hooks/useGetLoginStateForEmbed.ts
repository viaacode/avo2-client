import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';
import { useAtom } from 'jotai';

import { loginAtom } from '../../authentication/authentication.store.js';
import { LoginMessage } from '../../authentication/authentication.types.js';
import { EmbedCodeService } from '../../embed-code/embed-code-service.js';
import { QUERY_KEYS } from '../../shared/constants/query-keys.js';
import { CustomError } from '../../shared/helpers/custom-error.js';
import { getEnv } from '../../shared/helpers/env.js';
import { LTI_JWT_TOKEN_HEADER } from '../embed.types.js';

export const useGetLoginStateForEmbed = () => {
	const [loginStateValue, setLoginStateValue] = useAtom(loginAtom);
	return useQuery<Avo.Auth.LoginResponse>(
		[QUERY_KEYS.GET_LOGIN_STATE_EMBED],
		async () => {
			try {
				const loginState = loginStateValue?.data;

				if (loginState?.message === LoginMessage.LOGGED_IN) {
					return loginState;
				}

				const response = await fetch(`${getEnv('PROXY_URL')}/auth/check-login`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
					headers: {
						'Content-Type': 'application/json',
						[LTI_JWT_TOKEN_HEADER]: EmbedCodeService.getJwtToken() || '',
					},
				});
				if (!response.ok) {
					throw new Error('Failed to fetch login state');
				}
				const loginResponse = await response.json();
				setLoginStateValue(loginResponse);
				return loginResponse as Avo.Auth.LoginResponse;
			} catch (err) {
				console.error('Error fetching login state for embed:', err);
				throw new CustomError('Failed to fetch login state for embed', err);
			}
		},
		{
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
			refetchOnMount: true,
			keepPreviousData: true,
			enabled: !!EmbedCodeService.getJwtToken(),
			cacheTime: 0,
			staleTime: 0,
		}
	);
};
