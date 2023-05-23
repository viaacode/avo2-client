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
import { isEmpty, truncate } from 'lodash-es';
import React, { FC, useState } from 'react';

import { validateEmailAddress } from '../../helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import useTranslation from '../../hooks/useTranslation';

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

	const handleRightsButtonClicked = () => {
		setIsRightsDropdownOpen(!isRightsDropdownOpen);
	};

	const handleAddNewUser = async () => {
		if (!newShareUser.email) {
			setError(
				tText(
					'shared/components/share-with-colleagues/share-with-colleagues___email-is-verplicht'
				)
			);
		} else if (!validateEmailAddress(newShareUser.email)) {
			setError(
				tText(
					'shared/components/share-with-colleagues/share-with-colleagues___email-is-geen-geldig-emailadres'
				)
			);
		} else {
			await onAddNewUser(newShareUser);
			setNewShareUser({ email: undefined, rights: undefined });
			setError(null);
		}
	};

	const handleEditUserRights = (user: ShareUserInfo) => {
		setToEditShareUser(user);
		setIsEditRightsModalOpen(true);
	};

	const handleConfirmEditUserRights = (right: ShareUserInfoRights) => {
		onEditRights(toEditShareUser as ShareUserInfo, right);
		setToEditShareUser(undefined);
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
					{sortShareUsers(users).map((contributorUser, index) => {
						const isOwner = currentUser.rights === ShareUserInfoRights.OWNER;
						const isCurrentUser = currentUser.email === contributorUser.email;
						const canEdit = isOwner && !isCurrentUser;

						// Only the owner can delete any user except for himself
						// And contributor and viewers can only delete themselves
						const canDelete =
							(isOwner && !isCurrentUser) || (!isOwner && isCurrentUser);

						return (
							<li key={index} className="c-colleague-info-row">
								<div className="c-colleague-info-row__avatar">
									<Avatar
										initials={
											contributorUser.firstName && contributorUser.lastName
												? contributorUser.firstName[0] +
												  contributorUser.lastName[0]
												: contributorUser.email.slice(0, 2).toUpperCase()
										}
										image={contributorUser.profileImage}
									/>
								</div>

								<div className="c-colleague-info-row__info">
									{(contributorUser.firstName || contributorUser.lastName) && (
										<p>{`${contributorUser.firstName} ${contributorUser.lastName}`}</p>
									)}

									<p className="c-colleague-info-row__info__email">
										{truncate(contributorUser.email, { length: 32 })}
									</p>
								</div>

								<div className="c-colleague-info-row__rights">
									<span>{shareUserRightToString(contributorUser.rights)}</span>

									{canEdit && (
										<button
											className="c-icon-button"
											onClick={() => handleEditUserRights(contributorUser)}
										>
											<Icon name={IconName.edit2} />
										</button>
									)}
								</div>

								<div className="c-colleague-info-row__action">
									{canDelete && (
										<button
											className="c-icon-button"
											onClick={() => handleDeleteUser(contributorUser)}
										>
											<Icon name={IconName.delete} />
										</button>
									)}
								</div>
							</li>
						);
					})}
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
							disabled={isEmpty(newShareUser.email) || !newShareUser.rights}
						/>
					</div>

					{error && <p className="c-add-colleague__error">{error}</p>}

					<EditShareUserRightsModal
						currentRight={toEditShareUser?.rights as ShareUserInfoRights}
						isOpen={isEditRightsModalOpen}
						handleClose={() => {
							setIsEditRightsModalOpen(false);
							setToEditShareUser(undefined);
						}}
						handleConfirm={(right) => {
							handleConfirmEditUserRights(right);
							setToEditShareUser(undefined);
							setIsEditRightsModalOpen(false);
						}}
					/>
				</>
			)}

			{renderColleaguesInfoList()}
		</>
	);
};

export default withUser(ShareWithColleagues) as FC<ShareWithColleaguesProps>;
