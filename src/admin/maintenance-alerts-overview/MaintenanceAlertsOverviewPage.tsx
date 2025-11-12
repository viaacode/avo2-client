import { MaintenanceAlertsOverview } from '@meemoo/admin-core-ui/admin';
import { Button, Modal } from '@meemoo/react-components';
import { PermissionName } from '@viaa/avo2-types';
import type { FC, ReactNode } from 'react';
import React from 'react';

import { PermissionGuard } from '../../authentication/components/PermissionGuard.js';
import { tText } from '../../shared/helpers/translate-text.js';

export const MaintenanceAlertsOverviewPage: FC = () => {
	const renderPopup = ({
		title,
		body,
		isOpen,
		onSave,
		onClose,
	}: {
		title: string;
		body: ReactNode;
		isOpen: boolean;
		onSave: () => void;
		onClose: () => void;
	}) => {
		const renderFooter = () => {
			return (
				<div>
					<Button
						variants={['block', 'black']}
						onClick={onSave}
						label={tText(
							'react-admin/modules/alerts/views/alerts-overview-page___bewaar-wijzigingen'
						)}
					/>

					<Button
						variants={['block', 'text']}
						onClick={onClose}
						label={tText(
							'react-admin/modules/alerts/views/alerts-overview-page___annuleer'
						)}
					/>
				</div>
			);
		};

		return (
			<Modal isOpen={isOpen} title={title} onClose={onClose} footer={renderFooter()}>
				{body}
			</Modal>
		);
	};

	return (
		<PermissionGuard permissions={[PermissionName.VIEW_ANY_MAINTENANCE_ALERTS]}>
			<MaintenanceAlertsOverview className="c-alerts-overview" renderPopup={renderPopup} />
		</PermissionGuard>
	);
};

export default MaintenanceAlertsOverviewPage;
