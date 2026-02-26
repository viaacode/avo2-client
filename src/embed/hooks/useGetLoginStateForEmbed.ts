import { useQuery } from '@tanstack/react-query';

import { AvoAuthLoginResponse } from '@viaa/avo2-types';
import { loginAtom } from '../../authentication/authentication.store';
import { LoginMessage } from '../../authentication/authentication.types';
import { EmbedCodeService } from '../../embed-code/embed-code-service';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import { isServerSideRendering } from '../../shared/helpers/routing/is-server-side-rendering.ts';
import { store } from '../../shared/store/ui.store.ts';
import { LTI_JWT_TOKEN_HEADER } from '../embed.types';

export async function checkLoginState() {
  let url: string | null = null;
  try {
    if (isServerSideRendering()) {
      // During server side rendering the user is always logged out
      const loginResponse = {
        message: LoginMessage.LOGGED_OUT,
      } as AvoAuthLoginResponse;
      store.set(loginAtom, loginResponse as any);
      return loginResponse;
    }
    const loginStateValue = store.get(loginAtom);

    const loginState = loginStateValue?.data;

    if (loginState?.message === LoginMessage.LOGGED_IN) {
      return loginState;
    }

    url = `${getEnv('PROXY_URL')}/auth/check-login`;
    const response = await fetch(url, {
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
    store.set(loginAtom, loginResponse);
    return loginResponse as AvoAuthLoginResponse;
  } catch (err) {
    console.error('Error fetching login state for embed:', err);
    throw new CustomError('Failed to fetch login state for embed', err, {
      url,
    });
  }
}

export const useGetLoginStateForEmbed = () => {
  return useQuery<AvoAuthLoginResponse>({
    queryKey: [QUERY_KEYS.GET_LOGIN_STATE_EMBED],
    queryFn: async () => checkLoginState(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    enabled: !!EmbedCodeService.getJwtToken(),
    staleTime: 0,
  });
};
