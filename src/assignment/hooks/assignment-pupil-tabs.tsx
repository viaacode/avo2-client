import { IconName, TabProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import { AssignmentType } from '../assignment.types';

import { useAssignmentPastDeadline } from './assignment-past-deadline';

export function useAssignmentPupilTabs(
	assignment: Avo.Assignment.Assignment_v2 | null,
	tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	setTab: (newTab: string) => void
): [
	TabProps[],
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS | undefined,
	(newTab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS) => void,
	(id: string | number) => void
] {
	const [t] = useTranslation();

	const pastDeadline = useAssignmentPastDeadline(assignment);

	const tabs: TabProps[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT,
					label: t('assignment/hooks/assignment-pupil-tabs___opdracht'),
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
								label: t('assignment/hooks/assignment-pupil-tabs___zoeken'),
								icon: 'search' as IconName,
							},
					  ]
					: []),
				...(assignment?.assignment_type &&
				[AssignmentType.BOUW].includes(assignment?.assignment_type as AssignmentType)
					? [
							{
								id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION,
								label: t('assignment/hooks/assignment-pupil-tabs___mijn-collectie'),
								icon: 'briefcase' as IconName,
							},
					  ]
					: []),
			].map((item) => ({
				...item,
				active: item.id === tab,
			})),
		[assignment, t, tab]
	);

	const onTabClick = useCallback(
		(id: string | number) => {
			setTab(id as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS);
		},
		[setTab]
	);

	return [tabs, tab as ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS | undefined, setTab, onTabClick];
}
