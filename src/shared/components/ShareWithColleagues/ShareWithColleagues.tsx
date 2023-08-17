import {
	Avatar,
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	Icon,
	IconName,
	MenuContent,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import { isEmpty, isNil, truncate } from 'lodash-es';
import React, { FC, useState } from 'react';

import { validateEmailAddress } from '../../helpers';
import withUser, { UserProps } from '../../hocs/withUser';
import useTranslation from '../../hooks/useTranslation';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

import EditShareUserRightsModal from './Modals/EditShareUserRightsModal';
import {
	compareUsersEmail,
	findRightByValue,
	getContributorRightLabels,
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
	availableRights: {
		[ContributorInfoRights.CONTRIBUTOR]: PermissionName;
		[ContributorInfoRights.VIEWER]: PermissionName;
	};
	isAdmin: boolean;
	onAddNewContributor: (info: Partial<ContributorInfo>) => Promise<void>;
	onEditRights: (info: ContributorInfo, newRights: ShareRightsType) => Promise<void>;
	onDeleteContributor: (info: ContributorInfo) => Promise<void>;
	hasModalOpen: (open: boolean) => void;
};

const ShareWithColleagues: FC<ShareWithColleaguesProps & UserProps> = ({
	contributors,
	user,
	commonUser,
	availableRights,
	onAddNewContributor,
	onDeleteContributor,
	onEditRights,
	hasModalOpen,
	isAdmin,
}) => {
	const { tText } = useTranslation();
	const currentUser =
		(contributors.find(
			(contributor) => contributor.profileId === user?.profile?.id
		) as ContributorInfo) ||
		({
			rights: ContributorInfoRights.OWNER,
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
	const [isLoading, setIsLoading] = useState<boolean>(false);

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
			setIsLoading(true);
			await onAddNewContributor({
				...contributor,
				rights: findRightByValue(contributor.rights as ContributorInfoRights),
			});
			setNewContributor({ email: undefined, rights: undefined });
			setError(null);
			setIsLoading(false);
		}
	};

	const handleEditContributorRights = (user: ContributorInfo) => {
		setToEditContributor(user);
		setIsEditRightsModalOpen(true);
		hasModalOpen(true);
	};

	const handleConfirmEditContributorRights = async (right: ShareRightsType) => {
		await onEditRights(toEditContributor as ContributorInfo, right);
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

	const handleConfirmDeleteContributor = async () => {
		await onDeleteContributor(toDeleteContributor as ContributorInfo);
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
						const currentUserIsContributor =
							currentUser.rights === ContributorInfoRights.CONTRIBUTOR;
						const contributorIsOwner =
							contributor.rights === ContributorInfoRights.OWNER;
						const isCurrentUser = currentUser.email === contributor.email;
						const canEdit =
							(!isCurrentUser && !contributorIsOwner) ||
							(!isOwner && isCurrentUser) ||
							(currentUserIsContributor && !contributorIsOwner) ||
							(isAdmin && !contributorIsOwner);

						// The owner cannot delete himself but can delete everyone else
						// Contributors can delete themselves and every other contributor and viewer
						// Viewers can only delete themselves, but they do not have access to this dialog
						const canDelete =
							(!isCurrentUser && !contributorIsOwner) ||
							(!isOwner && isCurrentUser) ||
							(currentUserIsContributor && !contributorIsOwner) ||
							(isAdmin && !contributorIsOwner);

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
									<span>{getContributorRightLabels()[contributor.rights]}</span>
								</div>

								<div className="c-colleague-info-row__action">
									{canEdit && (
										<button
											className="c-icon-button"
											onClick={() => handleEditContributorRights(contributor)}
										>
											<Icon name={IconName.edit4} />
										</button>
									)}
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

	const rightsDropdownOptions = [
		...(commonUser?.permissions?.includes(availableRights.CONTRIBUTOR)
			? [
					{
						label: tText(
							'shared/components/share-with-colleagues/share-with-colleagues___bijdrager'
						),
						id: ContributorInfoRights.CONTRIBUTOR,
					},
			  ]
			: []),
		...(commonUser?.permissions?.includes(availableRights.VIEWER)
			? [
					{
						label: tText(
							'shared/components/share-with-colleagues/share-with-colleagues___kijker'
						),
						id: ContributorInfoRights.VIEWER,
					},
			  ]
			: []),
	];
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
											? getContributorRightLabels()[contributor.rights]
											: tText(
													'shared/components/share-with-colleagues/share-with-colleagues___rol'
											  )
									}
									className="c-add-colleague__select"
								/>
							</DropdownButton>

							<DropdownContent>
								<MenuContent
									menuItems={rightsDropdownOptions}
									onClick={(id) => {
										updateNewContributor({ rights: id as string });
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

			{isLoading && (
				<Spacer margin={'small'}>
					<Flex>
						<Spinner />
					</Flex>
				</Spacer>
			)}
		</>
	);
};

export default withUser(ShareWithColleagues) as FC<ShareWithColleaguesProps>;
