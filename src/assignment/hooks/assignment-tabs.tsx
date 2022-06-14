import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TabPropsSchema } from '@viaa/avo2-components/dist/esm/components/Tabs/Tab/Tab';
import { IconNameSchema } from '@viaa/avo2-components/src/components/Icon/Icon.types';

import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';

export function useAssignmentLesgeverTabs(): [
	TabPropsSchema[],
	ASSIGNMENT_CREATE_UPDATE_TABS | undefined,
	React.Dispatch<React.SetStateAction<ASSIGNMENT_CREATE_UPDATE_TABS>>,
	(id: string | number) => void
] {
	const [t] = useTranslation();

	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud
	);
	const tabs: TabPropsSchema[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud,
					label: t('assignment/hooks/assignment-tabs___inhoud'),
					icon: 'collection' as IconNameSchema,
				},
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.Details,
					label: t('assignment/hooks/assignment-tabs___details'),
					icon: 'settings' as IconNameSchema,
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
