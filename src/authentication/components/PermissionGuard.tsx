import { useSlot } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';
import React, { type FC, type ReactNode, useEffect, useState } from 'react';

import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { type Permissions, PermissionService } from '../helpers/permission-service';

import { PermissionGuardFail, PermissionGuardPass } from './PermissionGuard.slots';

interface PermissionGuardProps {
	children: ReactNode;
	permissions: Permissions;
	commonUser: Avo.User.CommonUser | null;
	noPermissionsMessage?: string;
}

export const PermissionGuard: FC<PermissionGuardProps> = ({
	children,
	permissions,
	commonUser,
	noPermissionsMessage,
}) => {
	const { tText } = useTranslation();

	const childrenIfPassed = useSlot(PermissionGuardPass, children);
	const childrenIfFailed = useSlot(PermissionGuardFail, children);

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);

	useEffect(() => {
		PermissionService.hasPermissions(permissions, commonUser)
			.then((response) => {
				setHasPermission(response);
			})
			.catch((err) => {
				console.error('Failed to get permissions', err, { permissions, commonUser });
				setLoadingInfo({
					state: 'error',
					message:
						noPermissionsMessage ||
						tText(
							'authentication/components/permission-guard___er-ging-iets-mis-tijdens-het-controleren-van-de-rechten-van-je-account'
						),
				});
			});
	});

	useEffect(() => {
		if (!isNil(hasPermission)) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [hasPermission]);

	const renderPermissionGuard = () => {
		return hasPermission ? (
			<>{childrenIfPassed ? childrenIfPassed : children}</>
		) : (
			<>{childrenIfFailed}</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={{}} // Empty object so it doesn't wait for a valid object from the database
			render={renderPermissionGuard}
			showSpinner={true}
		/>
	);
};
