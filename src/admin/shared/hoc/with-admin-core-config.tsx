import { AdminConfig, AdminConfigManager } from '@meemoo/admin-core-ui';
import { Spinner } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { ComponentType, useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import withUser from '../../../shared/hocs/withUser';

import { getAdminCoreConfig } from './with-admin-core-config.const';

export const withAdminCoreConfig = (WrappedComponent: ComponentType): ComponentType => {
	const Component = (props: { user?: Avo.User.User; [key: string]: unknown }) => {
		const [adminCoreConfig, setAdminCoreConfig] = useState<AdminConfig | null>(null);
		const user = props.user;

		const initConfigValue = useCallback(() => {
			const config: AdminConfig = getAdminCoreConfig(user);
			AdminConfigManager.setConfig(config);
			setAdminCoreConfig(config);
		}, []);

		useEffect(() => {
			initConfigValue();
		}, [initConfigValue]);

		if (!adminCoreConfig) {
			return <Spinner size="large" />;
		}

		return <WrappedComponent {...(props as Record<string, unknown>)} />;
	};

	return compose(withRouter, withUser)(Component) as ComponentType;
};
