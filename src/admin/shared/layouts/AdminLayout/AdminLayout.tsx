import classnames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

import { Container, useSlot } from '@viaa/avo2-components';

import { ActionsBar, TopBar } from '../../components';

import './AdminLayout.scss';
import {
	AdminLayoutActions,
	AdminLayoutBody,
	AdminLayoutHeader,
	AdminLayoutTopBarCenter,
	AdminLayoutTopBarRight,
} from './AdminLayout.slots';

interface AdminLayoutProps {
	children?: ReactNode;
	className?: string;
	pageTitle?: string;
	onClickBackButton?: () => void;
}

const AdminLayout: FunctionComponent<AdminLayoutProps> = ({
	children,
	className,
	pageTitle,
	onClickBackButton,
}) => {
	const actions = useSlot(AdminLayoutActions, children);
	const body = useSlot(AdminLayoutBody, children);
	const topBarCenter = useSlot(AdminLayoutTopBarCenter, children);
	const topBarRight = useSlot(AdminLayoutTopBarRight, children);
	const header = useSlot(AdminLayoutHeader, children);

	return (
		<div className={classnames('l-admin', { 'l-admin--with-actions': !!actions })}>
			<TopBar
				onClickBackButton={onClickBackButton}
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
