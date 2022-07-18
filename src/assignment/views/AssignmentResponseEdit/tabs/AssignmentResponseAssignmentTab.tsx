import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorView } from '../../../../error/views';
import BlockList from '../../../../shared/components/BlockList/BlockList';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../../../assignment.const';

interface AssignmentResponseAssignmentTabProps {
	blocks: Avo.Assignment.Assignment_v2['blocks'] | null;
	pastDeadline: boolean;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
	buildSearchLink: (props: Partial<Avo.Search.Filters>) => ReactNode | string;
}

const AssignmentResponseAssignmentTab: FunctionComponent<AssignmentResponseAssignmentTabProps> = ({
	blocks,
	pastDeadline,
	setTab,
}) => {
	const [t] = useTranslation();

	// Render

	const renderAssignmentBlocks = () => {
		if ((blocks?.length || 0) === 0) {
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
				blocks={(blocks || []) as Avo.Core.BlockItemBase[]}
				config={{
					TEXT: {
						title: {
							canClickHeading: false,
						},
					},
					ITEM: {
						flowPlayer: {
							canPlay: true,
						},
					},
					ZOEK: {
						pastDeadline,
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
