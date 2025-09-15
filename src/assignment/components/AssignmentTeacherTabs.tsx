import { IconName, Pill, PillVariants, type TabProps, Tabs } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { type FC, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { compose } from 'redux';

import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';

interface AssignmentTeacherTabsProps {
	activeTab: ASSIGNMENT_CREATE_UPDATE_TABS | null;
	onTabChange: (newActiveTab: ASSIGNMENT_CREATE_UPDATE_TABS) => void;
	clicksCount: number;
	isManaged: boolean;
}

const AssignmentTeacherTabs: FC<AssignmentTeacherTabsProps & UserProps> = ({
	commonUser,
	activeTab,
	onTabChange,
	clicksCount,
	isManaged,
}) => {
	const { tText } = useTranslation();
	const location = useLocation();

	const showAdminTab: boolean = PermissionService.hasAtLeastOnePerm(commonUser, [
		PermissionName.EDIT_ASSIGNMENT_QUALITY_LABELS,
		PermissionName.EDIT_ASSIGNMENT_AUTHOR,
		PermissionName.EDIT_ASSIGNMENT_EDITORIAL_STATUS,
	]);

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
				...(location.pathname !== APP_PATH.ASSIGNMENT_CREATE.route
					? [
							{
								id: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
								label: (
									<>
										{tText('assignment/hooks/assignment-teacher-tabs___kliks')}
										<Pill
											variants={
												activeTab === ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS
													? [PillVariants.active]
													: []
											}
										>
											{clicksCount}
										</Pill>
									</>
								),
								icon: IconName.pointer as IconName,
							},
					  ]
					: []),
				...(showAdminTab
					? [
							{
								id: ASSIGNMENT_CREATE_UPDATE_TABS.ADMIN,
								label: tText('assignment/hooks/assignment-teacher-tabs___beheer'),
								icon: IconName.settings as IconName,
							},
					  ]
					: []),
				...(showAdminTab && isManaged
					? [
							{
								id: ASSIGNMENT_CREATE_UPDATE_TABS.MARCOM,
								label: tText(
									'assignment/components/assignment-teacher-tabs___communicatie'
								),
								icon: IconName.send as IconName,
							},
					  ]
					: []),
			].map((item) => ({
				...item,
				active: item.id === activeTab,
			})),
		[tText, location.pathname, activeTab, clicksCount, showAdminTab, isManaged]
	);

	return (
		<Tabs
			tabs={tabs}
			onClick={(tabId: string | number) =>
				onTabChange(tabId as ASSIGNMENT_CREATE_UPDATE_TABS)
			}
		/>
	);
};

export default compose(withUser)(AssignmentTeacherTabs) as FC<AssignmentTeacherTabsProps>;
