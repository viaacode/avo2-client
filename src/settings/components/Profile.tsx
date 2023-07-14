import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Alert,
	Box,
	Button,
	Checkbox,
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
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import { LomFieldSchema } from '@viaa/avo2-types/types/lom';
import { compact, get, isNil, map } from 'lodash-es';
import { stringifyUrl } from 'query-string';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { getProfileFromUser } from '../../authentication/helpers/get-profile-info';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import {
	getLoginResponse,
	getLoginStateAction,
	setLoginSuccess,
} from '../../authentication/store/actions';
import { selectUser } from '../../authentication/store/selectors';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { FileUpload } from '../../shared/components';
import { EducationalOrganisationsSelect } from '../../shared/components/EducationalOrganisationsSelect/EducationalOrganisationsSelect';
import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { ROUTE_PARTS } from '../../shared/constants';
import { CustomError, formatDate, getEnv } from '../../shared/helpers';
import { groupLoms } from '../../shared/helpers/lom';
import { stringsToTagList } from '../../shared/helpers/strings-to-taglist';
import useTranslation from '../../shared/hooks/useTranslation';
import { CampaignMonitorService } from '../../shared/services/campaign-monitor-service';
import { OrganisationService } from '../../shared/services/organizations-service';
import { ToastService } from '../../shared/services/toast-service';
import store, { AppState } from '../../store';
import { USERS_IN_SAME_COMPANY_COLUMNS } from '../settings.const';
import { SettingsService } from '../settings.service';
import { UsersInSameCompanyColumn } from '../settings.types';

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

export interface ProfileProps extends DefaultSecureRouteProps {
	redirectTo?: string;
}

const Profile: FunctionComponent<
	ProfileProps & {
		getLoginState: () => Dispatch;
	}
