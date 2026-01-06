import {
  AvoAuthLoginResponse,
  AvoAuthLoginResponseLoggedIn,
} from '@viaa/avo2-types';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { type LoginState } from './authentication.types';

export const loginAtom = atom<LoginState>({
  data: null,
  loading: false,
  error: false,
});

export const commonUserAtom = selectAtom(loginAtom, (loginState) => {
  return (loginState.data as AvoAuthLoginResponseLoggedIn)?.commonUserInfo;
});

export const acceptConditionsAtom = atom<boolean | null, [], void>(
  null,
  (get, set) => {
    const newLoginState = {
      ...get(loginAtom),
      data: {
        ...(get(loginAtom).data as AvoAuthLoginResponse),
        acceptedConditions: true,
      },
      loading: false,
      error: false,
    };
    set(loginAtom, newLoginState);
  },
);
