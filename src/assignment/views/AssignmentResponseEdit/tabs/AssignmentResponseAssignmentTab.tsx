import { IconName } from '@viaa/avo2-components';
import React, { FunctionComponent, ReactNode } from 'react';

import { ErrorView } from '../../../../error/views';
import { FilterState } from '../../../../search/search.types';
import BlockList from '../../../../shared/components/BlockList/BlockList';
import useTranslation from '../../../../shared/hooks/useTranslation';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../../../assignment.const';
import { Assignment_v2_With_Blocks, BaseBlockWithMeta } from '../../../assignment.types';

interface AssignmentResponseAssignmentTabProps {
	blocks: Assignment_v2_With_Blocks['blocks'] | null;
	pastDeadline: boolean;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
	buildSearchLink: (props: Partial<FilterState>) => ReactNode | string;
}

const AssignmentResponseAssignmentTab: FunctionComponent<AssignmentResponseAssignmentTabProps> = ({
	blocks,
	pastDeadline,
	setTab,
}) => {
	const { tText } = useTranslation();

	// Render

	const renderAssignmentBlocks = () => {
		if ((blocks?.length || 0) === 0) {
			return (
				<ErrorView
					message={tText(
						'assignment/views/assignment-response-edit___deze-opdracht-heeft-nog-geen-inhoud'
					)}
					icon={IconName.search}
				/>
			);
		}
		return (
			<BlockList
				blocks={(blocks || []) as BaseBlockWithMeta[]}
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
