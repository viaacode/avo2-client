import { IconName, TabProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';

export function useAssignmentPupilTabs(
	assignment?: Avo.Assignment.Assignment_v2
): [
	TabProps[],
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS | undefined,
	React.Dispatch<React.SetStateAction<ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS>>,
	(id: string | number) => void
] {
	const [t] = useTranslation();

	const [tab, setTab] = useState<ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS>(
		ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT
	);
	const tabs: TabProps[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT,
					label: t('assignment/hooks/assignment-pupil-tabs___opdracht'),
					icon: 'clipboard' as IconName,
				},
				...(assignment?.assignment_type &&
				['ZOEK', 'BOUW'].includes(assignment?.assignment_type)
					? [
							{
								id: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH,
								label: t('assignment/hooks/assignment-pupil-tabs___zoeken'),
								icon: 'search' as IconName,
							},
					  ]
					: []),
				...(assignment?.assignment_type && ['BOUW'].includes(assignment?.assignment_type)
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

	return [tabs, tab, setTab, onTabClick];
}
