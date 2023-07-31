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
	contributors?: ContributorInfo[];
	onAddContributor: (info: Partial<ContributorInfo>) => Promise<void>;
	onEditContributorRights: (info: ContributorInfo, newRights: ShareRightsType) => Promise<void>;
	onDeleteContributor: (info: ContributorInfo) => Promise<void>;
	buttonProps?: Partial<ButtonProps>;
	dropdownProps?: Partial<DropdownProps>;
	shareWithPupilsProps?: ShareWithPupilsProps;
	withPupils?: boolean;
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

	const renderShareWithColleagues = () => {
		if (contributors) {
			return (
				<ShareWithColleagues
					contributors={contributors}
					onAddNewContributor={onAddContributor}
					onDeleteContributor={onDeleteContributor}
					onEditRights={onEditContributorRights}
					hasModalOpen={(open: boolean) => setHasModalOpen(open)}
				/>
			);
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
					title={tText(
						'shared/components/share-dropdown/share-dropdown___bezorg-deze-opdrachtlink-aan-je-leerlingen-of-werk-samen-met-je-collegas'
					)}
					onClick={handleShareButtonClicked}
					disabled={false}
					icon={IconName.userGroup}
					{...buttonProps}
				/>
			</DropdownButton>

			<DropdownContent>
				<div className="c-share-dropdown__container">
					{withPupils ? (
						<>
							<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

							<div className="c-share-dropdown__content">
								{tab === ShareDropdownTabs.COLLEAGUES ? (
									<>
										{contributors && (
											<ShareWithColleagues
												contributors={contributors}
												onAddNewContributor={onAddContributor}
												onDeleteContributor={onDeleteContributor}
												onEditRights={onEditContributorRights}
												hasModalOpen={(open: boolean) =>
													setHasModalOpen(open)
												}
											/>
										)}
									</>
								) : (
									<ShareWithPupil
										{...(shareWithPupilsProps as ShareWithPupilsProps)}
									/>
								)}
							</div>
						</>
					) : (
						<div className="c-share-dropdown__content">
							{renderShareWithColleagues()}
						</div>
					)}
				</div>
			</DropdownContent>
		</Dropdown>
	);
};

export default ShareDropdown;
