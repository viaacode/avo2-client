import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC } from 'react';
import './Workspace.scss';

export const WorkspaceAssignmentRedirect: FC = () => {
	return (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	);
};
