import { type Avo } from '@viaa/avo2-types'

export enum LoginMessage {
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
}

export enum SpecialPermissionGroups {
  loggedOutUsers = '-1',
  loggedInUsers = '-2',
}

export interface LoginState {
  readonly data: Avo.Auth.LoginResponse | null
  readonly loading: boolean
  readonly error: boolean
}
