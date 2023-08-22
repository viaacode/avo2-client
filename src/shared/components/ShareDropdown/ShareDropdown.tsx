import { Dropdown, DropdownButton, DropdownContent } from '@meemoo/react-components';
import { Button, ButtonProps, DropdownProps, IconName, Tabs } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { FC, useState } from 'react';

import { useTabs } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import ShareWithColleagues from '../ShareWithColleagues/ShareWithColleagues';
import {
	ContributorInfo,
	ContributorInfoRights,
} from '../ShareWithColleagues/ShareWithColleagues.types';
import { ShareWithPupil, ShareWithPupilsProps } from '../ShareWithPupils/ShareWithPupils';

import { ShareDropdownTabs } from './ShareDropdown.types';

import './ShareDropdown.scss';

export type ShareDropdownProps = {
	contributors?: ContributorInfo[];
	onAddContributor: (info: Partial<ContributorInfo>) => Promise<void>;
	onEditContributorRights: (
		info: ContributorInfo,
		newRights: ContributorInfoRights
	) => Promise<void>;
	onDeleteContributor: (info: ContributorInfo) => Promise<void>;
	buttonProps?: Partial<ButtonProps>;
	dropdownProps?: Partial<DropdownProps>;
	shareWithPupilsProps?: ShareWithPupilsProps;
	withPupils?: boolean;
	availableRights: {
		[ContributorInfoRights.CONTRIBUTOR]: PermissionName;
		[ContributorInfoRights.VIEWER]: PermissionName;
	};
	isAdmin: boolean;
};
const ShareDropdown: FC<ShareDropdownProps> = ({
	contributors,
	onAddContributor,
	onEditContributorRights,
	onDeleteContributor,
	dropdownProps,
	buttonProps,
	shareWithPupilsProps,
	withPupils = true,
	availableRights,
	isAdmin,
}) => {
	const { tText } = useTranslation();
	const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: ShareDropdownTabs.COLLEAGUES,
				label: tText('shared/components/share-dropdown/share-dropdown___collegas'),
				icon: IconName.userTeacher,
			},
			...(withPupils
				? [
						{
							id: ShareDropdownTabs.PUPILS,
							label: tText(
								'shared/components/share-dropdown/share-dropdown___leerlingen'
							),
							icon: IconName.userStudent,
						},
				  ]
				: []),
		],
		withPupils ? ShareDropdownTabs.PUPILS : ShareDropdownTabs.COLLEAGUES
	);
	const [hasModalOpen, setHasModalOpen] = useState<boolean>(false);

	const handleShareButtonClicked = () => {
		setIsShareDropdownOpen(!isShareDropdownOpen);
	};

	const handleOnClose = () => {
		if (!hasModalOpen) {
			setIsShareDropdownOpen(false);
		}
	};

	return (
		<Dropdown
			isOpen={isShareDropdownOpen}
			onClose={handleOnClose}
			className="c-share-dropdown"
			placement="bottom-end"
			{...dropdownProps}
		>
			<DropdownButton>
				<Button
					ariaLabel={tText('shared/components/share-dropdown/share-dropdown___delen')}
					label={tText('shared/components/share-dropdown/share-dropdown___delen')}
					onClick={handleShareButtonClicked}
					disabled={false}
					icon={IconName.userGroup}
					{...buttonProps}
				/>
			</DropdownButton>

			<DropdownContent>
				<div className="c-share-dropdown__container">
					<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

					<div className="c-share-dropdown__content">
						{tab === ShareDropdownTabs.COLLEAGUES ? (
							<ShareWithColleagues
								contributors={contributors || []}
								availableRights={availableRights}
								onAddNewContributor={onAddContributor}
								onDeleteContributor={onDeleteContributor}
								onEditRights={onEditContributorRights}
								hasModalOpen={(open: boolean) => setHasModalOpen(open)}
								isAdmin={isAdmin}
							/>
						) : (
							<ShareWithPupil {...(shareWithPupilsProps as ShareWithPupilsProps)} />
						)}
					</div>
				</div>
			</DropdownContent>
		</Dropdown>
	);
};

export default ShareDropdown;
