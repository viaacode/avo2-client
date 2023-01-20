import { IconName, Pill, PillVariants, TabProps } from '@viaa/avo2-components';
import React, { useCallback, useMemo, useState } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import { Assignment_v2, AssignmentType } from '../assignment.types';

import { useAssignmentPastDeadline } from './assignment-past-deadline';

export function useAssignmentPupilTabs(
	assignment: Assignment_v2 | null,
	numOfPupilCollectionFragments: number,
	activeTab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	setTab: (newTab: string) => void
): [
	TabProps[],
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS | undefined,
	(newTab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void,
	(id: string | number) => void,
	() => void // Start pill animation
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
					icon: 'clipboard' as IconName,
				},
				...(assignment?.assignment_type &&
				[AssignmentType.ZOEK, AssignmentType.BOUW].includes(
					assignment?.assignment_type as AssignmentType
				) &&
				!pastDeadline
					? [
							{
								id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH,
								label: tText('assignment/hooks/assignment-pupil-tabs___zoeken'),
								icon: 'search' as IconName,
							},
					  ]
					: []),
				...(assignment?.assignment_type &&
				[AssignmentType.BOUW].includes(assignment?.assignment_type as AssignmentType)
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
								icon: 'briefcase' as IconName,
							},
					  ]
					: []),
			].map((item) => ({
				...item,
				active: item.id === activeTab,
			})),
		[assignment, tText, activeTab, numOfPupilCollectionFragments, animatePill]
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
