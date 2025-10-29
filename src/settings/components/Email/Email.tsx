import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
	Button,
	Checkbox,
	CheckboxGroup,
	Container,
	Form,
	FormGroup,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { keys } from 'lodash-es';
import React, { type FC, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { StringParam, useQueryParams } from 'use-query-params';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { CustomError } from '../../../shared/helpers/custom-error';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import {
	CampaignMonitorService,
	type NewsletterPreferences,
} from '../../../shared/services/campaign-monitor-service';
import { ToastService } from '../../../shared/services/toast-service';
import { type NewsletterList } from '../../../shared/types';
import { GET_NEWSLETTER_LABELS } from '../../settings.const';

import { useGetEmailPreferences } from './hooks/getEmailPreferences';

const INITIAL_NEWSLETTER_PREFERENCES_STATE = (): NewsletterPreferences => ({
	newsletter: false,
	workshop: false,
	ambassador: false,
});

const Email: FC<UserProps> = ({ commonUser }) => {
	const { tText, tHtml } = useTranslation();

	const [{ preferenceCenterKey }] = useQueryParams({
		preferenceCenterKey: StringParam,
	});

	const {
		data: fetchedNewsletterPreferences,
		isLoading: isLoadingGetPreferences,
		isError: getPreferencesIsError,
	} = useGetEmailPreferences(preferenceCenterKey as string, {
		enabled: !!preferenceCenterKey || !!commonUser?.profileId,
	});

	const [isLoadingUpdatePreferences, setIsLoadingUpdatePreferences] = useState<boolean>(false);

	const [initialNewsletterPreferences, setInitialNewsletterPreferences] =
		useState<NewsletterPreferences>(INITIAL_NEWSLETTER_PREFERENCES_STATE());
	const [currentNewsletterPreferences, setCurrentNewsletterPreferences] =
		useState<NewsletterPreferences>(INITIAL_NEWSLETTER_PREFERENCES_STATE());

	const newsletterLabels = GET_NEWSLETTER_LABELS();

	useEffect(() => {
		if (fetchedNewsletterPreferences) {
			setInitialNewsletterPreferences(fetchedNewsletterPreferences);
			setCurrentNewsletterPreferences(fetchedNewsletterPreferences);
		}
	}, [fetchedNewsletterPreferences]);

	const onChangePreference = (preference: Partial<NewsletterPreferences>) => {
		setCurrentNewsletterPreferences((currentPreferences) => {
			return {
				...currentPreferences,
				...preference,
			};
		});
	};

	const onSavePreferences = async () => {
		try {
			setIsLoadingUpdatePreferences(true);

			await CampaignMonitorService.updateNewsletterPreferences(
				currentNewsletterPreferences,
				preferenceCenterKey as string | undefined
			);

			// No await for logging events
			CampaignMonitorService.triggerEventsForNewsletterPreferences(
				initialNewsletterPreferences,
				currentNewsletterPreferences,
				commonUser,
				preferenceCenterKey
			);

			setInitialNewsletterPreferences({
				...initialNewsletterPreferences,
				...currentNewsletterPreferences,
			});

			ToastService.success(
				tHtml('settings/components/email___je-voorkeuren-zijn-opgeslagen')
			);
		} catch (err) {
			console.error(new CustomError('Failed to update newsletter preferences', err));

			setCurrentNewsletterPreferences({
				...initialNewsletterPreferences,
			});

			ToastService.danger(
				tHtml(
					'settings/components/email___de-nieuwsbriefvoorkeuren-konden-niet-worden-geupdatet'
				)
			);
		}

		setIsLoadingUpdatePreferences(false);
	};

	const renderFetchPreferencesError = () => {
		return (
			<ErrorView
				message={tHtml(
					'settings/components/email___het-ophalen-van-je-email-voorkeuren-is-mislukt'
				)}
			>
				<p>
					{commonUser
						? tHtml(
								'settings/components/email___probeer-uit-te-loggen-en-opnieuw-in-te-loggen-als-het-probleem-zich-blijft-voordoen-contacteer-dan-de-helpdesk'
						  )
						: tHtml(
								'settings/components/email___controleer-of-de-url-correct-is-en-contacteer-indien-nodig-de-helpdesk'
						  )}
				</p>
			</ErrorView>
		);
	};

	if (getPreferencesIsError) {
		return renderFetchPreferencesError();
	}

	return (
		<Container mode="horizontal">
			<Container mode="vertical">
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText('settings/components/email___nieuwsbrief-voorkeuren-pagina-titel')
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'settings/components/email___nieuwsbrief-voorkeuren-pagina-beschrijving'
						)}
					/>
				</Helmet>
				<Spacer margin="bottom-small">
					<BlockHeading type="h3">
						{tText('settings/components/email___e-mail-nieuwsbrief-voorkeuren')}
					</BlockHeading>
				</Spacer>
				{tHtml('settings/components/email___e-mail-nieuwsbrief-voorkeuren-beschrijving')}
				<Spacer margin="top">
					<Form>
						<FormGroup labelFor="newsletter" required>
							<CheckboxGroup>
								{(keys(newsletterLabels) as any).map(
									(newsletterKey: NewsletterList) => (
										<Checkbox
											key={`newsletter_${newsletterKey}`}
											label={(newsletterLabels as any)[newsletterKey]}
											checked={currentNewsletterPreferences[newsletterKey]}
											onChange={() => {
												onChangePreference({
													[newsletterKey]:
														!currentNewsletterPreferences[
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
					{tHtml(
						'settings/components/email/email___we-kunnen-je-wel-nog-account-gerelateerde-mails-sturen-zoals-wachtwoord-opnieuw-instellen'
					)}
				</Spacer>
				<Spacer margin="top">
					{isLoadingGetPreferences || isLoadingUpdatePreferences ? (
						<Spinner />
					) : (
						<Button label="Opslaan" type="primary" onClick={onSavePreferences} />
					)}
				</Spacer>
			</Container>
		</Container>
	);
};

export default withUser(Email) as FC<any>;
