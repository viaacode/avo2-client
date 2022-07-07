import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorView } from '../../../../error/views';
import BlockList from '../../../../shared/components/BlockList/BlockList';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../../../assignment.const';

interface AssignmentResponseAssignmentTabProps {
	assignment: Avo.Assignment.Assignment_v2 | null;
	assignmentLoading: boolean;
	assignmentError: any | null;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
}

const AssignmentResponseAssignmentTab: FunctionComponent<AssignmentResponseAssignmentTabProps> = ({
	assignment,
	assignmentError,
	assignmentLoading,
	setTab,
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
			<BlockList
				blocks={(assignment?.blocks || []) as Avo.Core.BlockItemBase[]}
				config={{
					TEXT: {
						title: {
							canClickHeading: false,
						},
					},
					ITEM: {
						meta: {
							canClickSeries: false,
						},
						flowPlayer: {
							canPlay: true,
						},
					},
					ZOEK: {
						onSearchButtonClicked: () =>
							setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH),
						onCollectionButtonClicked: () =>
							setTab(ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION),
					},
				}}
			/>
		);
	};

	return renderAssignmentBlocks();
};

export default AssignmentResponseAssignmentTab as FunctionComponent<AssignmentResponseAssignmentTabProps>;
