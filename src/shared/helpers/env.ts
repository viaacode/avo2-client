import { CustomWindow } from '../types/global';

export function getEnv(name: keyof CustomWindow['_ENV_']): string | undefined {
	if ((window as CustomWindow)._ENV_) {
		return (window as CustomWindow)._ENV_[name];
	}
	return process.env[name];
}
