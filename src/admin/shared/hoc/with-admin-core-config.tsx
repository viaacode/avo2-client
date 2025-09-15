import { type AdminConfig, AdminConfigManager } from '@meemoo/admin-core-ui/dist/client.mjs';
import { Spinner } from '@viaa/avo2-components';
import React, { type ComponentType, useCallback, useEffect, useState } from 'react';

import { getAdminCoreConfig } from './with-admin-core-config.const';

export const withAdminCoreConfig = (WrappedComponent: ComponentType): ComponentType => {
	const Component = (props: { [key: string]: unknown }) => {
		const [adminCoreConfig, setAdminCoreConfig] = useState<AdminConfig | null>(null);

		const initConfigValue = useCallback(() => {
			const config: AdminConfig = getAdminCoreConfig();
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

	return Component as any as ComponentType;
};
