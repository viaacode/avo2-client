import { Tickets } from 'node-zendesk';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Button,
	Column,
	Container,
	FormGroup,
	Grid,
	Heading,
	Icon,
	TextArea,
	TextInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';

import toastService from '../../../shared/services/toast-service';
import { AUTH_PATH } from '../../authentication.const';
import { createZendeskTicket } from '../../authentication.service';

import './r4-manual-registration.scss';

export interface ManualRegistrationProps extends RouteComponentProps {}

const ManualRegistration: FunctionComponent<ManualRegistrationProps> = () => {
	const [t] = useTranslation();

	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [organization, setOrganization] = useState<string>('');
	const [profession, setProfession] = useState<string>('');
	const [reason, setReason] = useState<string>('');

	const getValidationErrors = (): string[] => {
		const requiredError = 'is verplicht';
		const errors = [];
		if (!name) {
			errors.push(`Naam ${requiredError}`);
		}
		if (!email) {
			errors.push(`Email ${requiredError}`);
		} else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(email)) {
			errors.push(`Email is geen geldig email adres`);
		}
		if (!organization) {
			errors.push(`Organisatie ${requiredError}`);
		}
		if (!profession) {
			errors.push(`Functie of beroep ${requiredError}`);
		}
		if (!reason) {
			errors.push(`Reden van aanvraag ${requiredError}`);
		}
		return errors;
	};

	const onSend = async () => {
		let ticket: Tickets.CreateModel | undefined;
		try {
			const errors = getValidationErrors();
			if (errors.length) {
				toastService.danger(errors);
				return;
			}
			// create zendesk ticket
			ticket = {
				comment: {
					url: window.location.href,
					body: JSON.stringify({
						name,
						email,
						organization,
						profession,
						reason,
					}),
					html_body: `<dl>
  <dt><Trans key="authentication/views/registration-flow/r-4-manual-registration___naam">Naam</Trans></dt><dd>${name}</dd>
  <dt><Trans key="authentication/views/registration-flow/r-4-manual-registration___email">Email</Trans></dt><dd>${email}</dd>
  <dt><Trans key="authentication/views/registration-flow/r-4-manual-registration___school-of-organisatie">School of organisatie</Trans></dt><dd>${organization}</dd>
  <dt><Trans key="authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep">Functie of beroep</Trans></dt><dd>${profession}</dd>
  <dt><Trans key="authentication/views/registration-flow/r-4-manual-registration___reden-voor-aanvraag">Reden voor aanvraag</Trans></dt><dd>${reason}</dd>
</dl>`,
					public: false,
				},
				subject: 'Manuele aanvraag account op AvO',
			};
			await createZendeskTicket(ticket);
			toastService.success('Je aanvraag is verstuurt');
		} catch (err) {
			console.error('Failed to create zendesk ticket', err, ticket);
			toastService.danger('Het versturen van je aanvraag is mislukt');
		}
	};

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<div className="c-content">
					<Heading type="h2">
						<Trans key="authentication/views/registration-flow/r-4-manual-registration___vraag-een-account-aan-op-het-archief-voor-onderwijs">
							Vraag een account aan op het Archief voor Onderwijs
						</Trans>
					</Heading>
					<p>
						Het Archief voor Onderwijs is geweldig. Speciaal gemaakt voor lesgevers actief in het
						Vlaamse Onderwijs. Natuurlijk wil jij toegang tot onze schat aan audiovisueel materiaal!
						Denk je dat je in aanmerking komt voor een account? Dan kan je een aanvraag indienen. Je
						aanvraag wordt verwerkt binnen de 5 werkdagen.{' '}
						<Link to={AUTH_PATH.STUDENT_TEACHER}>
							<Trans key="authentication/views/registration-flow/r-4-manual-registration___ben-je-student-leerkracht">
								Ben je student-leerkracht?
							</Trans>
						</Link>
					</p>
					<Heading type="h3">
						<Trans key="authentication/views/registration-flow/r-4-manual-registration___aanvraagformulier">
							Aanvraagformulier
						</Trans>
					</Heading>
					<Grid>
						<Column size="2-6" className="m-manual-registration">
							<FormGroup
								label={t('authentication/views/registration-flow/r-4-manual-registration___naam')}
								labelFor="name"
							>
								<TextInput id="name" value={name} onChange={setName} />
							</FormGroup>
							<FormGroup
								label={t(
									'authentication/views/registration-flow/r-4-manual-registration___professioneel-e-mailadres'
								)}
								labelFor="email"
							>
								<TextInput id="email *" value={email} onChange={setEmail} />
								<Tooltip position="bottom" contentClassName="m-email-tooltip">
									<TooltipTrigger>
										<span>
											<Icon className="a-info-icon" name="info" size="small" />
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											<Trans key="authentication/views/registration-flow/r-4-manual-registration___gelieve-in-onderstaand-formulier-het-professioneel-e-mailadres-dat-je-hebt-gekregen-van-je-school-of-instelling-in-te-geven-bv-jan-smit-basisschool-deklaver-be-zo-kunnen-we-je-aanvraag-sneller-behandelen-voer-dus-enkel-een-prive-adres-in-indien-je-niet-over-een-professioneel-adres-beschikt">
												Gelieve in onderstaand formulier het professioneel e-mailadres dat je hebt
												gekregen van je school of instelling in te geven, bv
												jan.smit@basisschool-deklaver.be. Zo kunnen we je aanvraag sneller
												behandelen. Voer dus enkel een privé-adres in indien je niet over een
												professioneel adres beschikt.
											</Trans>
										</p>
									</TooltipContent>
								</Tooltip>
							</FormGroup>
							<FormGroup
								label={t(
									'authentication/views/registration-flow/r-4-manual-registration___organisatie-of-onderwijsinstelling'
								)}
								labelFor="organization"
							>
								<TextInput id="organization" value={organization} onChange={setOrganization} />
							</FormGroup>
							<FormGroup
								label={t(
									'authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep'
								)}
								labelFor="function"
							>
								<TextInput id="function" value={profession} onChange={setProfession} />
							</FormGroup>
							<FormGroup
								label={t(
									'authentication/views/registration-flow/r-4-manual-registration___reden-voor-aanvraag'
								)}
								labelFor="reason"
							>
								<TextArea height="small" id="reason" value={reason} onChange={setReason} />
							</FormGroup>
							<Button type="primary" onClick={onSend}>
								<Trans>
									<Trans key="authentication/views/registration-flow/r-4-manual-registration___vraag-een-account-aan">
										Vraag een account aan
									</Trans>
								</Trans>
							</Button>
						</Column>
						<Column size="2-5">
							<></>
						</Column>
					</Grid>
				</div>
			</Container>
		</Container>
	);
};

export default withRouter(ManualRegistration);
