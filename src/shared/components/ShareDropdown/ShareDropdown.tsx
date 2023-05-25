import { Dropdown, DropdownButton, DropdownContent } from '@meemoo/react-components';
import { Button, ButtonProps, DropdownProps, IconName, Tabs } from '@viaa/avo2-components';
import React, { FC, useState } from 'react';

import { useTabs } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import ShareWithColleagues from '../ShareWithColleagues/ShareWithColleagues';
import { ContributorInfo, ShareRightsType } from '../ShareWithColleagues/ShareWithColleagues.types';
import { ShareWithPupil, ShareWithPupilsProps } from '../ShareWithPupils/ShareWithPupils';

import './ShareDropdown.scss';
import { ShareDropdownTabs } from './ShareDropdown.types';

export type ShareDropdownProps = {
	users?: ContributorInfo[];
	onAddNewUser: (info: Partial<ContributorInfo>) => void;
	onEditRights: (info: ContributorInfo, newRights: ShareRightsType) => void;
	onDeleteUser: (info: ContributorInfo) => void;
	button?: Partial<ButtonProps>;
	dropdown?: Partial<DropdownProps>;
	share?: ShareWithPupilsProps;
};
const ShareDropdown: FC<ShareDropdownProps> = ({
	users,
	onAddNewUser,
	onEditRights,
	onDeleteUser,
	dropdown,
	button,
	share,
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
			{
				id: ShareDropdownTabs.PUPILS,
				label: tText('shared/components/share-dropdown/share-dropdown___leerlingen'),
				icon: IconName.userStudent,
			},
		],
		ShareDropdownTabs.PUPILS
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
			onClose={() => handleOnClose()}
			className="c-share-dropdown"
			{...dropdown}
		>
			<DropdownButton>
				<Button
					ariaLabel={tText('shared/components/share-dropdown/share-dropdown___delen')}
					label={tText('shared/components/share-dropdown/share-dropdown___delen')}
					title={tText(
						'assignment/components/share-assignment-with-pupil___bezorg-deze-opdrachtlink-aan-je-leerlingen'
					)}
					onClick={handleShareButtonClicked}
					disabled={false}
					icon={IconName.userGroup}
					{...button}
				/>
			</DropdownButton>

			<DropdownContent>
				<div className="c-share-dropdown__container">
					<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

					<div className="c-share-dropdown__content">
						{tab === ShareDropdownTabs.COLLEAGUES ? (
							<>
								{users && (
									<ShareWithColleagues
										contributors={users}
										onAddNewContributor={onAddNewUser}
										onDeleteContributor={onDeleteUser}
										onEditRights={onEditRights}
										hasModalOpen={(open: boolean) => setHasModalOpen(open)}
									/>
								)}
							</>
						) : (
							<ShareWithPupil {...(share as ShareWithPupilsProps)} />
						)}
					</div>
				</div>
			</DropdownContent>
		</Dropdown>
	);
};

export default ShareDropdown;
