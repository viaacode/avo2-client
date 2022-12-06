import { ROUTE_PARTS } from '@meemoo/admin-core-ui';

export const ADMIN_CORE_ROUTE_PARTS: typeof ROUTE_PARTS = {
	...ROUTE_PARTS,
	admin: 'beheer' as 'admin', // TODO
};
