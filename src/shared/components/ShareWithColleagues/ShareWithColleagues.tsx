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
import { isEmpty, isNil, truncate } from 'lodash-es';
import React, { FC, useState } from 'react';

import { validateEmailAddress } from '../../helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import useTranslation from '../../hooks/useTranslation';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

import EditShareUserRightsModal from './Modals/EditShareUserRightsModal';
import {
	compareUsersEmail,
	contributorRightToString,
	findRightByValue,
	sortContributors,
} from './ShareWithColleagues.helpers';
import './ShareWithColleagues.scss';
import {
	ContributorInfo,
	ContributorInfoRights,
	ShareRightsType,
} from './ShareWithColleagues.types';

type ShareWithColleaguesProps = {
	contributors: ContributorInfo[];
	onAddNewContributor: (info: Partial<ContributorInfo>) => void;
	onEditRights: (info: ContributorInfo, newRights: ShareRightsType) => void;
	onDeleteContributor: (info: ContributorInfo) => void;
	hasModalOpen: (open: boolean) => void;
};

const ShareWithColleagues: FC<ShareWithColleaguesProps & UserProps> = ({
	contributors,
	user,
	onAddNewContributor,
	onDeleteContributor,
	onEditRights,
	hasModalOpen,
}) => {
	const { tText } = useTranslation();
	const currentUser =
		(contributors.find(
			(contributor) => contributor.profileId === user?.profile?.id
		) as ContributorInfo) ||
		({
			rights: 'OWNER',
			email: user?.mail,
			firstName: user?.first_name,
			lastName: user?.last_name,
			profileId: user?.profile?.id,
			profileImage: user?.profile?.avatar,
		} as ContributorInfo);
	const [isRightsDropdownOpen, setIsRightsDropdownOpen] = useState<boolean>(false);
	const [contributor, setNewContributor] = useState<Partial<ContributorInfo>>({
		email: undefined,
		rights: undefined,
	});
	const [error, setError] = useState<string | null>(null);
	const [isEditRightsModalOpen, setIsEditRightsModalOpen] = useState<boolean>(false);
	const [toEditContributor, setToEditContributor] = useState<ContributorInfo | null>(null);
	const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState<boolean>(false);
	const [toDeleteContributor, setToDeleteContributor] = useState<ContributorInfo | null>(null);

	const handleRightsButtonClicked = () => {
		setIsRightsDropdownOpen(!isRightsDropdownOpen);
	};

	const handleAddNewContributor = async () => {
		if (!contributor.email) {
			setError(
				tText(
					'shared/components/share-with-colleagues/share-with-colleagues___email-is-verplicht'
				)
			);
		} else if (!validateEmailAddress(contributor.email)) {
			setError(
				tText(
					'shared/components/share-with-colleagues/share-with-colleagues___email-is-geen-geldig-emailadres'
				)
			);
		} else {
			await onAddNewContributor({
				...contributor,
				rights: findRightByValue(contributor.rights as ContributorInfoRights),
			});
			setNewContributor({ email: undefined, rights: undefined });
			setError(null);
		}
	};

	const handleEditContributorRights = (user: ContributorInfo) => {
		setToEditContributor(user);
		setIsEditRightsModalOpen(true);
		hasModalOpen(true);
	};

	const handleConfirmEditContributorRights = (right: ShareRightsType) => {
		onEditRights(toEditContributor as ContributorInfo, right);
		handleOnCloseEditUserRights();
	};

	const handleOnCloseEditUserRights = () => {
		setIsEditRightsModalOpen(false);
		setToEditContributor(null);
		hasModalOpen(false);
	};

	const handleDeleteContributor = (user: ContributorInfo) => {
		setToDeleteContributor(user);
		setIsDeleteUserModalOpen(true);
		hasModalOpen(true);
	};

	const handleConfirmDeleteContributor = () => {
		onDeleteContributor(toDeleteContributor as ContributorInfo);
		handleOnCloseDeleteContributor();
	};

	const handleOnCloseDeleteContributor = () => {
		setToDeleteContributor(null);
		setIsDeleteUserModalOpen(false);
		hasModalOpen(false);
	};

	const updateNewContributor = (value: Record<string, string>) => {
		setNewContributor({
			...contributor,
			...value,
		});
	};

	const renderColleaguesInfoList = () => {
		if (contributors.length > 0) {
			return (
				<ul className="c-colleagues-info-list">
					{sortContributors(contributors).map((contributor, index) => {
						const isOwner = currentUser.rights === ContributorInfoRights.OWNER;
						const isCurrentUser = currentUser.email === contributor.email;
						const canEdit = isOwner && !isCurrentUser && contributor.profileId;

						// Only the owner can delete any user except for himself
						// And contributor and viewers can only delete themselves
						const canDelete =
							(isOwner && !isCurrentUser) || (!isOwner && isCurrentUser);

						return (
							<li key={index} className="c-colleague-info-row">
								<div className="c-colleague-info-row__avatar">
									{contributor.profileId ? (
										<Avatar
											initials={
												contributor.firstName && contributor.lastName
													? (
															contributor.firstName[0] +
															contributor.lastName[0]
													  ).toLocaleUpperCase()
													: contributor.email?.slice(0, 2).toUpperCase()
											}
											image={contributor.profileImage}
										/>
									) : (
										<div className="c-colleague-info-row__avatar--pending" />
									)}
								</div>

								<div className="c-colleague-info-row__info">
									{(contributor.firstName || contributor.lastName) && (
										<p>{`${contributor.firstName} ${contributor.lastName}`}</p>
									)}

									<p className="c-colleague-info-row__info__email">
										{!isNil(contributor.profileId)
											? truncate(contributor.email, { length: 32 })
											: `${contributor.inviteEmail} (${tText(
													'shared/components/share-with-colleagues/share-with-colleagues___pending'
											  )})`}
									</p>
								</div>

								<div className="c-colleague-info-row__rights">
									<span>
										{contributorRightToString(
											contributor.rights as ContributorInfoRights
										)}
									</span>

									{canEdit && (
										<button
											className="c-icon-button"
											onClick={() => handleEditContributorRights(contributor)}
										>
											<Icon name={IconName.edit4} />
										</button>
									)}
								</div>

								<div className="c-colleague-info-row__action">
									{canDelete && (
										<button
											className="c-icon-button"
											onClick={() => handleDeleteContributor(contributor)}
										>
											<Icon name={IconName.trash} />
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
			{(currentUser.rights === ContributorInfoRights.OWNER ||
				currentUser.rights === ContributorInfoRights.CONTRIBUTOR) && (
				<>
					<div className="c-add-colleague">
						<TextInput
							type="email"
							className="c-add-colleague__input"
							placeholder={tText(
								'shared/components/share-with-colleagues/share-with-colleagues___emailadres'
							)}
							value={contributor.email}
							onChange={(value) => updateNewContributor({ email: value })}
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
										contributor.rights
											? contributorRightToString(
													contributor.rights as ContributorInfoRights
											  )
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
											id: ContributorInfoRights.CONTRIBUTOR,
										},
										{
											label: tText(
												'shared/components/share-with-colleagues/share-with-colleagues___kijker'
											),
											id: ContributorInfoRights.VIEWER,
										},
									]}
									onClick={(id) => {
										updateNewContributor({ rights: id as string }),
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
							onClick={handleAddNewContributor}
							disabled={isEmpty(contributor.email) || !contributor.rights}
							type="secondary"
						/>
					</div>

					{error && <p className="c-add-colleague__error">{error}</p>}

					<EditShareUserRightsModal
						currentRight={toEditContributor?.rights as ContributorInfoRights}
						isOpen={isEditRightsModalOpen}
						handleClose={() => handleOnCloseEditUserRights()}
						handleConfirm={(right) => handleConfirmEditContributorRights(right)}
					/>

					{toDeleteContributor && (
						<ConfirmModal
							title={
								compareUsersEmail(
									toDeleteContributor as ContributorInfo,
									currentUser
								)
									? tText(
											'shared/components/share-with-colleagues/share-with-colleagues___opdracht-verlaten'
									  )
									: tText(
											'shared/components/share-with-colleagues/share-with-colleagues___toegang-intrekken'
									  )
							}
							body={
								compareUsersEmail(
									toDeleteContributor as ContributorInfo,
									currentUser
								)
									? tText(
											'shared/components/share-with-colleagues/share-with-colleagues___ben-je-zeker-dat-je-deze-opdracht-wilt-verlaten-als-kijker-deze-actie-kan-niet-ongedaan-gemaakt-worden'
									  )
									: tText(
											'shared/components/share-with-colleagues/share-with-colleagues___ben-je-zeker-dat-je-voor-deze-lesgever-de-toegang-wil-intrekken-dit-wil-zeggen-dat-deze-persoon-de-opdracht-niet-meer-kan-bekijken-of-bewerken'
									  )
							}
							confirmLabel={
								compareUsersEmail(
									toDeleteContributor as ContributorInfo,
									currentUser
								)
									? tText(
											'shared/components/share-with-colleagues/share-with-colleagues___verlaat-opdracht'
									  )
									: tText(
											'shared/components/share-with-colleagues/share-with-colleagues___trek-toegang-in'
									  )
							}
							isOpen={isDeleteUserModalOpen}
							confirmCallback={handleConfirmDeleteContributor}
							onClose={() => handleOnCloseDeleteContributor()}
						/>
					)}
				</>
			)}

			{renderColleaguesInfoList()}
		</>
	);
};

export default withUser(ShareWithColleagues) as FC<ShareWithColleaguesProps>;
