import {
	Avatar,
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	IconName,
	MenuContent,
	TextInput,
} from '@viaa/avo2-components';
import { isEmpty, isNil, truncate } from 'lodash';
import React, { FC, useState } from 'react';

import withUser, { UserProps } from '../../hocs/withUser';
import useTranslation from '../../hooks/useTranslation';

import DeleteShareUserModal from './Modals/DeleteShareUserModal';
import EditShareUserRightsModal from './Modals/EditShareUserRightsModal';
import { shareUserRightToString, sortShareUsers } from './ShareWithColleagues.helpers';
import './ShareWithColleagues.scss';
import { ShareUserInfo, ShareUserInfoRights } from './ShareWithColleagues.types';

type ShareWithColleaguesProps = {
	users: ShareUserInfo[];
	onAddNewUser: (info: Partial<ShareUserInfo>) => void;
	onEditRights: (info: ShareUserInfo, newRights: ShareUserInfoRights) => void;
	onDeleteUser: (info: ShareUserInfo) => void;
};

const ShareWithColleagues: FC<ShareWithColleaguesProps & UserProps> = ({
	users,
	user,
	onAddNewUser,
	onDeleteUser,
	onEditRights,
}) => {
	const { tText } = useTranslation();
	const currentUser = users.find((u) => u.email === user?.mail) as ShareUserInfo;
	const [isRightsDropdownOpen, setIsRightsDropdownOpen] = useState<boolean>(false);
	const [newShareUser, setNewShareUser] = useState<Partial<ShareUserInfo>>({
		email: undefined,
		rights: undefined,
	});
	const [error, setError] = useState<string | null>(null);
	const [isEditRightsModalOpen, setIsEditRightsModalOpen] = useState<boolean>(false);
	const [toEditShareUser, setToEditShareUser] = useState<ShareUserInfo>();
	const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState<boolean>(false);
	const [toDeleteShareUser, setToDeleteShareUser] = useState<ShareUserInfo>();

	const handleRightsButtonClicked = () => {
		setIsRightsDropdownOpen(!isRightsDropdownOpen);
	};

	const handleAddNewUser = () => {
		if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(newShareUser.email as string)) {
			onAddNewUser(newShareUser);
			setError(null);
		} else {
			setError(
				tText(
					'shared/components/share-with-colleagues/share-with-colleagues___email-is-geen-geldig-emailadres'
				)
			);
		}
	};

	const handleEditUserRights = (user: ShareUserInfo) => {
		setToEditShareUser(user);
		setIsEditRightsModalOpen(true);
	};

	const handleConfirmEditUserRights = (right: ShareUserInfoRights) => {
		onEditRights(toEditShareUser as ShareUserInfo, right);
		setToEditShareUser(undefined);
		setIsEditRightsModalOpen(false);
	};

	const handleDeleteUser = (user: ShareUserInfo) => {
		setToDeleteShareUser(user);
		setIsDeleteUserModalOpen(true);
	};

	const handleConfirmDeleteUser = () => {
		onDeleteUser(toDeleteShareUser as ShareUserInfo);
		setToDeleteShareUser(undefined);
		setIsDeleteUserModalOpen(false);
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
					{sortShareUsers(users).map((user, index) => (
						<li
							key={`colleagues-info-list-item-${index}`}
							className="c-colleague-info-row"
						>
							<div className="c-colleague-info-row__avatar">
								<Avatar
									initials={
										user.firstName && user.lastName
											? user.firstName[0] + user.lastName[0]
											: user.email.slice(0, 2).toUpperCase()
									}
									image={user.profileImage}
								/>
							</div>

							<div className="c-colleague-info-row__info">
								{(user.firstName || user.lastName) && (
									<p>{`${user.firstName} ${user.lastName}`}</p>
								)}

								<p className="c-colleague-info-row__info__email">
									{truncate(user.email, {
										length: 32,
										separator: ' ',
									})}
								</p>
							</div>

							<div className="c-colleague-info-row__rights">
								<span>{shareUserRightToString(user.rights)}</span>

								{currentUser.rights === ShareUserInfoRights.OWNER &&
									currentUser.email !== user.email && (
										<button
											className="c-icon-button"
											onClick={() => handleEditUserRights(user)}
										>
											<Icon name={IconName.edit2} />
										</button>
									)}
							</div>

							<div className="c-colleague-info-row__action">
								{((currentUser.rights === ShareUserInfoRights.OWNER &&
									currentUser.email !== user.email) ||
									(currentUser.rights !== ShareUserInfoRights.OWNER &&
										currentUser.email === user.email)) && (
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
	};

	return (
		<>
			{(currentUser.rights === ShareUserInfoRights.OWNER ||
				currentUser.rights === ShareUserInfoRights.CONTRIBUTOR) && (
				<>
					<div className="c-add-colleague">
						<TextInput
							type="email"
							className="c-add-colleague__input"
							placeholder={tText(
								'shared/components/share-with-colleagues/share-with-colleagues___emailadres'
							)}
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
											: tText(
													'shared/components/share-with-colleagues/share-with-colleagues___rol'
											  )
									}
									className="c-add-colleague__select"
								/>
							</DropdownButton>

							<DropdownContent>
								<MenuContent
									menuItems={[
										{
											label: tText(
												'shared/components/share-with-colleagues/share-with-colleagues___bijdrager'
											),
											id: ShareUserInfoRights.CONTRIBUTOR,
										},
										{
											label: tText(
												'shared/components/share-with-colleagues/share-with-colleagues___kijker'
											),
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
							label={tText(
								'shared/components/share-with-colleagues/share-with-colleagues___voeg-toe'
							)}
							className="c-add-colleague__button"
							onClick={handleAddNewUser}
							disabled={isEmpty(newShareUser.email) || isNil(newShareUser.rights)}
						/>
					</div>

					{error && <p className="c-add-colleague__error">{error}</p>}

					<EditShareUserRightsModal
						currentRight={toEditShareUser?.rights as ShareUserInfoRights}
						isOpen={isEditRightsModalOpen}
						handleClose={() => setIsEditRightsModalOpen(false)}
						handleConfirm={(right) => handleConfirmEditUserRights(right)}
					/>

					<DeleteShareUserModal
						user={toDeleteShareUser as ShareUserInfo}
						currentUser={currentUser}
						isOpen={isDeleteUserModalOpen}
						onConfirm={handleConfirmDeleteUser}
						onClose={() => setIsDeleteUserModalOpen(false)}
					/>
				</>
			)}

			{renderColleaguesInfoList()}
		</>
	);
};

export default withUser(ShareWithColleagues) as FC<ShareWithColleaguesProps>;
