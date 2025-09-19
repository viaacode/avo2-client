import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Alert,
	Box,
	Button,
	Column,
	Container,
	Flex,
	Form,
	FormGroup,
	Grid,
	Select,
	Spacer,
	Spinner,
	Table,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { compact, isNil, map } from 'lodash-es';
import { stringifyUrl } from 'query-string';
import React, { type FC, type ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { type Dispatch } from 'redux';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { SERVER_LOGOUT_PAGE } from '../../authentication/authentication.const';
import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import {
	getLoginResponse,
	getLoginStateAction,
	setLoginSuccess,
} from '../../authentication/store/authentication.store.actions';
import { GENERATE_SITE_TITLE } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import CommonMetadata from '../../shared/components/CommonMetaData/CommonMetaData';
import { EducationalOrganisationsSelect } from '../../shared/components/EducationalOrganisationsSelect/EducationalOrganisationsSelect';
import FileUpload from '../../shared/components/FileUpload/FileUpload';
import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import { formatDate } from '../../shared/helpers/formatters';
import { groupLomLinks, groupLoms } from '../../shared/helpers/lom';
import { stringsToTagList } from '../../shared/helpers/strings-to-taglist';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { OrganisationService } from '../../shared/services/organizations-service';
import { ToastService } from '../../shared/services/toast-service';
import store from '../../store';
import { USERS_IN_SAME_COMPANY_COLUMNS } from '../settings.const';
import { SettingsService } from '../settings.service';
import { type UsersInSameCompanyColumn } from '../settings.types';

import './Profile.scss';

type FieldPermissionKey =
	| 'SUBJECTS'
	| 'EDUCATION_LEVEL'
	| 'EDUCATIONAL_ORGANISATION'
	| 'ORGANISATION';

interface FieldPermission {
	VIEW: boolean;
	EDIT: boolean;
	REQUIRED: boolean;
}

interface FieldPermissions {
	THEME: FieldPermission;
	SUBJECTS: FieldPermission;
	EDUCATION_LEVEL: FieldPermission;
	EDUCATIONAL_ORGANISATION: FieldPermission;
	ORGANISATION: FieldPermission & { VIEW_USERS_IN_SAME_COMPANY: boolean };
}

const Profile: FC<
	{
		getLoginState: (forceRefetch: boolean) => Dispatch;
	} & UserProps &
		DefaultSecureRouteProps
> = ({ commonUser, getLoginState }) => {
	const { tText, tHtml } = useTranslation();
	const [selectedOrganisations, setSelectedOrganisations] = useState<
		Avo.EducationOrganization.Organization[]
	>(commonUser?.educationalOrganisations || []);
	const [selectedLoms, setSelectedLoms] = useState<Avo.Lom.LomField[]>(
		compact(map(commonUser?.loms, 'lom'))
	);

	const firstName = commonUser?.firstName || '';
	const lastName = commonUser?.lastName || '';
	const email = commonUser?.email || '';
	const [alias, setAlias] = useState<string>(commonUser?.alias ?? '');
	const [avatar, setAvatar] = useState<string | null>(commonUser?.avatar || null);
	const [title, setTitle] = useState<string | null>(commonUser?.title || null);
	const [bio, setBio] = useState<string | null>(commonUser?.bio || null);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [allOrganisations, setAllOrganisations] = useState<
		Partial<Avo.Organization.Organization>[] | null
	>(null);
	const [companyId, setCompanyId] = useState<string | null>(commonUser?.companyId || null);
	const [uiPermissions, setUiPermissions] = useState<FieldPermissions | null>(null);
	const [profileErrors, setProfileErrors] = useState<
		Partial<{ [prop in keyof Avo.User.UpdateProfileValues]: string }>
	>({});
	const [usersInSameCompany, setUsersInSameCompany] = useState<Partial<Avo.User.Profile>[]>([]);

	const isExceptionAccount = commonUser?.isException || false;

	const isPupil = [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
		.map(String)
		.includes(String(commonUser.userGroup?.id));

	useEffect(() => {
		const tempUiPermissions = {
			THEME: {
				VIEW: !!commonUser?.permissions?.includes(
					PermissionName.VIEW_THEME_ON_PROFILE_PAGE
				),
				EDIT: !!commonUser?.permissions?.includes(
					PermissionName.EDIT_THEME_ON_PROFILE_PAGE
				),
				REQUIRED:
					!!commonUser?.permissions?.includes(
						PermissionName.REQUIRED_THEME_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			SUBJECTS: {
				VIEW: !!commonUser?.permissions?.includes(
					PermissionName.VIEW_SUBJECTS_ON_PROFILE_PAGE
				),
				EDIT: !!commonUser?.permissions?.includes(
					PermissionName.EDIT_SUBJECTS_ON_PROFILE_PAGE
				),
				REQUIRED:
					!!commonUser?.permissions?.includes(
						PermissionName.REQUIRED_SUBJECTS_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			EDUCATION_LEVEL: {
				VIEW:
					!!commonUser?.permissions?.includes(
						PermissionName.VIEW_EDUCATION_LEVEL_ON_PROFILE_PAGE
					) &&
					(!isExceptionAccount ||
						groupLomLinks(commonUser?.loms)?.educationLevel?.length > 0 ||
						commonUser?.userGroup?.id !== SpecialUserGroupId.Teacher),
				EDIT:
					!!commonUser?.permissions?.includes(
						PermissionName.EDIT_EDUCATION_LEVEL_ON_PROFILE_PAGE
					) && !isExceptionAccount,
				REQUIRED:
					!!commonUser?.permissions?.includes(
						PermissionName.REQUIRED_EDUCATION_LEVEL_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			EDUCATIONAL_ORGANISATION: {
				VIEW: !!commonUser?.permissions?.includes(
					PermissionName.VIEW_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE
				),
				EDIT:
					!!commonUser?.permissions?.includes(
						PermissionName.EDIT_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE
					) && !isExceptionAccount,
				REQUIRED:
					!!commonUser?.permissions?.includes(
						PermissionName.REQUIRED_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			ORGANISATION: {
				VIEW: !!commonUser?.permissions?.includes(
					PermissionName.VIEW_ORGANISATION_ON_PROFILE_PAGE
				),
				EDIT: !!commonUser?.permissions?.includes(
					PermissionName.EDIT_ORGANISATION_ON_PROFILE_PAGE
				),
				REQUIRED: !!commonUser?.permissions?.includes(
					PermissionName.REQUIRED_ORGANISATION_ON_PROFILE_PAGE
				),
				VIEW_USERS_IN_SAME_COMPANY: !!commonUser?.permissions?.includes(
					PermissionName.VIEW_USERS_IN_SAME_COMPANY
				),
			},
		};
		setUiPermissions(tempUiPermissions);
	}, [isExceptionAccount, commonUser]);

	useEffect(() => {
		if (!uiPermissions) {
			return;
		}

		// TODO for view we should use the company name from the profile object instead of the company_id and lookup in the list
		// Waiting for: https://meemoo.atlassian.net/browse/DEV-985
		if (uiPermissions.ORGANISATION.VIEW || uiPermissions.ORGANISATION.EDIT) {
			OrganisationService.fetchOrganisations(false)
				.then(setAllOrganisations)
				.catch((err) => {
					console.error(
						new CustomError('Failed to get organisations from database', err)
					);
					ToastService.danger(
						tHtml(
							'settings/components/profile___het-ophalen-van-de-organisaties-is-mislukt'
						)
					);
				});
		}

		if (commonUser?.companyId && uiPermissions.ORGANISATION.VIEW_USERS_IN_SAME_COMPANY) {
			OrganisationService.fetchUsersByCompanyId(commonUser?.companyId)
				.then((usersInSameCompany) => {
					setUsersInSameCompany(
						usersInSameCompany.filter((profile) => profile.id !== commonUser?.profileId)
					);
				})
				.catch((err) => {
					console.error(
						new CustomError(
							'Failed to get users in the same company from database',
							err
						)
					);
					ToastService.danger(
						tHtml(
							'settings/components/profile___het-ophalen-van-de-gebruikers-in-dezelfde-organisatie-is-mislukt'
						)
					);
				});
		}
	}, [uiPermissions, tText, commonUser, setAllOrganisations, tHtml]);

	const areRequiredFieldsFilledIn = (profileInfo: Partial<Avo.User.UpdateProfileValues>) => {
		if (!uiPermissions) {
			return false;
		}
		const errors = [];
		let filledIn = true;
		const groupedLoms = groupLoms(selectedLoms);

		if (
			uiPermissions.SUBJECTS.REQUIRED &&
			uiPermissions.SUBJECTS.EDIT &&
			!groupedLoms.subject?.length
		) {
			errors.push(tText('settings/components/profile___vakken-zijn-verplicht'));
			filledIn = false;
		}
		if (
			uiPermissions.THEME.REQUIRED &&
			uiPermissions.THEME.EDIT &&
			!groupedLoms.theme?.length
		) {
			errors.push(tText('settings/components/profile___themas-zijn-verplicht'));
			filledIn = false;
		}
		if (
			uiPermissions.EDUCATION_LEVEL.REQUIRED &&
			uiPermissions.EDUCATION_LEVEL.EDIT &&
			!groupedLoms.educationLevel?.length
		) {
			errors.push(tText('settings/components/profile___opleidingsniveau-is-verplicht'));
			filledIn = false;
		}
		if (
			uiPermissions.EDUCATIONAL_ORGANISATION.REQUIRED &&
			uiPermissions.EDUCATIONAL_ORGANISATION.EDIT &&
			!profileInfo.organizations?.length
		) {
			errors.push(tText('settings/components/profile___educatieve-organisatie-is-verplicht'));
			filledIn = false;
		}
		if (
			uiPermissions.ORGANISATION.REQUIRED &&
			uiPermissions.ORGANISATION.EDIT &&
			!profileInfo.company_id
		) {
			errors.push(tText('settings/components/profile___organisatie-is-verplicht'));
			filledIn = false;
		}
		if (errors.length) {
			ToastService.danger(errors);
		}
		return filledIn;
	};

	const saveProfileChanges = async () => {
		try {
			setIsSaving(true);
			const profileId: string = commonUser?.profileId;
			const newProfileInfo: Partial<Avo.User.UpdateProfileValues> = {
				firstName,
				lastName,
				alias,
				title,
				bio,
				userId: commonUser.userId,
				avatar: avatar || null,
				loms: (selectedLoms || []).map((lom) => ({
					profile_id: profileId,
					lom_id: lom.id,
				})),
				organizations: (selectedOrganisations || []).map((option) => ({
					profile_id: profileId,
					organization_id: option.organisationId,
					unit_id: option.unitId || null,
				})),
				company_id: companyId || null,
			};
			if (!areRequiredFieldsFilledIn(newProfileInfo)) {
				setIsSaving(false);
				return;
			}
			try {
				await SettingsService.updateProfileInfo(newProfileInfo);
			} catch (err) {
				setIsSaving(false);
				if (JSON.stringify(err).includes('DUPLICATE_ALIAS')) {
					ToastService.danger(
						tText('settings/components/profile___deze-schermnaam-is-reeds-in-gebruik')
					);
					setProfileErrors({
						alias: tText(
							'settings/components/profile___schermnaam-is-reeds-in-gebruik'
						),
					});
					return;
				}
				throw err;
			}

			// Refresh the login state, so the profile info will be up-to-date
			const loginResponse: Avo.Auth.LoginResponse = await getLoginResponse();
			store.dispatch(setLoginSuccess(loginResponse));

			getLoginState(true);
			ToastService.success(tHtml('settings/components/profile___opgeslagen'));
			setIsSaving(false);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml(
					'settings/components/profile___het-opslaan-van-de-profiel-information-is-mislukt'
				)
			);
			setIsSaving(false);
		}
	};

	const renderOrganisationField = (editable: boolean, required: boolean) => {
		if (!uiPermissions?.ORGANISATION?.VIEW) {
			return null;
		}
		return (
			<FormGroup
				label={tText('settings/components/profile___organisatie')}
				labelFor="organisation"
				required={required}
			>
				{editable ? (
					<Select
						options={compact(
							(allOrganisations || []).map((org) => {
								if (!org.name || !org.or_id) {
									return null;
								}
								return {
									label: org.name,
									value: org.or_id,
								};
							})
						)}
						value={companyId}
						onChange={setCompanyId}
					/>
				) : !companyId ? (
					'-'
				) : (
					(allOrganisations || []).find((org) => org.or_id === companyId)?.name ||
					tText('settings/components/profile___onbekende-organisatie')
				)}
			</FormGroup>
		);
	};

	const renderEducationOrganisationsField = (editable: boolean, required: boolean) => {
		if (
			// Don't show schools on profile page if no schools exist
			((commonUser?.educationalOrganisations || []).length === 0 && isExceptionAccount) ||
			// Only show schools if user has permissions to see them
			!uiPermissions?.EDUCATIONAL_ORGANISATION?.VIEW
		) {
			return null;
		}
		return (
			<FormGroup
				label={tText('settings/components/profile___school-organisatie')}
				labelFor="educationalOrganizations"
				required={required}
			>
				{editable ? (
					<>
						<EducationalOrganisationsSelect
							organisations={selectedOrganisations}
							onChange={setSelectedOrganisations}
						/>
						<Alert
							type="info"
							message={tText(
								'settings/components/profile___vind-je-je-onderwijsinstelling-niet-contacteer-ons-via-de-feedback-knop'
							)}
						/>
					</>
				) : (
					stringsToTagList(selectedOrganisations.map((org) => org.organisationLabel))
				)}
			</FormGroup>
		);
	};

	const renderFieldVisibleOrRequired = (
		permissionName: FieldPermissionKey,
		renderFunc: (editable: boolean, required: boolean) => ReactNode
	) => {
		if (!uiPermissions) {
			return null;
		}
		if (uiPermissions[permissionName].VIEW) {
			return renderFunc(
				uiPermissions[permissionName].EDIT,
				uiPermissions[permissionName].REQUIRED
			);
		}
		return null;
	};

	const renderUsersInSameCompanyTableCell = (
		profile: Partial<Avo.User.Profile>,
		columnId: UsersInSameCompanyColumn
	) => {
		switch (columnId) {
			case 'full_name':
				return commonUser?.fullName || '-';

			case 'mail':
				return commonUser?.email || '-';

			case 'user_group':
				return commonUser?.userGroup?.label || '-';

			case 'is_blocked':
				return commonUser?.isBlocked
					? tText('settings/components/profile___ja')
					: tText('settings/components/profile___nee');

			case 'last_access_at': {
				const lastAccessDate = commonUser?.lastAccessAt;
				return !isNil(lastAccessDate) ? formatDate(lastAccessDate) : '-';
			}

			case 'temp_access': {
				const tempAccess = profile?.user?.temp_access;

				return tempAccess?.current?.status === 1
					? `${tText('settings/components/profile___van')} ${formatDate(
							tempAccess?.from
					  )} ${tText('settings/components/profile___tot')} ${formatDate(
							tempAccess?.until
					  )}`
					: '-';
			}
		}
	};

	const generateEditProfileInfoLink = () => {
		return stringifyUrl({
			url: getEnv('SSUM_ACCOUNT_EDIT_URL') || '',
			query: {
				redirect_to: stringifyUrl({
					url: getEnv('PROXY_URL') + '/' + SERVER_LOGOUT_PAGE,
					query: {
						returnToUrl: window.location.href,
					},
				}),
			},
		});
	};

	const renderProfilePage = () => {
		return (
			<Container mode="vertical" className="p-profile-page">
				<Spacer margin="bottom-extra-large">
					<Grid>
						<Column size="3-7">
							<Form type="standard">
								<>
									<div className="profile-actions">
										<FormGroup
											label={tText('settings/components/account___voornaam')}
											labelFor="first_name"
										>
											{firstName}
										</FormGroup>
										<a href={generateEditProfileInfoLink()}>
											<Button
												type="secondary"
												label={tText(
													'settings/components/account___wijzig-gegevens'
												)}
											/>
										</a>
									</div>
									<FormGroup
										label={tText('settings/components/account___achternaam')}
										labelFor="last_name"
									>
										{lastName}
									</FormGroup>
									{!isPupil && (
										<>
											<FormGroup
												label={tText('settings/components/account___email')}
												labelFor="email"
											>
												{email}
											</FormGroup>
											<FormGroup
												label={tText(
													'settings/components/profile___nickname'
												)}
												labelFor="alias"
												error={profileErrors?.alias}
											>
												<TextInput
													id="alias"
													placeholder={tText(
														'settings/components/profile___een-unieke-gebruikersnaam'
													)}
													value={alias || ''}
													onChange={setAlias}
												/>
											</FormGroup>
											<FormGroup
												label={tText(
													'settings/components/profile___functie'
												)}
												labelFor="title"
											>
												<TextInput
													id="title"
													placeholder={tText(
														'settings/components/profile___bv-leerkracht-basis-onderwijs'
													)}
													value={title || ''}
													onChange={setTitle}
												/>
											</FormGroup>
											{!commonUser?.organisation && commonUser?.profileId && (
												<FormGroup
													label={tText(
														'settings/components/profile___profielfoto'
													)}
													labelFor="profilePicture"
												>
													<FileUpload
														label={tText(
															'settings/components/profile___upload-een-profiel-foto'
														)}
														urls={compact([avatar])}
														allowMulti={false}
														assetType="PROFILE_AVATAR"
														ownerId={commonUser?.profileId}
														onChange={(urls) => setAvatar(urls[0])}
													/>
												</FormGroup>
											)}
											{!!commonUser?.organisation?.logo_url && (
												<div
													className="c-logo-preview"
													style={{
														backgroundImage: `url(${commonUser?.organisation?.logo_url})`,
													}}
												/>
											)}
											<FormGroup
												label={tText('settings/components/profile___bio')}
												labelFor="bio"
											>
												<TextArea
													name="bio"
													id="bio"
													height="medium"
													placeholder={tText(
														'settings/components/profile___een-korte-beschrijving-van-jezelf'
													)}
													value={bio || ''}
													onChange={setBio}
												/>
											</FormGroup>

											{/* Show readonly education on profile page */}
											<CommonMetadata
												enabledMetaData={
													uiPermissions?.EDUCATION_LEVEL?.VIEW
														? [SearchFilter.educationLevel]
														: []
												}
												subject={{
													loms: selectedLoms.map(
														(lomField) =>
															({
																lom: lomField,
															}) as Avo.Lom.Lom
													),
													id: commonUser.profileId,
												}}
												renderSearchLink={(content) => content}
											/>
											<LomFieldsInput
												loms={selectedLoms || []}
												onChange={(newLoms) => setSelectedLoms(newLoms)}
												subjectsPlaceholder={tText(
													'settings/components/profile___selecteer-de-vakken-die-je-geeft'
												)}
												themesPlaceholder={tText(
													'settings/components/profile___selecteer-je-themas'
												)}
												showEducation={false}
												showEducationDegrees={
													uiPermissions?.EDUCATION_LEVEL?.VIEW
												}
												isThemesRequired={uiPermissions?.THEME?.REQUIRED}
												isSubjectsRequired={
													uiPermissions?.SUBJECTS?.REQUIRED
												}
												limitDegreesByAlreadySelectedLevels
											/>
										</>
									)}
								</>

								{renderFieldVisibleOrRequired(
									'EDUCATIONAL_ORGANISATION',
									renderEducationOrganisationsField
								)}
								{renderFieldVisibleOrRequired(
									'ORGANISATION',
									renderOrganisationField
								)}
								<Button
									label={tText('settings/components/profile___opslaan')}
									type="primary"
									disabled={isSaving}
									onClick={saveProfileChanges}
								/>
							</Form>
						</Column>
						<Column size="3-5">
							{!isPupil && (
								<>
									<Spacer margin={['top', 'bottom']}>
										<Box>
											<p>
												{tHtml(
													'settings/components/profile___profiel-sidebar-intro-tekst'
												)}
											</p>
										</Box>
									</Spacer>
								</>
							)}
						</Column>
						{uiPermissions?.ORGANISATION?.VIEW_USERS_IN_SAME_COMPANY && (
							<Column size="3-12">
								<Spacer margin="top-extra-large">
									<BlockHeading type="h2">
										{tText(
											'settings/components/profile___gebruikers-in-je-organisatie'
										)}
									</BlockHeading>
									<Spacer margin="top">
										<Table
											data={usersInSameCompany}
											columns={USERS_IN_SAME_COMPANY_COLUMNS()}
											emptyStateMessage={tText(
												'settings/components/profile___er-zitten-geen-andere-gebruikers-uit-je-organisatie-op-het-archief-voor-onderwijs'
											)}
											rowKey="id"
											renderCell={renderUsersInSameCompanyTableCell as any}
											variant="bordered"
										/>
									</Spacer>
								</Spacer>
							</Column>
						)}
					</Grid>
				</Spacer>
			</Container>
		);
	};

	return isSaving ? (
		<Spacer margin="top-extra-large">
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		</Spacer>
	) : (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('settings/components/profile___profiel-instellingen-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'settings/components/profile___profiel-instellingen-pagina-beschrijving'
					)}
				/>
			</Helmet>
			{renderProfilePage()}
		</>
	);
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: (forceRefetch: boolean) => {
			return dispatch(getLoginStateAction(forceRefetch) as any);
		},
	};
};

export default withUser(connect(null, mapDispatchToProps)(Profile)) as FC<any>;
