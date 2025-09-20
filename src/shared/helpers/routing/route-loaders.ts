import { type PermissionName } from '@viaa/avo2-types';
import { redirect, type RedirectFunction } from 'react-router';

import { commonUserAtom, loginAtom } from '../../../authentication/authentication.store';
import { getLoginResponse } from '../../../authentication/authentication.store.actions';
import { ROUTE_PARTS } from '../../constants';
import { store } from '../../store/ui.store';

export type LoaderResponse = () => ReturnType<RedirectFunction> | undefined | void;
export type AsyncLoaderResponse = () => Promise<ReturnType<RedirectFunction> | undefined | void>;

export function checkLoginLoaderAsync(): AsyncLoaderResponse {
	return async () => {
		store.set(loginAtom, {
			...store.get(loginAtom),
			data: await getLoginResponse(false, []),
		});
	};
}

export function isLoggedInLoader(): LoaderResponse {
	return () => {
		const commonUser = store.get(commonUserAtom);
		if (!commonUser) {
			return redirect(`/${ROUTE_PARTS.registerOrLogin}`);
		}
	};
}

export function routeLoaders(
	evaluatorFunc: (permissions: PermissionName[]) => boolean
): LoaderResponse {
	return () => {
		const commonUser = store.get(commonUserAtom);
		if (!commonUser) {
			return redirect(`/${ROUTE_PARTS.registerOrLogin}`);
		}
		const allowedAccess = evaluatorFunc(commonUser?.permissions || []);
		if (!allowedAccess) {
			return redirect(`/${ROUTE_PARTS.admin}/no-access`);
		}
	};
}

export function hasPermissionLoader(permission: PermissionName): LoaderResponse {
	return () => {
		const commonUser = store.get(commonUserAtom);
		if (!commonUser) {
			return redirect(`/${ROUTE_PARTS.registerOrLogin}`);
		}
		if (!commonUser.permissions?.includes(permission)) {
			return redirect(`/${ROUTE_PARTS.admin}/no-access`);
		}
	};
}

export function hasAllPermissionsLoader(...permissions: PermissionName[]): LoaderResponse {
	return () => {
		const commonUser = store.get(commonUserAtom);
		if (!commonUser) {
			return redirect(`/${ROUTE_PARTS.registerOrLogin}`);
		}
		const ok = permissions.every((p) => commonUser.permissions?.includes(p));
		if (!ok) {
			return redirect(`/${ROUTE_PARTS.admin}/no-access`);
		}
	};
}

export function hasAnyPermissionLoader(...permissions: PermissionName[]): LoaderResponse {
	return () => {
		const commonUser = store.get(commonUserAtom);
		if (!commonUser) {
			return redirect(`/${ROUTE_PARTS.registerOrLogin}`);
		}
		const ok = permissions.some((p) => commonUser.permissions?.includes(p));
		if (!ok) {
			return redirect(`/${ROUTE_PARTS.admin}/no-access`);
		}
	};
}
