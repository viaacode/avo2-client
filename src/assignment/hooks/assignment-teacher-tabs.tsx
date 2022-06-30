import { IconName, TabProps } from '@viaa/avo2-components';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';

export function useAssignmentTeacherTabs(): [
	TabProps[],
	ASSIGNMENT_CREATE_UPDATE_TABS | undefined,
	React.Dispatch<React.SetStateAction<ASSIGNMENT_CREATE_UPDATE_TABS>>,
	(id: string | number) => void
] {
	const [t] = useTranslation();

	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud
	);
	const tabs: TabProps[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud,
					label: t('assignment/hooks/assignment-tabs___inhoud'),
					icon: 'collection' as IconName,
				},
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.Details,
					label: t('assignment/hooks/assignment-tabs___details'),
					icon: 'settings' as IconName,
				},
			].map((item) => ({
				...item,
				active: item.id === tab,
			})),
		[t, tab]
	);

	const onTabClick = useCallback(
		(id: string | number) => {
			setTab(id as ASSIGNMENT_CREATE_UPDATE_TABS);
		},
		[setTab]
	);

	return [tabs, tab, setTab, onTabClick];
}
