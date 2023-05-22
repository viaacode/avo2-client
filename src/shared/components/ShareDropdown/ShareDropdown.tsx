import { Dropdown, DropdownButton, DropdownContent } from '@meemoo/react-components';
import { Button, IconName, Tabs } from '@viaa/avo2-components';
import React, { FC, useState } from 'react';

import { useTabs } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import ShareWithColleagues from '../ShareWithColleagues/ShareWithColleagues';
import {
	ShareUserInfo,
	ShareUserInfoRights,
} from '../ShareWithColleagues/ShareWithColleagues.types';

import './ShareDropdown.scss';

type ShareDropdownProps = {
	users: ShareUserInfo[];
	onAddNewUser: (info: Partial<ShareUserInfo>) => void;
	onEditRights: (info: ShareUserInfo, newRights: ShareUserInfoRights) => void;
	onDeleteUser: (info: ShareUserInfo) => void;
};
const ShareDropdown: FC<ShareDropdownProps> = ({
	users,
	onAddNewUser,
	onEditRights,
	onDeleteUser,
}) => {
	const { tText } = useTranslation();
	const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: 'colleagues',
				label: tText('shared/components/share-dropdown/share-dropdown___collegas'),
				icon: IconName.userTeacher,
			},
			{
				id: 'pupils',
				label: tText('shared/components/share-dropdown/share-dropdown___leerlingen'),
				icon: IconName.userStudent,
			},
		],
		'colleagues'
	);

	const handleShareButtonClicked = () => {
		setIsShareDropdownOpen(!isShareDropdownOpen);
	};

	return (
		<Dropdown
			isOpen={isShareDropdownOpen}
			onClose={() => setIsShareDropdownOpen(false)}
			className="c-share-dropdown"
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
				/>
			</DropdownButton>

			<DropdownContent>
				<div className="c-share-dropdown__container">
					<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

					<div className="c-share-dropdown__content">
						{tab === 'colleagues' ? (
							<ShareWithColleagues
								users={users}
								onAddNewUser={onAddNewUser}
								onDeleteUser={onDeleteUser}
								onEditRights={onEditRights}
							/>
						) : (
							'leerlingen'
						)}
					</div>
				</div>
			</DropdownContent>
		</Dropdown>
	);
};

export default ShareDropdown;
