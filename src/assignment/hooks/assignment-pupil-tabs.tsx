import { IconName, Pill, PillVariants, type TabProps } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { useCallback, useMemo, useState } from 'react';

import { useAssignmentPastDeadline } from '../../shared/hooks/useAssignmentPastDeadline';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import { AssignmentType } from '../assignment.types';

export function useAssignmentPupilTabs(
	assignment: Avo.Assignment.Assignment | null,
	numOfPupilCollectionFragments: number,
	activeTab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	setTab: (newTab: string) => void
): [
	TabProps[],
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS | undefined,
	(newTab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void,
	(id: string | number) => void,
	() => void, // Start pill animation
] {
	const { tText, tHtml } = useTranslation();

	const [animatePill, setAnimatePill] = useState(false);
	const pastDeadline = useAssignmentPastDeadline(assignment);

	const tabs: TabProps[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT,
					label: tText('assignment/hooks/assignment-pupil-tabs___opdracht'),
					icon: IconName.clipboard as IconName,
				},
				...(assignment?.lom_learning_resource_type?.includes(AssignmentType.ZOEK) ||
				(assignment?.lom_learning_resource_type?.includes(AssignmentType.BOUW) &&
					!pastDeadline)
					? [
							{
								id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH,
								label: tText('assignment/hooks/assignment-pupil-tabs___zoeken'),
								icon: IconName.search as IconName,
							},
					  ]
					: []),
				...(assignment?.lom_learning_resource_type?.includes(AssignmentType.BOUW)
					? [
							{
								id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION,
								label: (
									<>
										<span
											title={tText(
												'assignment/hooks/assignment-pupil-tabs___aantal-fragmenten-in-collectie'
											)}
										>
											{tHtml(
												'assignment/hooks/assignment-pupil-tabs___mijn-collectie'
											)}
										</span>

										<Pill
											variants={
												activeTab ===
												ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION
													? [PillVariants.active]
													: []
											}
											className={animatePill ? 'animated' : undefined}
										>
											{numOfPupilCollectionFragments}
										</Pill>
									</>
								),
								icon: IconName.briefcase as IconName,
							},
					  ]
					: []),
			].map((item) => ({
				...item,
				active: item.id === activeTab,
			})),
		[assignment, tText, tHtml, activeTab, numOfPupilCollectionFragments, animatePill]
	);

	const onTabClick = useCallback(
		(id: string | number) => {
			setTab(id as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS);
			scrollTo({ top: 0 });
		},
		[setTab]
	);

	const startPillAnimation = () => {
		setAnimatePill(true);

		setTimeout(() => {
			setAnimatePill(false);
		}, 5000);
	};

	return [
		tabs,
		activeTab as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS | undefined,
		setTab,
		onTabClick,
		startPillAnimation,
	];
}
