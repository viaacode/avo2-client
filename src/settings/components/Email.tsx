import { keys } from 'lodash-es';
import React, {
	FunctionComponent,
	Reducer,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
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
	Spinner,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { convertToNewsletterPreferenceUpdate, CustomError } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { NewsletterList, NewsletterPreferences, ReactAction } from '../../shared/types';
import { GET_NEWSLETTER_LABELS } from '../settings.const';
import { fetchNewsletterPreferences, updateNewsletterPreferences } from '../settings.service';

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
	const [t] = useTranslation();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [initialNewsletterPreferences, setInitialNewsletterPreferences] = useState<
		NewsletterPreferences
	>(INITIAL_NEWSLETTER_PREFERENCES_STATE());
	const [newsletterPreferences, changeNewsletterPreferences] = useReducer<
		Reducer<NewsletterPreferences, NewsletterPreferencesAction>
	>(newsletterPreferencesReducer, INITIAL_NEWSLETTER_PREFERENCES_STATE());

	const newsletterLabels = GET_NEWSLETTER_LABELS();

	const fetchEmailPreferences = useCallback(async () => {
		try {
			const preferences: NewsletterPreferences = await fetchNewsletterPreferences(user.mail);
			setInitialNewsletterPreferences(preferences);
			changeNewsletterPreferences({
				type: NewsletterPreferencesActionType.SET_NEWSLETTER_PREFERENCES,
				payload: preferences,
			});
		} catch (err) {
			console.error(new CustomError('Failed to retrieve newsletter preferences', err));
			ToastService.danger(t('De nieuwsbriefvoorkeuren konden niet worden opgevraagd.'));
		}
		setIsLoading(false);
	}, [user.mail, t]);

	useEffect(() => {
		fetchEmailPreferences();
	}, [fetchEmailPreferences]);

	const onChangePreference = (preference: Partial<NewsletterPreferences>) => {
		changeNewsletterPreferences({
			type: NewsletterPreferencesActionType.UPDATE_NEWSLETTER_PREFERENCES,
			payload: preference,
		});
	};

	const onSavePreferences = async () => {
		const convertedNewsletterPreferenceUpdate = convertToNewsletterPreferenceUpdate(
			initialNewsletterPreferences,
			newsletterPreferences
		);

		// Only perform update request if there are changes
		if (convertedNewsletterPreferenceUpdate) {
			try {
				setIsLoading(true);

				await updateNewsletterPreferences(
					`${user.first_name} ${user.last_name}`,
					user.mail,
					convertedNewsletterPreferenceUpdate
				);

				setInitialNewsletterPreferences({
					...initialNewsletterPreferences,
					...newsletterPreferences,
				});
			} catch (err) {
				console.error(new CustomError('Failed to update newsletter preferences', err));
				ToastService.danger(t('De nieuwsbriefvoorkeuren konden niet worden geüpdatet.'));
			}

			setIsLoading(false);
		}
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
								{(keys(newsletterLabels) as any).map(
									(newsletterKey: NewsletterList) => (
										<Checkbox
											key={`newsletter_${newsletterKey}`}
											label={newsletterLabels[newsletterKey]}
											checked={newsletterPreferences[newsletterKey]}
											onChange={() => {
												onChangePreference({
													[newsletterKey]: !newsletterPreferences[
														newsletterKey
													],
												});
											}}
										/>
									)
								)}
							</CheckboxGroup>
						</FormGroup>
					</Form>
				</Spacer>
				<Spacer margin="top">
					{isLoading ? (
						<Spinner />
					) : (
						<Button label="Opslaan" type="primary" onClick={onSavePreferences} />
					)}
				</Spacer>
			</Container>
		</Container>
	);
};

export default Email;
