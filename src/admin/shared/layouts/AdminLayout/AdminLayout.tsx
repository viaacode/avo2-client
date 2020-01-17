import classnames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

import { Container, useSlot } from '@viaa/avo2-components';

import { ActionsBar, TopBar } from '../../components';
import { AdminLayoutActions, AdminLayoutBody, AdminLayoutHeader } from './AdminLayout.slots';

import './AdminLayout.scss';

interface AdminLayoutProps {
	children?: ReactNode;
	className?: string;
	navigateBack?: (() => void) | null;
	pageTitle?: string;
}

const AdminLayout: FunctionComponent<AdminLayoutProps> = ({
	children,
	className,
	navigateBack = null,
	pageTitle,
}) => {
	const actions = useSlot(AdminLayoutActions, children);
	const body = useSlot(AdminLayoutBody, children);
	const header = useSlot(AdminLayoutHeader, children);

	return (
		<div className={classnames({ 'l-admin--with-actions': !!actions })}>
			<TopBar navigateBack={navigateBack} />
			{header}
			{(pageTitle || (children && !body)) && (
				<Container className={className} mode="vertical" size="small">
					<Container mode="horizontal">
						{pageTitle && <h1 className="c-h2 u-m-0">{pageTitle}</h1>}
						{!body && children}
					</Container>
				</Container>
			)}
			{body}
			{actions && <ActionsBar fixed>{actions}</ActionsBar>}
		</div>
	);
};

export default AdminLayout;
