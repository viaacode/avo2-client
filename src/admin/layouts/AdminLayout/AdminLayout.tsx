import React, { FunctionComponent, ReactNode } from 'react';

import { Container, useSlot } from '@viaa/avo2-components';

import { ActionsBar } from '../../components';
import { AdminLayoutActions, AdminLayoutBody } from './AdminLayout.slots';

interface AdminLayoutProps {
	children?: ReactNode;
	className?: string;
	pageTitle: string;
}

export const AdminLayout: FunctionComponent<AdminLayoutProps> = ({
	children,
	className,
	pageTitle,
}) => {
	const actions = useSlot(AdminLayoutActions, children);
	const body = useSlot(AdminLayoutBody, children);

	return (
		<Container className={className} mode="vertical" size="small">
			<Container mode="horizontal">
				<h1 className="c-h2 u-m-t-0">{pageTitle}</h1>
				{!body && !actions && children}
				{body}
				{actions && <ActionsBar fixed>{actions}</ActionsBar>}
			</Container>
		</Container>
	);
};
