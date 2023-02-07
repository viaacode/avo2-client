import { IconName, TabProps } from '@viaa/avo2-components';
import React, { useCallback, useMemo, useState } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';

export function useAssignmentTeacherTabs(): [
	TabProps[],
	ASSIGNMENT_CREATE_UPDATE_TABS | undefined,
	React.Dispatch<React.SetStateAction<ASSIGNMENT_CREATE_UPDATE_TABS>>,
	(id: string | number) => void
] {
	const { tText } = useTranslation();

	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud
	);
	const tabs: TabProps[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud,
					label: tText('assignment/hooks/assignment-tabs___inhoud'),
					icon: IconName.collection as IconName,
				},
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.Details,
					label: tText('assignment/hooks/assignment-tabs___details'),
					icon: IconName.settings as IconName,
				},
			].map((item) => ({
				...item,
				active: item.id === tab,
			})),
		[tText, tab]
	);

	const onTabClick = useCallback(
		(id: string | number) => {
			setTab(id as ASSIGNMENT_CREATE_UPDATE_TABS);
		},
		[setTab]
	);

	return [tabs, tab, setTab, onTabClick];
}
