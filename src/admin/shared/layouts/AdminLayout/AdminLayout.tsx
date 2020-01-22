import React, { FunctionComponent, ReactNode } from 'react';

import { Container, useSlot } from '@viaa/avo2-components';

import { ActionsBar, TopBar } from '../../components';
import { AdminLayoutActions, AdminLayoutBody, AdminLayoutHeader } from './AdminLayout.slots';

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
	const header = useSlot(AdminLayoutHeader, children);

	return (
		<>
			<TopBar showBackButton={showBackButton} />
			{header}
			{(pageTitle || (children && !body)) && (
				<Container className={className} mode="vertical" size="small">
					<Container mode="horizontal">
						{pageTitle && <h1 className="c-h2 u-m-t-0">{pageTitle}</h1>}
						{!body && children}
					</Container>
				</Container>
			)}
			{body}
			{actions && <ActionsBar fixed>{actions}</ActionsBar>}
		</>
	);
};

export default AdminLayout;
