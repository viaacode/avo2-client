import React, { FunctionComponent, useState } from 'react';

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
	Table,
	TagInfo,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

export interface ProfileProps {}

const Profile: FunctionComponent<ProfileProps> = () => {
	const [profile, setProfile] = useState<any>({});

	const updateProfileProp = (value: string, prop: string) => {
		setProfile({ ...profile, [prop]: value });
	};

	const saveProfileChanges = () => {};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<Form type="standard">
									<FormGroup label="Functie" labelFor="function">
										<Select
											options={[
												{
													label: 'Leerkracht basis onderwijs',
													value: 'leerkracht basis onderwijs',
												},
												{
													label: 'Leerkracht secundair onderwijs',
													value: 'leerkracht secundair onderwijs',
												},
												{
													label: 'Leerkracht hoger onderwijs',
													value: 'leerkracht hoger onderwijs',
												},
												{
													label: 'Medewerker departement onderwijs',
													value: 'medewerker departement onderwijs',
												},
											]}
											id="function"
										/>
									</FormGroup>
									<FormGroup label="School/organisatie" labelFor="organization">
										<TagsInput
											options={[
												{
													label: 'St. Eglisius Borsbeek',
													value: '1345',
												},
												{
													label: 'Sint Vincentiusschool Kachtem',
													value: '568756753',
												},
												{
													label: 'Broederschool Roeselare',
													value: '352668',
												},
											]}
											onChange={(values: TagInfo[]) => {}}
										/>
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
									<FormGroup label="Vakken" labelFor="subjectsId">
										<TagsInput
											options={[
												{
													label: 'Aardrijkskunde',
													value: 'aardrijkskunde',
												},
												{
													label: 'Wiskunde',
													value: 'wiskunde',
												},
											]}
											onChange={(values: TagInfo[]) => {}}
										/>
									</FormGroup>
									<FormGroup label="Vakken" labelFor="subjectsId">
										<TagsInput
											options={[
												{
													label: 'Basisonderwijs',
													value: 'basisonderwijs',
												},
												{
													label: 'Secundair onderwijs',
													value: 'secundair onderwijs',
												},
											]}
											onChange={(values: TagInfo[]) => {}}
										/>
									</FormGroup>
									<FormGroup label="Stamboeknummer / Lerarenkaart nummer" labelFor="stamboekNumber">
										<TextInput placeholder="00000000000-000000" />
									</FormGroup>
									<FormGroup label="KlasCement URL" labelFor="klascementUrl">
										<TextInput icon="klascement" />
									</FormGroup>
									<FormGroup label="Smartschool URL" labelFor="SmartschoolUrl">
										<TextInput icon="smartschool" />
									</FormGroup>
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
						{/* TODO replace with components from component repo */}
						<div className="c-hr" />
						<Form type="standard">
							<Heading type="h3">Account</Heading>
							<FormGroup label="Email">
								<span>test@testers.be</span>
							</FormGroup>
							<FormGroup label="Wachtwoord">
								<span>123456</span>
							</FormGroup>
							<FormGroup label="Geldigheid">
								<span>Jouw account is nog 233 dagen gedlig.</span>
							</FormGroup>
							<Spacer margin="top-large">
								<Alert type="info">
									<span>
										Jouw account wordt beheerd in een centraal systeem, dat je toelaat om op
										meerdere VIAA websites aan te melden. <br />
										Beheer jouw e-mailadres en wachtwoord in het{' '}
										<a href="" target="_blank">
											VIAA identiteitsmanagement systeem.
										</a>
									</span>
								</Alert>
							</Spacer>
						</Form>
					</Spacer>
				</Container>
			</Container>
		</>
	);
};

export default Profile;