> = ({ redirectTo = APP_PATH.LOGGED_IN_HOME.route, history, location, user, getLoginState }) => {
	const { tText, tHtml } = useTranslation();
	const isCompleteProfileStep = location.pathname.includes(ROUTE_PARTS.completeProfile);
	const [selectedOrganisations, setSelectedOrganisations] = useState<
		Avo.EducationOrganization.Organization[]
	>(get(user, 'profile.organizations', []));
	const [selectedLoms, setSelectedLoms] = useState<LomFieldSchema[]>(
		compact(map(user?.profile?.loms, 'lom'))
	);
	const firstName = user?.first_name || '';
	const lastName = user?.last_name || '';
	const email = user?.mail || '';
	const [alias, setAlias] = useState<string>(user?.profile?.alias ?? '');
	const [avatar, setAvatar] = useState<string | null>(
		get(getProfileFromUser(user, true), 'avatar', null)
	);
	const [title, setTitle] = useState<string | null>(
		get(getProfileFromUser(user, true), 'title', null)
	);
	const [bio, setBio] = useState<string | null>(get(getProfileFromUser(user, true), 'bio', null));
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false);
	const [allOrganisations, setAllOrganisations] = useState<
		Partial<Avo.Organization.Organization>[] | null
	>(null);
	const [companyId, setCompanyId] = useState<string | null>(
		get(getProfileFromUser(user, true), 'company_id', null)
	);
	const [permissions, setPermissions] = useState<FieldPermissions | null>(null);
	const [profileErrors, setProfileErrors] = useState<
		Partial<{ [prop in keyof Avo.User.UpdateProfileValues]: string }>
	>({});
	const [usersInSameCompany, setUsersInSameCompany] = useState<Partial<Avo.User.Profile>[]>([]);

	const isExceptionAccount = get(user, 'profile.is_exception', false);

	const isPupil = get(user, 'profile.userGroupIds[0]') === SpecialUserGroup.Pupil;

	useEffect(() => {
		setPermissions({
			THEME: {
				VIEW: PermissionService.hasPerm(user, PermissionName.VIEW_THEME_ON_PROFILE_PAGE),
				EDIT: PermissionService.hasPerm(user, PermissionName.EDIT_THEME_ON_PROFILE_PAGE),
				REQUIRED:
					PermissionService.hasPerm(
						user,
						PermissionName.REQUIRED_THEME_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			SUBJECTS: {
				VIEW: PermissionService.hasPerm(user, PermissionName.VIEW_SUBJECTS_ON_PROFILE_PAGE),
				EDIT: PermissionService.hasPerm(user, PermissionName.EDIT_SUBJECTS_ON_PROFILE_PAGE),
				REQUIRED:
					PermissionService.hasPerm(
						user,
						PermissionName.REQUIRED_SUBJECTS_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			EDUCATION_LEVEL: {
				VIEW: PermissionService.hasPerm(
					user,
					PermissionName.VIEW_EDUCATION_LEVEL_ON_PROFILE_PAGE
				),
				EDIT:
					PermissionService.hasPerm(
						user,
						PermissionName.EDIT_EDUCATION_LEVEL_ON_PROFILE_PAGE
					) && !isExceptionAccount,
				REQUIRED:
					PermissionService.hasPerm(
						user,
						PermissionName.REQUIRED_EDUCATION_LEVEL_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			EDUCATIONAL_ORGANISATION: {
				VIEW: PermissionService.hasPerm(
					user,
					PermissionName.VIEW_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE
				),
				EDIT:
					PermissionService.hasPerm(
						user,
						PermissionName.EDIT_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE
					) && !isExceptionAccount,
				REQUIRED:
					PermissionService.hasPerm(
						user,
						PermissionName.REQUIRED_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE
					) && !isExceptionAccount,
			},
			ORGANISATION: {
				VIEW: PermissionService.hasPerm(
					user,
					PermissionName.VIEW_ORGANISATION_ON_PROFILE_PAGE
				),
				EDIT: PermissionService.hasPerm(
					user,
					PermissionName.EDIT_ORGANISATION_ON_PROFILE_PAGE
				),
				REQUIRED: PermissionService.hasPerm(
					user,
					PermissionName.REQUIRED_ORGANISATION_ON_PROFILE_PAGE
				),
				VIEW_USERS_IN_SAME_COMPANY: PermissionService.hasPerm(
					user,
					PermissionName.VIEW_USERS_IN_SAME_COMPANY
				),
			},
		});
	}, [isExceptionAccount, user]);

	useEffect(() => {
		if (!permissions) {
			return;
		}

		// TODO for view we should use the company name from the profile object instead of the company_id and lookup in the list
		// Waiting for: https://meemoo.atlassian.net/browse/DEV-985
		if (permissions.ORGANISATION.VIEW || permissions.ORGANISATION.EDIT) {
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

		const companyId = get(user, 'profile.company_id');
		if (companyId && permissions.ORGANISATION.VIEW_USERS_IN_SAME_COMPANY) {
			OrganisationService.fetchUsersByCompanyId(companyId)
				.then((usersInSameCompany) => {
					setUsersInSameCompany(
						usersInSameCompany.filter(
							(profile) => profile.id !== get(user, 'profile.id')
						)
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
	}, [permissions, isCompleteProfileStep, tText, user, setAllOrganisations]);

	const areRequiredFieldsFilledIn = (profileInfo: Partial<Avo.User.UpdateProfileValues>) => {
		if (!permissions) {
			return false;
		}
		const errors = [];
		let filledIn = true;
		const groupedLoms = groupLoms(selectedLoms);

		if (
			(permissions.SUBJECTS.REQUIRED || isCompleteProfileStep) &&
			!groupedLoms.subject?.length
		) {
			errors.push(tText('settings/components/profile___vakken-zijn-verplicht'));
			filledIn = false;
		}
		if ((permissions.THEME.REQUIRED || isCompleteProfileStep) && !groupedLoms.theme?.length) {
			errors.push(tText("Thema's zijn verplicht."));
			filledIn = false;
		}
		if (
			(permissions.EDUCATION_LEVEL.REQUIRED || isCompleteProfileStep) &&
			!groupedLoms.educationLevel?.length
		) {
			errors.push(tText('settings/components/profile___opleidingsniveau-is-verplicht'));
			filledIn = false;
		}
		if (
			(permissions.EDUCATIONAL_ORGANISATION.REQUIRED || isCompleteProfileStep) &&
			!profileInfo.organizations?.length
		) {
			errors.push(tText('settings/components/profile___educatieve-organisatie-is-verplicht'));
			filledIn = false;
		}
		if (
			permissions.ORGANISATION.REQUIRED &&
			!profileInfo.company_id &&
			!isCompleteProfileStep
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
			const profileId: string = getProfileId(user);
			const newProfileInfo: Partial<Avo.User.UpdateProfileValues> = {
				firstName,
				lastName,
				alias,
				title,
				bio,
				userId: user.uid,
				avatar: avatar || null,
				loms: (selectedLoms || []).map((lom) => ({
					profile_id: profileId,
					lom_id: lom.id,
				})),
				organizations: (selectedOrganisations || []).map((option) => ({
					profile_id: profileId,
					organization_id: option.organizationId,
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

			if (isCompleteProfileStep) {
				// Refetch user permissions since education level can change user group
				getLoginState();
			}

			const preferences: Partial<Avo.Newsletter.Preferences> = {
				allActiveUsers: true, // Update user info in campaign monitor after changes to profile have been saved
			} as any;
			if (subscribeToNewsletter) {
				// subscribe to newsletter if checked
				preferences.newsletter = true;
			}
			try {
				await CampaignMonitorService.updateNewsletterPreferences(preferences);
			} catch (err) {
				console.error(
					new CustomError('Failed to updateNewsletterPreferences', err, {
						preferences,
						user,
					})
				);
				ToastService.danger(
					tHtml(
						'settings/components/profile___het-updaten-van-de-nieuwsbrief-voorkeuren-is-mislukt'
					)
				);
			}

			// Refresh the login state, so the profile info will be up to date
			const loginResponse: Avo.Auth.LoginResponse = await getLoginResponse();
			store.dispatch(setLoginSuccess(loginResponse));

			if (isCompleteProfileStep) {
				// Wait for login response to be set into the store before redirecting
				setTimeout(() => {
					redirectToClientPage(redirectTo, history);
					setIsSaving(false);
				}, 0);
			} else {
				getLoginState();
				ToastService.success(tHtml('settings/components/profile___opgeslagen'));
				setIsSaving(false);
			}
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
					get(
						(allOrganisations || []).find((org) => org.or_id === companyId),
						'name'
					) || tText('settings/components/profile___onbekende-organisatie')
				)}
			</FormGroup>
		);
	};

	const renderEducationOrganisationsField = (editable: boolean, required: boolean) => {
		if (!editable && !selectedOrganisations.length) {
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
					stringsToTagList(selectedOrganisations.map((org) => org.label))
				)}
			</FormGroup>
		);
	};

	const renderCompleteProfilePage = () => {
		return (
			<Container mode="horizontal" size="medium">
				<Container mode="vertical" className="p-profile-page">
					<BlockHeading type="h1">
						{tHtml(
							'settings/components/profile___je-bent-er-bijna-vervolledig-nog-je-profiel'
						)}
					</BlockHeading>
					<Spacer margin="top-large">
						<Alert type="info">
							{tHtml(
								'settings/components/profile___we-gebruiken-deze-info-om-je-gepersonaliseerde-content-te-tonen'
							)}
						</Alert>
					</Spacer>
					<Form type="standard">
						<Spacer margin={['top-large', 'bottom-large']}>
							<LomFieldsInput
								loms={selectedLoms || []}
								onChange={(newLoms) => setSelectedLoms(newLoms)}
								educationLevelsPlaceholder={tText(
									'Selecteer een of meerdere onderwijsniveaus ...'
								)}
								subjectsPlaceholder={tText('Selecteer de vakken die je geeft ...')}
								themesPlaceholder={tText("Selecteer je thema's...")}
								showThemes
							/>
							{renderEducationOrganisationsField(true, true)}
						</Spacer>
						{get(user, 'role.name') === 'lesgever' && (
							<Spacer margin="bottom">
								<FormGroup>
									<Checkbox
										label={tText(
											'settings/components/profile___ik-ontvang-graag-per-e-mail-tips-en-inspiratie-voor-mijn-lessen-vacatures-gratis-workshops-en-nieuws-van-partners'
										)}
										checked={subscribeToNewsletter}
										onChange={setSubscribeToNewsletter}
									/>
								</FormGroup>
							</Spacer>
						)}
					</Form>
					<Button
						label={tText('settings/components/profile___inloggen')}
						type="primary"
						disabled={isSaving}
						onClick={saveProfileChanges}
					/>
				</Container>
			</Container>
		);
	};

	const renderFieldVisibleOrRequired = (
		permissionName: FieldPermissionKey,
		renderFunc: (editable: boolean, required: boolean) => ReactNode
	) => {
		if (!permissions) {
			return null;
		}
		if (permissions[permissionName].VIEW) {
			return renderFunc(
				permissions[permissionName].EDIT,
				permissions[permissionName].REQUIRED
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
				return get(profile, 'user.full_name') || '-';

			case 'mail':
				return get(profile, 'user.mail') || '-';

			case 'user_group':
				return get(profile, 'profile_user_group.group.label') || '-';

			case 'is_blocked':
				return get(profile, 'user.is_blocked')
					? tText('settings/components/profile___ja')
					: tText('settings/components/profile___nee');

			case 'last_access_at': {
				const lastAccessDate = get(profile, 'user.last_access_at');
				return !isNil(lastAccessDate) ? formatDate(lastAccessDate) : '-';
			}

			case 'temp_access': {
				const tempAccess = profile?.user?.temp_access;

				return tempAccess?.current?.status === 1
					? `${tText('settings/components/profile___van')} ${formatDate(
							get(tempAccess, 'from')
					  )} ${tText('settings/components/profile___tot')} ${formatDate(
							get(tempAccess, 'until')
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
					url: getEnv('PROXY_URL') + '/auth/global-logout',
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
												error={get(profileErrors, 'alias')}
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
											{!get(user, 'profile.organisation') && user.profile && (
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
														ownerId={user.profile.id}
														onChange={(urls) => setAvatar(urls[0])}
													/>
												</FormGroup>
											)}
											{!!get(user, 'profile.organisation.logo_url') && (
												<div
													className="c-logo-preview"
													style={{
														backgroundImage: `url(${get(
															user,
															'profile.organisation.logo_url'
														)})`,
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

											<LomFieldsInput
												loms={selectedLoms || []}
												onChange={(newLoms) => setSelectedLoms(newLoms)}
												educationLevelsPlaceholder={tText(
													'Selecteer een of meerdere onderwijsniveaus ...'
												)}
												subjectsPlaceholder={tText(
													'Selecteer de vakken die je geeft ...'
												)}
												themesPlaceholder={tText("Selecteer je thema's...")}
												showThemes
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
						{get(permissions, 'ORGANISATION.VIEW_USERS_IN_SAME_COMPANY') && (
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

	const renderPage = () => {
		if (isCompleteProfileStep) {
			// Render profile for the complete profile step of the registration process
			return renderCompleteProfilePage();
		}

		// Render profile for the settings page
		return renderProfilePage();
	};

	return isSaving ? (
		<Spacer margin="top-extra-large">
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		</Spacer>
	) : (
		<>
			<MetaTags>
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
			</MetaTags>
			{renderPage()}
		</>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
