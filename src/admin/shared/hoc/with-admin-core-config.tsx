import { type AdminConfig, AdminConfigManager } from '@meemoo/admin-core-ui/client';
import React, { type ComponentType, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner.js';

import { getAdminCoreConfig } from './with-admin-core-config.const.js';

export const withAdminCoreConfig = (WrappedComponent: ComponentType): ComponentType => {
	const Component = (props: { [key: string]: unknown }) => {
		const navigateFunc = useNavigate();

		const [adminCoreConfig, setAdminCoreConfig] = useState<AdminConfig | null>(null);

		const initConfigValue = useCallback(() => {
			const config: AdminConfig = getAdminCoreConfig(navigateFunc);
			AdminConfigManager.setConfig(config);
			setAdminCoreConfig(config);
		}, []);

		useEffect(() => {
			initConfigValue();
		}, [initConfigValue]);

		if (!adminCoreConfig) {
			return <FullPageSpinner />;
		}

		return <WrappedComponent {...(props as Record<string, unknown>)} />;
	};

	return Component as any as ComponentType;
};
