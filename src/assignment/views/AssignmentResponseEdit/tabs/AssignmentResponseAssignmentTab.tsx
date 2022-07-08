import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorView } from '../../../../error/views';
import BlockList from '../../../../shared/components/BlockList/BlockList';

interface AssignmentResponseAssignmentTabProps {
	assignment: Avo.Assignment.Assignment_v2;
}

const AssignmentResponseAssignmentTab: FunctionComponent<AssignmentResponseAssignmentTabProps> = ({
	assignment,
}) => {
	const [t] = useTranslation();

	// Render

	const renderAssignmentBlocks = () => {
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
