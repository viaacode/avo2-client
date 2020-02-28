import { Tickets } from 'node-zendesk';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	Button,
	Column,
	Container,
	FormGroup,
	Grid,
	Icon,
	TextArea,
	TextInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';

import { APP_PATH } from '../../../constants';
import { toastService } from '../../../shared/services';
import { createZendeskTicket } from '../../authentication.service';
import { redirectToClientPage } from '../../helpers/redirects';

import './r4-manual-registration.scss';
import { ZendeskService } from '../../../shared/services/zendesk-service';

export interface ManualRegistrationProps extends RouteComponentProps {}

const ManualRegistration: FunctionComponent<ManualRegistrationProps> = ({ history }) => {
	const [t] = useTranslation();

	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [organization, setOrganization] = useState<string>('');
	const [profession, setProfession] = useState<string>('');
	const [reason, setReason] = useState<string>('');
	const [hasBeenSent, setHasBeenSent] = useState<boolean>(false);

	const getValidationErrors = (): string[] => {
		const requiredError = 'is verplicht';
		const errors = [];
		if (!firstName) {
			errors.push(
				`${t(
					'authentication/views/registration-flow/r-4-manual-registration___voornaam'
				)} ${requiredError}`
			);
		}
		if (!lastName) {
			errors.push(
				`${t(
					'authentication/views/registration-flow/r-4-manual-registration___achternaam'
				)} ${requiredError}`
			);
		}
		if (!email) {
			errors.push(`Email ${requiredError}`);
		} else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(email)) {
			errors.push(
				t(
					'authentication/views/registration-flow/r-4-manual-registration___email-is-geen-geldig-email-adres'
				)
			);
		}
		if (!organization) {
			errors.push(
				`${t(
					'authentication/views/registration-flow/r-4-manual-registration___organisatie'
				)} ${requiredError}`
			);
		}
		if (!profession) {
			errors.push(
				`${t(
					'authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep'
				)} ${requiredError}`
			);
		}
		if (!reason) {
			errors.push(
				`${t(
					'authentication/views/registration-flow/r-4-manual-registration___reden-van-aanvraag'
				)} ${requiredError}`
			);
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
						firstName,
						lastName,
						email,
						organization,
						profession,
						reason,
					}),
					html_body: `<dl>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___voornaam">Voornaam</Trans></dt><dd>${firstName}</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___achternaam">Achternaam</Trans></dt><dd>${lastName}</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___email">Email</Trans></dt><dd>${email}</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___school-of-organisatie">School of organisatie</Trans></dt><dd>${organization}</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep">Functie of beroep</Trans></dt><dd>${profession}</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___reden-voor-aanvraag">Reden voor aanvraag</Trans></dt><dd>${reason}</dd>
</dl>`,
					public: false,
				},
				subject: t(
					'authentication/views/registration-flow/r-4-manual-registration___manuele-aanvraag-account-op-av-o'
				),
			};
			await ZendeskService.createTicket(ticket);
			toastService.success(
				t(
					'authentication/views/registration-flow/r-4-manual-registration___je-aanvraag-is-verstuurt'
				)
			);
			setHasBeenSent(true);
		} catch (err) {
			console.error('Failed to create zendesk ticket', err, ticket);
			toastService.danger(
				t(
					'authentication/views/registration-flow/r-4-manual-registration___het-versturen-van-je-aanvraag-is-mislukt'
				)
			);
		}
	};

	const renderForm = () => {
		return (
			<>
				<Button
					type="secondary"
					onClick={() => redirectToClientPage(APP_PATH.STAMBOEK, history)}
				>
					<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___terug">
						Terug
					</Trans>
				</Button>
				<BlockHeading type="h2">
					<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___vraag-een-account-aan-op-het-archief-voor-onderwijs">
						Vraag een account aan op het Archief voor Onderwijs
					</Trans>
				</BlockHeading>
				<p>
					<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___intro">
						TODO: link naar FAQ BP toegang zonder lerarenkaartnummer
						<br />
						<br />
						Het Archief voor Onderwijs biedt op een eenvoudige manier toegang tot Vlaams
						audiovisueel materiaal van meer dan 30 partners. Dit materiaal is
						beschikbaar voor:
						<ul>
							<li>leerkrachten aan een Vlaamse erkende onderwijsinstelling</li>
							<li>studenten aan een Vlaamse lerarenopleiding</li>
							<li>leerlingen van een Vlaamse erkende secundaire school</li>
						</ul>
						<strong>Hoe krijg je toegang?</strong>
						<ol>
							<li>
								<strong>Je bent student aan een Vlaamse lerarenopleiding?</strong>
								<br />
								Dan krijg je via je docent of hogeschool toegang tot onze beeldbank.
								Hoe? Ontdek het op{' '}
								<Link to={APP_PATH.STUDENT_TEACHER}>deze pagina</Link>.<br />
								<br />
							</li>
							<li>
								<strong>
									Je bent leerling in een Vlaamse erkende secundaire school?
								</strong>
								<br />
								Vraag een account via een van je leerkrachten. Lees meer over Het
								Archief voor Onderwijs voor leerlingen op{' '}
								<Link to={APP_PATH.FOR_PUPILS}>deze pagina</Link>.
								<br />
								Wil je als leerkracht je leerlingen toegang geven? Alle info vind je{' '}
								<Link to={'/leerlingen-toegang-versie-leerkrachten'}>hier</Link>.
								<br />
								<br />
							</li>
							<li>
								<strong>
									Je bent lesgever in een Vlaamse erkende onderwijsinstelling?
								</strong>
								<br />

								<ul>
									<li>
										Je hebt een lerarenkaart- of stamboeknummer? Maak dan{' '}
										<Link to={APP_PATH.STAMBOEK}>hier</Link> je gratis een
										account aan.
									</li>

									<li>
										Je hebt geen lerarenkaart- of stamboeknummer? Of je vraagt
										je af of je als lesgever zonder nummer in aanmerking komt
										voor een account? Vraag je toegang aan via onderstaand
										formulier. We verwerken je aanvraag binnen de vijf werkdagen
										na ontvangst.
									</li>
								</ul>
							</li>
						</ol>
					</Trans>{' '}
				</p>
				<BlockHeading type="h3">
					<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___aanvraagformulier">
						Aanvraagformulier
					</Trans>
				</BlockHeading>
				<Grid>
					<Column size="2-6" className="m-manual-registration">
						<FormGroup
							label={t(
								'authentication/views/registration-flow/r-4-manual-registration___voornaam'
							)}
							labelFor="firstName"
						>
							<TextInput id="firstName" value={firstName} onChange={setFirstName} />
						</FormGroup>
						<FormGroup
							label={t(
								'authentication/views/registration-flow/r-4-manual-registration___achternaam'
							)}
							labelFor="lastName"
						>
							<TextInput id="lastName" value={lastName} onChange={setLastName} />
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
										<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___tooltip-professioneel-email-adres">
											Vul bij voorkeur je professioneel e-mailadres in. Dat is
											het adres dat je krijgt in je school of organisatie, bv.
											jan.smit@basisschool-mirakel.be. Zo kunnen we je
											aanvraag sneller behandelen.
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
							<TextInput
								id="organization"
								value={organization}
								onChange={setOrganization}
							/>
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
							<TextArea
								height="small"
								id="reason"
								value={reason}
								onChange={setReason}
							/>
						</FormGroup>
						<Button type="primary" onClick={onSend}>
							<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___vraag-een-account-aan">
								Vraag een account aan
							</Trans>
						</Button>
					</Column>
					<Column size="2-5">
						<></>
					</Column>
				</Grid>
			</>
		);
	};

	const renderConfirmation = () => (
		<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___bevestiging">
			Bedankt voor je aanvraag. Onze helpdesk bekijkt deze binnen de vijf werkdagen. Heb je
			ondertussen nog vragen of toevoegingen met betrekking tot je aanvraag? Formuleer deze
			dan in een reply op automatische bevestigingsmail die je krijgt van onze helpdesk.
		</Trans>
	);

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<div className="c-content">{hasBeenSent ? renderConfirmation() : renderForm()}</div>
			</Container>
		</Container>
	);
};

export default withRouter(ManualRegistration);
