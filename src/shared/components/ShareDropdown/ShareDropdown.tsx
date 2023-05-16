import { Dropdown, DropdownButton, DropdownContent } from '@meemoo/react-components';
import {
	Avatar,
	Button,
	Icon,
	IconName,
	MenuContent,
	Tabs,
	TextInput,
} from '@viaa/avo2-components';
import { isEmpty, isNil, truncate } from 'lodash';
import React, { FC, useState } from 'react';

import withUser, { UserProps } from '../../hocs/withUser';
import { useTabs } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';

import { shareUserRightToString } from './ShareDropdown.helpers';
import './ShareDropdown.scss';
import { ShareUserInfo, ShareUserInfoRights } from './ShareDropdown.types';

type ShareDropdownProps = {
	users: ShareUserInfo[];
	onAddNewUser: (info: Partial<ShareUserInfo>) => void;
	onEditRights: (info: ShareUserInfo, newRights: ShareUserInfoRights) => void;
	onDeleteUser: (info: ShareUserInfo) => void;
};
const ShareDropdown: FC<ShareDropdownProps & UserProps> = ({
	user,
	users,
	onAddNewUser,
	onEditRights,
	onDeleteUser,
}) => {
	const { tText } = useTranslation();
	const currentUser = users.find((u) => u.email === user?.mail) as ShareUserInfo;
	const [isShareDropdownOpen, setIsShareDropdownOpen] = useState<boolean>(false);
	const [isRightsDropdownOpen, setIsRightsDropdownOpen] = useState<boolean>(false);
	const [newShareUser, setNewShareUser] = useState<Partial<ShareUserInfo>>({
		email: undefined,
		rights: undefined,
	});
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				id: 'colleagues',
				label: tText("Collega's"),
				icon: IconName.userTeacher,
			},
			{ id: 'pupils', label: tText('Leerlingen'), icon: IconName.userStudent },
		],
		'colleagues'
	);

	const handleShareButtonClicked = () => {
		setIsShareDropdownOpen(!isShareDropdownOpen);
	};

	const handleRightsButtonClicked = () => {
		setIsRightsDropdownOpen(!isRightsDropdownOpen);
	};

	const handleAddNewUser = () => {
		onAddNewUser(newShareUser);
	};

	const handleEditUserRights = (info: ShareUserInfo, newRights: ShareUserInfoRights) => {
		onEditRights(info, newRights);
	};

	const handleDeleteUser = (info: ShareUserInfo) => {
		onDeleteUser(info);
	};

	const updateNewShareUserInfo = (value: Record<string, string>) => {
		setNewShareUser({
			...newShareUser,
			...value,
		});
	};

	const renderColleaguesInfoList = () => {
		if (users.length > 0) {
			return (
				<ul className="c-colleagues-info-list">
					{users.map((user, index) => (
						<li key={index} className="c-colleague-info-row">
							<div className="c-colleague-info-row__avatar">
								<Avatar
									initials={user.firstName[0] + user.lastName[0]}
									image={user.profileImage}
								/>
							</div>

							<div className="c-colleague-info-row__info">
								<p>{`${user.firstName} ${user.lastName}`}</p>

								<p className="c-colleague-info-row__info__email">
									{truncate(user.email, {
										length: 32,
										separator: ' ',
									})}
								</p>
							</div>

							<div className="c-colleague-info-row__rights">
								<span>{shareUserRightToString(user.rights)}</span>

								{currentUser.rights === ShareUserInfoRights.OWNER && (
									<button
										className="c-icon-button"
										onClick={() =>
											handleEditUserRights(
												user,
												ShareUserInfoRights.CONTRIBUTOR
											)
										}
									>
										<Icon name={IconName.edit2} />
									</button>
								)}
							</div>

							<div className="c-colleague-info-row__action">
								{(currentUser.rights === ShareUserInfoRights.OWNER ||
									currentUser.email === user.email) && (
									<button
										className="c-icon-button"
										onClick={() => handleDeleteUser(user)}
									>
										<Icon name={IconName.delete} />
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			);
		}

		return <p>{tText('Nog geen medewerkers')}</p>;
	};

	const renderColleaguesContent = () => {
		return (
			<>
				{(currentUser.rights === ShareUserInfoRights.OWNER ||
					currentUser.rights === ShareUserInfoRights.CONTRIBUTOR) && (
					<div className="c-add-colleague">
						<TextInput
							type="email"
							className="c-add-colleague__input"
							placeholder={tText('Emailadres')}
							value={newShareUser.email}
							onChange={(value) => updateNewShareUserInfo({ email: value })}
						/>

						<Dropdown isOpen={isRightsDropdownOpen}>
							<DropdownButton>
								<Button
									icon={
										isRightsDropdownOpen ? IconName.caretUp : IconName.caretDown
									}
									iconPosition="right"
									onClick={handleRightsButtonClicked}
									label={
										newShareUser.rights
											? shareUserRightToString(newShareUser.rights)
											: tText('Rol')
									}
									className="c-add-colleague__select"
								/>
							</DropdownButton>

							<DropdownContent>
								<MenuContent
									menuItems={[
										{
											label: tText('Bijdrager'),
											id: ShareUserInfoRights.CONTRIBUTOR,
										},
										{
											label: tText('Kijker'),
											id: ShareUserInfoRights.VIEWER,
										},
									]}
									onClick={(id) => {
										updateNewShareUserInfo({ rights: id as string }),
											handleRightsButtonClicked();
									}}
								/>
							</DropdownContent>
						</Dropdown>

						<Button
							icon={IconName.add}
							label={tText('Voeg toe')}
							className="c-add-colleague__button"
							onClick={handleAddNewUser}
							disabled={isEmpty(newShareUser.email) || isNil(newShareUser.rights)}
						/>
					</div>
				)}

				{renderColleaguesInfoList()}
			</>
		);
	};

	return (
		<Dropdown isOpen={isShareDropdownOpen} className="c-share-dropdown">
			<DropdownButton>
				<Button
					ariaLabel={tText('Delen')}
					label={tText('Delen')}
					title={tText(
						'assignment/components/share-assignment-with-pupil___bezorg-deze-opdrachtlink-aan-je-leerlingen'
					)}
					onClick={handleShareButtonClicked}
					disabled={false}
				/>
			</DropdownButton>

			<DropdownContent>
				<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />

				<div className="c-share-dropdown__content">
					{tab === 'colleagues' ? renderColleaguesContent() : 'leerlingen'}
				</div>
			</DropdownContent>
		</Dropdown>
	);
};

export default withUser(ShareDropdown) as FC<ShareDropdownProps>;
