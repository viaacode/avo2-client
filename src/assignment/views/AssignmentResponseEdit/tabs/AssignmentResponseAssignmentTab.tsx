import { Container, Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorView } from '../../../../error/views';
import BlockList from '../../../../shared/components/BlockList/BlockList';

interface AssignmentResponseAssignmentTabProps {
	assignment: Avo.Assignment.Assignment_v2 | null;
	assignmentLoading: boolean;
	assignmentError: any | null;
}

const AssignmentResponseAssignmentTab: FunctionComponent<AssignmentResponseAssignmentTabProps> = ({
	assignment,
	assignmentError,
	assignmentLoading,
}) => {
	const [t] = useTranslation();

	// Render

	const renderAssignmentBlocks = () => {
		if (assignmentLoading) {
			return (
				<Spacer margin="top-extra-large">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}
		if (assignmentError) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt'
					)}
					icon="alert-triangle"
				/>
			);
		}
		if ((assignment?.blocks?.length || 0) === 0) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___deze-opdracht-heeft-nog-geen-inhoud'
					)}
					icon="search"
				/>
			);
		}
		return (
			<Container mode="horizontal">
				<BlockList
					blocks={(assignment?.blocks || []) as Avo.Core.BlockItemBase[]}
					config={{
						text: {}, // TODO figure out what goes inside here @ian
						item: {}, // TODO figure out what goes inside here @ian
					}}
				/>
			</Container>
		);
	};

	return renderAssignmentBlocks();
};

export default AssignmentResponseAssignmentTab as FunctionComponent<AssignmentResponseAssignmentTabProps>;