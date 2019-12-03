import { get, pullAllBy, remove, uniq, without } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';

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
	Spinner,
	TagInfo,
	TagList,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

import { dataService } from '../../shared/services/data-service';
import {
	ClientEducationOrganization,
	fetchCities,
	fetchEducationOrganizations,
} from '../../shared/services/education-organizations-service';
import toastService from '../../shared/services/toast-service';
import { GET_EDUCATION_LEVELS } from '../profile.gql';

export interface ProfileProps {}

const Profile: FunctionComponent<ProfileProps> = () => {
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
	const [educationLevels, setEducationLevels] = useState<string[]>([]);
	const [selectedEducationLevels, setSelectedEducationLevels] = useState<TagInfo[]>([]);

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
		dataService
			.query({
				query: GET_EDUCATION_LEVELS,
			})
			.then(response => {
				setEducationLevels(
					get(response, 'data.lookup_enum_lom_context', []).map(
						(item: { description: string }) => item.description
					)
				);
			})
			.catch(err => {
				console.error('Failed to get cities', err);
				toastService.danger('Het ophalen van de opleidingniveaus is mislukt');
			});
	}, []);

	useEffect(() => {
		updateOrganizations();
	}, [selectedOrganizations, selectedCity]);

	const updateProfileProp = (value: string, prop: string) => {
		setProfile({ ...profile, [prop]: value });
	};

	const saveProfileChanges = () => {};

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
				{ label: 'Er zijn geen organisaties gekend in deze gemeente', value: '', disabled: true },
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

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<Form type="standard">
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
									<FormGroup label="Onderwijsniveau" labelFor="educationLevel">
										<TagsInput
											options={[
												{ label: 'Selecteer een opleidingsniveau', value: '' },
												...educationLevels.map(edLevel => ({ label: edLevel, value: edLevel })),
											]}
											value={selectedEducationLevels}
											onChange={setSelectedEducationLevels}
										/>
									</FormGroup>

									<FormGroup label="School/organisatie" labelFor="organization">
										<TagList
											closable
											swatches={false}
											tags={selectedOrganizations.map(org => ({ label: org.label, id: org.label }))}
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
										label="Instellingen opslaan"
										type="primary"
										onClick={saveProfileChanges}
									/>
								</Form>
							</Column>
							<Column size="3-5">
								<Box>
									<Heading type="h4">Volledigheid profiel</Heading>
									{/* TODO replace with components from component repo */}
									<div className="c-progress-bar" />
								</Box>
								<Spacer margin={['top', 'bottom']}>
									<Box>
										<p>
											Vul hier wat info over jezelf in! Deze informatie wordt getoond op jouw
											persoonlijk profiel. Je kan voor elk veld aanduiden of je deze informatie wil
											delen of niet.
										</p>
									</Box>
								</Spacer>
							</Column>
						</Grid>
					</Spacer>
				</Container>
			</Container>
		</>
	);
};

export default Profile;
