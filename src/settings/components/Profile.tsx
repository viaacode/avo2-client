import { get, pullAllBy, remove, uniq } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Alert,
	Avatar,
	Box,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Heading,
	Icon,
	Select,
	Spacer,
	TagInfo,
	TagList,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import { SEARCH_PATH } from '../../search/search.const';
import { DataQueryComponent } from '../../shared/components';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../../shared/queries/lookup.gql';
import {
	ClientEducationOrganization,
	fetchCities,
	fetchEducationOrganizations,
} from '../../shared/services/education-organizations-service';
import toastService from '../../shared/services/toast-service';
import { ContextAndClassificationData } from '../../shared/types/lookup';

export interface ProfileProps extends RouteComponentProps {}

const Profile: FunctionComponent<ProfileProps> = ({ location, history }) => {
	const [profile, setProfile] = useState<any>({});
	const [cities, setCities] = useState<string[]>([]);
	const [selectedCity, setSelectedCity] = useState<string>('');
	const [organizations, setOrganizations] = useState<ClientEducationOrganization[]>([]);
	const [organizationsLoadingState, setOrganizationsLoadingState] = useState<
		'loading' | 'loaded' | 'error'
	>('loaded');
	const [selectedOrganizations, setSelectedOrganizations] = useState<ClientEducationOrganization[]>(
		[]
	);

	// Cache organizations since the user will probably select multiple schools in the same city
	const [organizationsCache, setOrganizationsCache] = useState<{
		[cityAndZipCode: string]: ClientEducationOrganization[];
	}>({});
	const [selectedEducationLevels, setSelectedEducationLevels] = useState<TagInfo[]>([]);
	const [selectedSubjects, setSelectedSubjects] = useState<TagInfo[]>([]);

	const updateOrganizations = async () => {
		try {
			if (!selectedCity) {
				setOrganizations([]);
				return;
			}
			setOrganizationsLoadingState('loading');
			const [city, zipCode] = selectedCity.split(/[()]/g).map(s => s.trim());
			let orgs: ClientEducationOrganization[] = [];
			if (organizationsCache[selectedCity]) {
				// get from cache
				orgs = [...organizationsCache[selectedCity]];
			} else {
				// fetch from server
				orgs = await fetchEducationOrganizations(city, zipCode);
				setOrganizationsCache({ ...organizationsCache, ...{ [selectedCity]: orgs } });
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
	};

	useEffect(() => {
		fetchCities()
			.then(setCities)
			.catch(err => {
				console.error('Failed to get cities', err);
				toastService.danger('Het ophalen van de steden is mislukt');
			});
	}, []);

	useEffect(() => {
		updateOrganizations();
	}, [selectedOrganizations, selectedCity]);

	const updateProfileProp = (value: string, prop: string) => {
		setProfile({ ...profile, [prop]: value });
	};

	const saveProfileChanges = () => {
		toastService.info('Nog niet geimplementeerd');

		if (isCompleteProfileStep()) {
			redirectToClientPage(get(location, 'state.from.pathname', SEARCH_PATH.SEARCH), history);
		}
	};

	const onSelectedCityChanged = async (cityAndZipCode: string) => {
		setSelectedCity(cityAndZipCode);
	};

	const onSelectedOrganizationChanged = (orgLabel: string) => {
		const selectedOrg = organizations.find(org => org.label === orgLabel);
		if (!selectedOrg) {
			toastService.danger('De geselecteerde instelling kon niet worden gevonden');
			return;
		}
		setSelectedOrganizations(uniq([...selectedOrganizations, selectedOrg]));
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
					label: 'Er zijn geen (andere) organisaties gekend in deze gemeente',
					value: '',
					disabled: true,
				},
			];
		}
		return [
			{ label: 'selecteer een instelling', value: '', disabled: true },
			...organizations.map((org: ClientEducationOrganization) => ({
				label: org.label,
				value: org.label,
			})),
		];
	};

	/**
	 * Returns boolean to show if profile component was loaded to complete the required profile info,
	 * or if it was loaded in the avo settings screen of a user that is already fully logged in
	 */
	const isCompleteProfileStep = (): boolean => {
		return location.pathname === APP_PATH.COMPLETE_PROFILE;
	};

	const areAllRequiredFieldFilledIn = (): boolean => {
		return true; // TODO switch this once we can save profile info
		// return (
		// 	selectedSubjects.length > 0 &&
		// 	selectedEducationLevels.length > 0 &&
		// 	selectedOrganizations.length > 0
		// );
	};

	const renderProfile = (data: ContextAndClassificationData) => {
		const educationLevels: string[] = (get(data, 'lookup_enum_lom_context', []) as {
			description: string;
		}[]).map((item: { description: string }) => item.description);
		const subjects: string[] = (get(data, 'lookup_enum_lom_classification', []) as {
			description: string;
		}[]).map((item: { description: string }) => item.description);

		return (
			<>
				<Container mode="vertical">
					<Container mode="horizontal">
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<Form type="standard">
										{!isCompleteProfileStep() && (
											<>
												<FormGroup label="Functie" labelFor="function">
													<TextInput id="functie" placeholder="bv: Leerkracht basis onderwijs" />
												</FormGroup>
												<FormGroup label="Profielfoto" labelFor="profilePicture">
													<Box>
														{/* TODO replace with components from component repo */}
														<Avatar initials="XX" />
														<Icon name="user" size="large" />
														<input type="file" placeholder="Profielfoto uploaden" />
													</Box>
												</FormGroup>
												<FormGroup label="Bio" labelFor="bio">
													<TextArea
														name="bio"
														value={profile.bio}
														id="bio"
														height="medium"
														placeholder="Een korte beschrijving van jezelf..."
														onChange={(value: string) => updateProfileProp(value, 'bio')}
													/>
												</FormGroup>
											</>
										)}
										<FormGroup label="Vakken" labelFor="subjects">
											<TagsInput
												id="subjects"
												placeholder="Selecteer de vakken die u geeft"
												options={subjects.map(subject => ({
													label: subject,
													value: subject,
												}))}
												value={selectedSubjects}
												onChange={setSelectedSubjects}
											/>
										</FormGroup>
										<FormGroup label="Onderwijsniveau" labelFor="educationLevel">
											<TagsInput
												id="educationLevel"
												placeholder="Selecteer een opleidingsniveau"
												options={educationLevels.map(edLevel => ({
													label: edLevel,
													value: edLevel,
												}))}
												value={selectedEducationLevels}
												onChange={setSelectedEducationLevels}
											/>
										</FormGroup>

										<FormGroup label="School/organisatie" labelFor="organization">
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
														{ label: 'Voeg een organisatie toe', value: '' },
														...cities.map(c => ({ label: c, value: c })),
													]}
													value={selectedCity || ''}
													onChange={onSelectedCityChanged}
												/>
											</Spacer>
											<Spacer margin="top-small">
												{organizationsLoadingState === 'loading' && (
													<Alert type="spinner" message="Bezig met ophalen van organisaties..." />
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
										{/*<FormGroup label="Vakken" labelFor="subjectsId">*/}
										{/*	<TagsInput*/}
										{/*		options={[*/}
										{/*			{*/}
										{/*				label: 'Aardrijkskunde',*/}
										{/*				value: 'aardrijkskunde',*/}
										{/*			},*/}
										{/*			{*/}
										{/*				label: 'Wiskunde',*/}
										{/*				value: 'wiskunde',*/}
										{/*			},*/}
										{/*		]}*/}
										{/*		onChange={(values: TagInfo[]) => {}}*/}
										{/*	/>*/}
										{/*</FormGroup>*/}
										<Button
											label={isCompleteProfileStep() ? 'Inloggen' : 'Opslaan'}
											type="primary"
											disabled={!areAllRequiredFieldFilledIn()}
											onClick={saveProfileChanges}
										/>
									</Form>
								</Column>
								<Column size="3-5">
									{isCompleteProfileStep() ? (
										<Box>
											<p>
												Vervolledig wat informatie over jezelf. We gebruiken deze informatie om je
												gepersonaliseerde content te laten zien.
											</p>
										</Box>
									) : (
										<>
											<Box>
												<Heading type="h4">Volledigheid profiel</Heading>
												{/* TODO replace with components from component repo */}
												<div className="c-progress-bar" />
											</Box>
											<Spacer margin={['top', 'bottom']}>
												<Box>
													<p>
														Vul hier wat info over jezelf in! Deze informatie wordt getoond op jouw
														persoonlijk profiel. Je kan voor elk veld aanduiden of je deze
														informatie wil delen of niet.
													</p>
												</Box>
											</Spacer>
										</>
									)}
								</Column>
							</Grid>
						</Spacer>
					</Container>
				</Container>
			</>
		);
	};

	return <DataQueryComponent query={GET_CLASSIFICATIONS_AND_SUBJECTS} renderData={renderProfile} />;
};

export default withRouter(Profile);
