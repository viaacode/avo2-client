import { isNil } from 'es-toolkit';

export function okNokToBoolean(value: 'OK' | 'NOK' | null): boolean | null {
  if (value === 'OK') {
    return true;
  }
  if (value === 'NOK') {
    return false;
  }
  return null;
}

export function booleanToOkNok(
  value: boolean | undefined | null,
): 'OK' | 'NOK' | null {
  if (value) {
    return 'OK';
  }
  if (isNil(value)) {
    return null;
  }
  return 'NOK';
}
