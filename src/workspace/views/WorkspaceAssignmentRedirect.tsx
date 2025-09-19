import React, { type FC } from 'react';

import './Workspace.scss';
import { type ClientLoaderFunctionArgs, redirect } from 'react-router';

import { ROUTE_PARTS } from '../../shared/constants';

import { Flex, Spinner } from '@viaa/avo2-components';

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
	const assignmentId = params.assignmentId;
	throw redirect(`/${ROUTE_PARTS.assignments}/${assignmentId}${location.search}`);
}

clientLoader.hydrate = true as const;

export const WorkspaceAssignmentRedirect: FC = () => {
	return (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	);
};
