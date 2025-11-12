import { Button, Spacer } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { subMinutes } from 'date-fns'
import { atom } from 'jotai'
import { compact } from 'es-toolkit'
import queryString from 'query-string'
import React from 'react'
import { type Location } from 'react-router'

import { LTI_JWT_TOKEN_HEADER } from '../embed/embed.types.js'
import { EmbedCodeService } from '../embed-code/embed-code-service.js'
import { CustomError } from '../shared/helpers/custom-error.js'
import { getEnv } from '../shared/helpers/env.js'
import { tText } from '../shared/helpers/translate-text.js'
import { ToastService } from '../shared/services/toast-service.js'
import { historyLocationsAtom } from '../shared/store/ui.store.js'

import { loginAtom } from './authentication.store.js'
import { LoginMessage, type LoginState } from './authentication.types.js'
import { logoutAndRedirectToLogin } from './helpers/redirects.js'

let checkSessionTimeoutTimerId: number | null = null

function checkIfSessionExpires(expiresAt: string) {
  const date = new Date(expiresAt)

  // Create fake location object
  const location = {
    pathname: window.location.pathname,
    state: {
      from: {
        pathname: window.location.pathname,
        search: window.location.search,
      },
    },
  } as unknown as Location
  if (subMinutes(date, 5).getTime() < new Date().getTime()) {
    logoutAndRedirectToLogin(location)
  } else if (subMinutes(date, 10).getTime() < new Date().getTime()) {
    // Show warning since user is about to be logged out
    ToastService.info(
      <>
        {tText(
          'authentication/store/actions___je-sessie-gaat-over-5-min-verlopen-sla-je-werk-op-en-log-opnieuw-in',
        )}
        <Spacer margin="top-small">
          <Button
            label={tText('authentication/store/actions___ga-naar-login')}
            onClick={() => logoutAndRedirectToLogin(location)}
            type="primary"
          />
        </Spacer>
      </>,
      {
        autoClose: false,
        position: 'bottom-left',
      },
    )
  }
}

export const getLoginStateAtom = atom<LoginState | null, [boolean], void>(
  null,
  async (get, set, forceRefetch) => {
    const loginState: LoginState = get(loginAtom)

    // Don't fetch login state if we already logged in
    if (loginState?.data?.message === LoginMessage.LOGGED_IN && !forceRefetch) {
      return null
    }

    // Don't fetch login state from server if a call is already in progress
    if (loginState.loading) {
      return null
    }

    set(loginAtom, {
      ...get(loginAtom),
      loading: true,
    })

    try {
      const historyLocations: string[] = get(historyLocationsAtom) || []
      const loginStateResponse = await getLoginResponse(
        forceRefetch,
        historyLocations,
      )

      set(loginAtom, {
        ...get(loginAtom),
        loading: false,
        error: false,
        data: loginStateResponse,
      })
    } catch (err) {
      console.error(
        new CustomError('failed to check login state', err, { forceRefetch }),
      )
      set(loginAtom, {
        ...get(loginAtom),
        loading: false,
        error: true,
      })
    }
  },
)

export async function getLoginResponse(
  forceRefetch = false,
  historyLocations: string[],
): Promise<Avo.Auth.LoginResponse> {
  try {
    const url = `${getEnv('PROXY_URL')}/auth/check-login?${queryString.stringify(
      {
        force: forceRefetch,
        history: historyLocations,
      },
    )}`

    const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/client')
    const loginStateResponse =
      await fetchWithLogoutJson<Avo.Auth.LoginResponse>(url, {
        forceLogout: false,
        headers: {
          'Content-Type': 'application/json',
          [LTI_JWT_TOKEN_HEADER]: EmbedCodeService.getJwtToken() || '',
        },
      })

    // Check if session is about to expire and show warning toast
    // Redirect to login page when session actually expires
    const expiresAt = (loginStateResponse as Avo.Auth.LoginResponseLoggedIn)
      ?.sessionExpiresAt
    if (expiresAt) {
      if (checkSessionTimeoutTimerId) {
        clearInterval(checkSessionTimeoutTimerId)
      }
      checkSessionTimeoutTimerId = window.setInterval(
        () => checkIfSessionExpires(expiresAt),
        5 * 60 * 1000,
      )
    }

    if (loginStateResponse.message === 'LOGGED_IN') {
      // Trigger extra Google Analytics event to track what the user group is of the logged-in user
      // https://meemoo.atlassian.net/browse/AVO-3011
      const userInfo = (loginStateResponse as Avo.Auth.LoginResponseLoggedIn)
        .userInfo
      const event = {
        event: 'visit',
        userData: {
          userGroup: userInfo?.profile?.userGroupIds[0],
          educationLevels: compact(
            (userInfo?.profile?.loms || []).map((lom) => lom?.lom?.label),
          ),
        },
      }
      ;(window as any)?.dataLayer?.push(event)
    }
    return loginStateResponse
  } catch (err) {
    console.error('failed to check login state', err)
    throw err
  }
}
