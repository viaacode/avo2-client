import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';

import { LoginMessage } from '../../authentication/authentication.types';
import { setLoginSuccess } from '../../authentication/store/authentication.store.actions';
import { EmbedCodeService } from '../../embed-code/embed-code-service';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import store, { type AppState } from '../../store';
import { LTI_JWT_TOKEN_HEADER } from '../embed.types';

export const useGetLoginStateForEmbed = () => {
	return useQuery<Avo.Auth.LoginResponse>(
		[QUERY_KEYS.GET_LOGIN_STATE_EMBED],
		async () => {
			try {
				const loginState = (store.getState() as unknown as AppState)?.loginState.data;

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
				store.dispatch(setLoginSuccess(loginResponse));
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
