import type { RouteComponentProps } from 'react-router-dom';

export function redirectToClientPage(path: string, history: RouteComponentProps['history']): void {
	history.push(path);
}
