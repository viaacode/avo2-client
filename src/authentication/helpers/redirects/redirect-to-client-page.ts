import { type NavigateFunction } from 'react-router'

export function redirectToClientPage(
  path: string,
  navigate: NavigateFunction,
): void {
  navigate(path)
}
