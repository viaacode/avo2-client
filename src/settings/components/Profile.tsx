import { get, pullAllBy, remove, uniq } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Alert,
	Avatar,
	BlockHeading,
	Box,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Icon,
	Select,
	Spacer,
	TagInfo,
	TagList,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import {
	getProfile,
	getProfileAlias,
	getProfileId,
} from '../../authentication/helpers/get-profile-info';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { getLoginResponse, setLoginSuccess } from '../../authentication/store/actions';
import { APP_PATH } from '../../constants';
import { DataQueryComponent } from '../../shared/components';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../../shared/queries/lookup.gql';
import { ToastService } from '../../shared/services';
import {
	fetchCities,
	fetchEducationOrganizations,
} from '../../shared/services/education-organizations-service';
import { ContextAndClassificationData } from '../../shared/types/lookup';
import store from '../../store';
import { updateProfileInfo } from '../settings.service';

export interface ProfileProps extends DefaultSecureRouteProps {
	isCompleteProfileStep?: boolean;
	redirectTo?: string;
}

const Profile: FunctionComponent<ProfileProps> = ({
	isCompleteProfileStep = false,
	redirectTo = APP_PATH.LOGGED_IN_HOME.route,
	history,
	user,
}) => {
	const [t] = useTranslation();

	const gqlEnumToSelectOption = (enumLabel: string): TagInfo => ({
		label: enumLabel,
		value: enumLabel,
	});
	const gqlOrganizationToSelectOption = (
		org: Avo.EducationOrganization.Organization
	): TagInfo => ({
		label: `${org.label}`,
		value: `${org.organizationId}:${org.unitId || ''}`,
	});
	const [cities, setCities] = useState<string[]>([]);
	const [selectedCity, setSelectedCity] = useState<string>('');
	const [organizations, setOrganizations] = useState<Avo.EducationOrganization.Organization[]>(
		[]
	);
	const [organizationsLoadingState, setOrganizationsLoadingState] = useState<
		'loading' | 'loaded' | 'error'
	>('loaded');
	// Cache organizations since the user will probably select multiple schools in the same city
	const [organizationsCache, setOrganizationsCache] = useState<{
		[cityAndZipCode: string]: Avo.EducationOrganization.Organization[];
	}>({});
	const [selectedEducationLevels, setSelectedEducationLevels] = useState<TagInfo[]>(
		get(user, 'profile.educationLevels', []).map(gqlEnumToSelectOption)
	);
	const [selectedSubjects, setSelectedSubjects] = useState<TagInfo[]>(
		get(user, 'profile.subjects', []).map(gqlEnumToSelectOption)
	);
	const [selectedOrganizations, setSelectedOrganizations] = useState<TagInfo[]>(
		get(user, 'profile.organizations', []).map(gqlOrganizationToSelectOption)
	);
	const [alias, setAlias] = useState<string>(getProfileAlias(user));
	const [avatar, setAvatar] = useState<string | null>(getProfile(user).avatar);
	const [bio, setBio] = useState<string | null>((getProfile(user) as any).bio);
	const [func, setFunc] = useState<string | null>((getProfile(user) as any).function);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	useEffect(() => {
		fetchCities()
			.then(setCities)
			.catch(err => {
				console.error('Failed to get cities', err);
				ToastService.danger(
					t('settings/components/profile___het-ophalen-van-de-steden-is-mislukt')
				);
			});
	}, [t]);

	useEffect(() => {
		(async () => {
			try {
				if (!selectedCity) {
					setOrganizations([]);
					return;
				}
				setOrganizationsLoadingState('loading');
				const [city, zipCode] = selectedCity.split(/[()]/g).map(s => s.trim());
				let orgs: Avo.EducationOrganization.Organization[] = [];
				if (organizationsCache[selectedCity]) {
					// get from cache
					orgs = [...organizationsCache[selectedCity]];
				} else {
					// fetch from server
					orgs = await fetchEducationOrganizations(city, zipCode);
					setOrganizationsCache({
						...organizationsCache,
						...{ [selectedCity]: orgs },
					});
				}
				pullAllBy(orgs, selectedOrganizations, 'label');
				setOrganizations(orgs);
				setOrganizationsLoadingState('loaded');
			} catch (err) {
				setOrganizations([]);
				setOrganizationsLoadingState('loaded');
				console.error('Failed to get educational organizations', err, {
					selectedCity,
				});
			}
		})();
	}, [organizationsCache, selectedOrganizations, selectedCity]);

	const saveProfileChanges = async () => {
		try {
			setIsSaving(true);
			const profileId: string = getProfileId(user);
			await updateProfileInfo(getProfile(user), {
				alias,
				avatar,
				bio,
				educationLevels: (selectedEducationLevels || []).map(option => ({
					profile_id: profileId,
					key: option.value.toString(),
				})),
				subjects: (selectedSubjects || []).map(option => ({
					profile_id: profileId,
					key: option.value.toString(),
				})),
				organizations: (selectedOrganizations || []).map(option => ({
					profile_id: profileId,
					organization_id: option.value.toString().split(':')[0],
					unit_id: option.value.toString().split(':')[1] || null,
				})),
				function: func, // This database field naming isn't ideal
			});

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
				ToastService.success(t('settings/components/profile___opgeslagen'));
				setIsSaving(false);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t('settings/components/profile___het-opslaan-van-de-profiel-information-is-mislukt')
			);
			setIsSaving(false);
		}
	};

	const onSelectedCityChanged = async (cityAndZipCode: string) => {
		setSelectedCity(cityAndZipCode);
	};

	const onSelectedOrganizationChanged = (orgLabel: string) => {
		const selectedOrg = organizations.find(org => org.label === orgLabel);
		if (!selectedOrg) {
			ToastService.danger(
				t(
					'settings/components/profile___de-geselecteerde-instelling-kon-niet-worden-gevonden'
				)
			);
			return;
		}
		setSelectedOrganizations(
			uniq([...selectedOrganizations, ...[selectedOrg].map(gqlOrganizationToSelectOption)])
		);
	};

	const removeOrganization = async (orgLabel: ReactText) => {
		const newOrganizations = [...selectedOrganizations];
		remove(newOrganizations, org => org.label === orgLabel);
		setSelectedOrganizations(newOrganizations);
	};

	const getOrganizationOptions = () => {
		if (organizations.length === 0 && organizationsLoadingState === 'loaded') {
			return [
				{
					label: t(
						'settings/components/profile___er-zijn-geen-andere-organisaties-gekend-in-deze-gemeente'
					),
					value: '',
					disabled: true,
				},
			];
		}
		return [
			{
				label: t('settings/components/profile___selecteer-een-instelling'),
				value: '',
				disabled: true,
			},
			...organizations.map((org: Avo.EducationOrganization.Organization) => ({
				label: org.label,
				value: org.label,
			})),
		];
	};

	const areAllRequiredFieldFilledIn = (): boolean =>
		selectedSubjects &&
		selectedSubjects.length > 0 &&
		selectedEducationLevels &&
		selectedEducationLevels.length > 0 &&
		selectedOrganizations &&
		selectedOrganizations.length > 0;

	const handleAvatarOnChange = () => {
		setAvatar('');
		ToastService.info(t('settings/components/profile___nog-niet-geimplementeerd'));
	};

	const renderRequiredFields = (subjects: string[], educationLevels: string[]) => (
		<>
			<FormGroup
				label={t('settings/components/profile___vakken')}
				labelFor="subjects"
				required
			>
				<TagsInput
					id="subjects"
					placeholder={t('settings/components/profile___selecteer-de-vakken-die-u-geeft')}
					options={subjects.map(subject => ({
						label: subject,
						value: subject,
					}))}
					value={selectedSubjects}
					onChange={selectedValues => setSelectedSubjects(selectedValues || [])}
				/>
			</FormGroup>
			<FormGroup
				label={t('settings/components/profile___onderwijsniveau')}
				labelFor="educationLevel"
				required
			>
				<TagsInput
					id="educationLevel"
					placeholder={t('settings/components/profile___selecteer-een-opleidingsniveau')}
					options={educationLevels.map(edLevel => ({
						label: edLevel,
						value: edLevel,
					}))}
					value={selectedEducationLevels}
					onChange={selectedValues => setSelectedEducationLevels(selectedValues || [])}
				/>
			</FormGroup>
			<FormGroup
				label={t('settings/components/profile___school-organisatie')}
				labelFor="organization"
				required
			>
				<TagList
					closable
					swatches={false}
					tags={selectedOrganizations.map(org => ({
						label: org.label,
						id: org.label,
					}))}
					onTagClosed={removeOrganization}
				/>
				<Spacer margin="top-small">
					<Select
						options={[
							{
								label: t('settings/components/profile___voeg-een-organisatie-toe'),
								value: '',
							},
							...cities.map(c => ({ label: c, value: c })),
						]}
						value={selectedCity || ''}
						onChange={onSelectedCityChanged}
					/>
				</Spacer>
				<Spacer margin="top-small">
					{organizationsLoadingState === 'loading' && (
						<Alert
							type="spinner"
							message={t(
								'settings/components/profile___bezig-met-ophalen-van-organisaties'
							)}
						/>
					)}
					{!!selectedCity && organizationsLoadingState === 'loaded' && (
						<Select
							options={getOrganizationOptions()}
							value={''}
							onChange={onSelectedOrganizationChanged}
						/>
					)}
				</Spacer>
			</FormGroup>
		</>
	);

	const renderProfile = (data: ContextAndClassificationData) => {
		const educationLevels: string[] = (get(data, 'lookup_enum_lom_context', []) as {
			description: string;
		}[]).map((item: { description: string }) => item.description);
		const subjects: string[] = (get(data, 'lookup_enum_lom_classification', []) as {
			description: string;
		}[]).map((item: { description: string }) => item.description);

		if (isCompleteProfileStep) {
			// Render profile for the complete profile step of the registration process
			return (
				<Container mode="horizontal" size="medium">
					<Container mode="vertical">
						<BlockHeading type="h1">
							<Trans i18nKey="settings/components/profile___je-bent-er-bijna-vervolledig-nog-je-profiel">
								Je bent er bijna. Vervolledig nog je profiel.
							</Trans>
						</BlockHeading>
						<Spacer margin="top-large">
							<Alert type="info">
								<Trans i18nKey="settings/components/profile___we-gebruiken-deze-info-om-je-gepersonaliseerde-content-te-tonen">
									We gebruiken deze info om je gepersonaliseerde content te tonen.
								</Trans>
							</Alert>
						</Spacer>
						<Form type="standard">
							<Spacer margin={['top-large', 'bottom-large']}>
								{renderRequiredFields(subjects, educationLevels)}
							</Spacer>
						</Form>
						<Button
							label={t('settings/components/profile___inloggen')}
							type="primary"
							disabled={!areAllRequiredFieldFilledIn() || isSaving}
							onClick={saveProfileChanges}
						/>
					</Container>
				</Container>
			);
		}

		// Render profile for the settings page
		return (
			<>
				<Container mode="vertical">
					<Container mode="horizontal">
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<Form type="standard">
										<>
											<FormGroup
												label={t('settings/components/profile___nickname')}
												labelFor="alias"
											>
												<TextInput
													id="alias"
													placeholder={t(
														'settings/components/profile___een-unieke-gebruikersnaam'
													)}
													value={alias || ''}
													onChange={setAlias}
												/>
											</FormGroup>
											<FormGroup
												label={t('settings/components/profile___functie')}
												labelFor="func"
											>
												<TextInput
													id="func"
													placeholder={t(
														'settings/components/profile___bv-leerkracht-basis-onderwijs'
													)}
													value={func || ''}
													onChange={setFunc}
												/>
											</FormGroup>
											<FormGroup
												label={t(
													'settings/components/profile___profielfoto'
												)}
												labelFor="profilePicture"
											>
												<Box>
													{/* TODO replace with components from component repo */}
													<Avatar initials="XX" />
													<Icon name="user" size="large" />
													<input
														type="file"
														placeholder={t(
															'settings/components/profile___profielfoto-uploaden'
														)}
														onChange={handleAvatarOnChange}
													/>
												</Box>
											</FormGroup>
											<FormGroup
												label={t('settings/components/profile___bio')}
												labelFor="bio"
											>
												<TextArea
													name="bio"
													id="bio"
													height="medium"
													placeholder={t(
														'settings/components/profile___een-korte-beschrijving-van-jezelf'
													)}
													value={bio || ''}
													onChange={setBio}
												/>
											</FormGroup>
										</>
										{renderRequiredFields(subjects, educationLevels)}
										<Button
											label={t('settings/components/profile___opslaan')}
											type="primary"
											disabled={!areAllRequiredFieldFilledIn() || isSaving}
											onClick={saveProfileChanges}
										/>
									</Form>
								</Column>
								<Column size="3-5">
									<>
										{/*<Box>*/}
										{/*	<BlockHeading type="h4"><Trans i18nKey="settings/components/profile___volledigheid-profiel">Volledigheid profiel</Trans></BlockHeading>*/}
										{/*	/!* TODO replace with components from component repo *!/*/}
										{/*	<div className="c-progress-bar" />*/}
										{/*</Box>*/}
										<Spacer margin={['top', 'bottom']}>
											<Box>
												<p>
													<Trans i18nKey="settings/components/profile___profiel-sidebar-intro-tekst">
														Vul hier wat info over jezelf in! Deze
														informatie wordt getoond op jouw persoonlijk
														profiel. Je kan voor elk veld aanduiden of
														je deze informatie wil delen of niet.
													</Trans>
												</p>
											</Box>
										</Spacer>
									</>
								</Column>
							</Grid>
						</Spacer>
					</Container>
				</Container>
			</>
		);
	};

	return (
		<DataQueryComponent
			query={GET_CLASSIFICATIONS_AND_SUBJECTS}
			renderData={renderProfile}
			actionButtons={['home']}
		/>
	);
};

export default Profile;
