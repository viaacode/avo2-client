import React, { FunctionComponent, useEffect, useState, useReducer, Reducer } from 'react';
import { RouteComponentProps } from 'react-router';

import {
	BlockHeading,
	Button,
	Checkbox,
	CheckboxGroup,
	Container,
	Form,
	FormGroup,
	Spacer,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { convertToNewsletterPreferenceUpdate } from '../../shared/helpers';
import { NewsletterPreferences, ReactAction } from '../../shared/types';
import { fetchMailPreferences } from '../settings.service';

export interface EmailProps {}

export interface EmailProps extends RouteComponentProps {
	user: Avo.User.User;
}

enum NewsletterPreferencesActionType {
	SET_NEWSLETTER_PREFERENCES = '@@newsletter-preferences/SET_NEWSLETTER_PREFERENCES',
	UPDATE_NEWSLETTER_PREFERENCES = '@@newsletter-preferences/UPDATE_NEWSLETTER_PREFERENCES',
}

type NewsletterPreferencesAction = ReactAction<NewsletterPreferencesActionType>;

const INITIAL_NEWSLETTER_PREFERENCES_STATE = () => ({
	newsletter: false,
	workshop: false,
	ambassador: false,
});

const newsletterPreferencesReducer = (
	state: NewsletterPreferences,
	action: NewsletterPreferencesAction
) => {
	switch (action.type) {
		case NewsletterPreferencesActionType.SET_NEWSLETTER_PREFERENCES:
			return action.payload;
		case NewsletterPreferencesActionType.UPDATE_NEWSLETTER_PREFERENCES:
			return {
				...state,
				...action.payload,
			};
		default:
			return state;
	}
};

const Email: FunctionComponent<EmailProps> = ({ user }) => {
	const [initialNewsletterPreferences, setInitialNewsletterPreferences] = useState<
		NewsletterPreferences
	>(INITIAL_NEWSLETTER_PREFERENCES_STATE());
	const [newsletterPreferences, changeNewsletterPreferences] = useReducer<
		Reducer<NewsletterPreferences, NewsletterPreferencesAction>
	>(newsletterPreferencesReducer, INITIAL_NEWSLETTER_PREFERENCES_STATE());

	useEffect(() => {
		fetchMailPreferences(user.mail).then((preferences: NewsletterPreferences) => {
			setInitialNewsletterPreferences(preferences);
			changeNewsletterPreferences({
				type: NewsletterPreferencesActionType.SET_NEWSLETTER_PREFERENCES,
				payload: preferences,
			});
		});
	}, [user.mail]);

	const onChangePreference = (preference: Partial<NewsletterPreferences>) => {
		changeNewsletterPreferences({
			type: NewsletterPreferencesActionType.UPDATE_NEWSLETTER_PREFERENCES,
			payload: preference,
		});
	};

	const onSavePreferences = () => {
		// TODO: Save preferences
		console.log(
			convertToNewsletterPreferenceUpdate(initialNewsletterPreferences, newsletterPreferences)
		);
	};

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<BlockHeading type="h3">E-mail nieuwsbrief voorkeuren</BlockHeading>
				<p>
					Tips en inspiratie voor je lessen, uitnodigingen voor workshops, vacatures,
					nieuws van de partners waarmee we werken aan beeld en geluid op maat van jouw
					klas, en dit recht in je mailbox: klinkt goed? Schrijf je hieronder in voor onze
					nieuwsbrief en andere communicatie. Je kan je voorkeuren altijd aanpassen.
				</p>
				<Spacer margin="top">
					<Form>
						<FormGroup labelFor="newsletter" required>
							<CheckboxGroup>
								<Checkbox
									label="Ik ontvang graag tips en inspiratie voor mijn lessen en nieuws van partners."
									checked={newsletterPreferences.newsletter}
									onChange={() =>
										onChangePreference({
											newsletter: !newsletterPreferences.newsletter,
										})
									}
								/>
								<Checkbox
									label="Ik wil berichten over workshops en events ontvangen."
									checked={newsletterPreferences.workshop}
									onChange={() => {
										onChangePreference({
											workshop: !newsletterPreferences.workshop,
										});
									}}
								/>
								<Checkbox
									label="Ik krijg graag berichten om actief mee te werken aan Het Archief voor Onderwijs."
									checked={newsletterPreferences.ambassador}
									onChange={() => {
										onChangePreference({
											ambassador: !newsletterPreferences.ambassador,
										});
									}}
								/>
							</CheckboxGroup>
						</FormGroup>
					</Form>
				</Spacer>
				<Spacer margin="top">
					<Button label="Opslaan" type="primary" onClick={onSavePreferences} />
				</Spacer>
			</Container>
		</Container>
	);
};

export default Email;
