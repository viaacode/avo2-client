import { IconName, TabProps } from '@viaa/avo2-components';
import * as H from 'history';
import React, { useCallback, useMemo, useState } from 'react';

import { APP_PATH } from '../../constants';
import { navigate } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';

export function useAssignmentTeacherTabs(
	history: H.History<unknown>,
	assignmentId: string
): [
	TabProps[],
	ASSIGNMENT_CREATE_UPDATE_TABS | undefined,
	React.Dispatch<React.SetStateAction<ASSIGNMENT_CREATE_UPDATE_TABS>>,
	(id: string | number) => void
] {
	const { tText } = useTranslation();

	const [tab, setTab] = useState<ASSIGNMENT_CREATE_UPDATE_TABS>(
		ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT
	);
	const tabs: TabProps[] = useMemo(
		() =>
			[
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
					label: tText('assignment/hooks/assignment-tabs___inhoud'),
					icon: IconName.collection as IconName,
				},
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.DETAILS,
					label: tText('assignment/hooks/assignment-tabs___details'),
					icon: IconName.settings as IconName,
				},
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.PUBLISH,
					label: tText('assignment/hooks/assignment-teacher-tabs___publicatiedetails'),
					icon: IconName.fileText as IconName,
				},
				...(history.location.pathname !== APP_PATH.ASSIGNMENT_CREATE.route
					? [
							{
								id: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
								label: tText('assignment/hooks/assignment-teacher-tabs___kliks'),
								icon: IconName.pointer as IconName,
							},
					  ]
					: []),
				{
					id: ASSIGNMENT_CREATE_UPDATE_TABS.ADMIN,
					label: tText('Beheer'),
					icon: IconName.settings as IconName,
				},
			].map((item) => ({
				...item,
				active: item.id === tab,
			})),
		[tText, tab]
	);

	const onTabClick = useCallback(
		(tabId: string | number) => {
			setTab(tabId as ASSIGNMENT_CREATE_UPDATE_TABS);

			if (assignmentId) {
				navigate(
					history,
					APP_PATH.ASSIGNMENT_EDIT_TAB.route,
					{ id: assignmentId, tabId: tabId },
					undefined,
					'replace'
				);
			}
		},
		[setTab]
	);

	return [tabs, tab, setTab, onTabClick];
}
