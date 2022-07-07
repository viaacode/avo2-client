import { Container, Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorView } from '../../../../error/views';
import BlockList from '../../../../shared/components/BlockList/BlockList';

interface AssignmentResponseAssignmentTabProps {
	assignmentInfo: {
		assignmentBlocks: Avo.Assignment.Block[];
		assignment: Avo.Assignment.Assignment_v2;
	} | null;
	assignmentInfoLoading: boolean;
	assignmentInfoError: any | null;
}

const AssignmentResponseAssignmentTab: FunctionComponent<AssignmentResponseAssignmentTabProps> = ({
	assignmentInfo,
	assignmentInfoError,
	assignmentInfoLoading,
}) => {
	const [t] = useTranslation();

	// Render

	const renderAssignmentBlocks = () => {
		if (assignmentInfoLoading) {
			return (
				<Spacer margin="top-extra-large">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}
		if (assignmentInfoError) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt'
					)}
					icon="alert-triangle"
				/>
			);
		}
		if ((assignmentInfo?.assignmentBlocks?.length || 0) === 0) {
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
					blocks={(assignmentInfo?.assignmentBlocks || []) as Avo.Core.BlockItemBase[]}
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
