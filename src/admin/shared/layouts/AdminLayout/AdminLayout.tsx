import classnames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

import { Container, useSlot } from '@viaa/avo2-components';

import { ActionsBar, TopBar } from '../../components';
import {
	AdminLayoutActions,
	AdminLayoutBody,
	AdminLayoutHeader,
	AdminLayoutTopBarCenter,
	AdminLayoutTopBarRight,
} from './AdminLayout.slots';

import './AdminLayout.scss';

interface AdminLayoutProps {
	children?: ReactNode;
	className?: string;
	pageTitle?: string;
	showBackButton?: boolean;
}

const AdminLayout: FunctionComponent<AdminLayoutProps> = ({
	children,
	className,
	pageTitle,
	showBackButton,
}) => {
	const actions = useSlot(AdminLayoutActions, children);
	const body = useSlot(AdminLayoutBody, children);
	const topBarCenter = useSlot(AdminLayoutTopBarCenter, children);
	const topBarRight = useSlot(AdminLayoutTopBarRight, children);
	const header = useSlot(AdminLayoutHeader, children);

	return (
		<div className={classnames('l-admin', { 'l-admin--with-actions': !!actions })}>
			<TopBar
				showBackButton={showBackButton}
				title={pageTitle}
				center={topBarCenter}
				right={topBarRight}
			/>
			<div className="m-admin-layout-content">
				{header}
				{children && !body && (
					<Container className={className} mode="vertical" size="small">
						<Container mode="horizontal">{!body && children}</Container>
					</Container>
				)}
				{body}
				{actions && <ActionsBar fixed>{actions}</ActionsBar>}
			</div>
		</div>
	);
};

export default AdminLayout;
