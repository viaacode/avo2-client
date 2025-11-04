import { IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode } from 'react';

import { ErrorView } from '../../../../error/views/ErrorView';
import { type FilterState } from '../../../../search/search.types';
import { BlockList } from '../../../../shared/components/BlockList/BlockList';
import { tHtml } from '../../../../shared/helpers/translate-html';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../../../assignment.const';

interface AssignmentResponseAssignmentTabProps {
	blocks: Avo.Assignment.Assignment['blocks'] | null;
	pastDeadline: boolean;
	setTab: (tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void;
	buildSearchLink: (props: Partial<FilterState>) => ReactNode | string;
}

export const AssignmentResponseAssignmentTab: FC<AssignmentResponseAssignmentTabProps> = ({
	blocks,
	pastDeadline,
	setTab,
}) => {
	// Render

	const renderAssignmentBlocks = () => {
		if ((blocks?.length || 0) === 0) {
			return (
				<ErrorView
					message={tHtml(
						'assignment/views/assignment-response-edit___deze-opdracht-heeft-nog-geen-inhoud'
					)}
					icon={IconName.search}
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
							trackPlayEvent: true,
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
