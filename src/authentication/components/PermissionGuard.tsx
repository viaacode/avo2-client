import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSlot } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { LoadingErrorLoadedComponent } from '../../shared/components';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { Permissions, PermissionService } from '../helpers/permission-service';

import { PermissionGuardFail, PermissionGuardPass } from './PermissionGuard.slots';

export interface PermissionGuardProps {
	children: ReactNode;
	permissions: Permissions;
	user: Avo.User.User | null;
	noPermissionsMessage?: string;
}

const PermissionGuard: FunctionComponent<PermissionGuardProps> = ({
	children,
	permissions,
	user,
	noPermissionsMessage,
}) => {
	const [t] = useTranslation();

	const childrenIfPassed = useSlot(PermissionGuardPass, children);
	const childrenIfFailed = useSlot(PermissionGuardFail, children);

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);

	useEffect(() => {
		PermissionService.hasPermissions(permissions, user)
			.then(response => {
				setHasPermission(response);
			})
			.catch(err => {
				console.error('Failed to get permissions', err, { permissions, user });
				setLoadingInfo({
					state: 'error',
					message:
						noPermissionsMessage ||
						t('Er ging iets mis tijdens het controleren van de rechten van je account'),
				});
			});
	});

	useEffect(() => {
		setLoadingInfo({ state: 'loaded' });
	}, [permissions]);

	const renderPermissionGuard = () => {
		return hasPermission ? (
			<>{!!childrenIfPassed ? childrenIfPassed : children}</>
		) : (
			<>{childrenIfFailed}</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={permissions}
			render={renderPermissionGuard}
			showSpinner={true}
		/>
	);
};

export default PermissionGuard;
