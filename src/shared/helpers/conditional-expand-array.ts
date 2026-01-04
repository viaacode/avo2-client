import { type ReactNode } from 'react';

// Given a list on conditions and matching components, it builds a list of components where the matching condition is truthy
export function expandArray(
  ...conditionsAndComponents: (boolean | ReactNode)[]
): ReactNode[] {
  const response: ReactNode[] = [];
  for (let i = 0; i < conditionsAndComponents.length; i += 2) {
    if (conditionsAndComponents[i]) {
      response.push(conditionsAndComponents[i + 1]);
    }
  }
  return response;
}
