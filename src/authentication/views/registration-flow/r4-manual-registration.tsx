import React, { FunctionComponent, useState } from 'react';
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

import './r4-manual-registration.scss';

export interface ManualRegistrationProps extends RouteComponentProps {}

const ManualRegistration: FunctionComponent<ManualRegistrationProps> = () => {
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
		} else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(email)) {
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

	const createZendeskTicket = () => {
		const errors = getValidationErrors();
		if (errors.length) {
			toastService.danger(errors);
			return;
		}
		// create zendesk ticket
		toastService.info('Nog niet geimplementeerd');
	};

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<div className="c-content">
					<Heading type="h2">Vraag een account aan op het Archief voor Onderwijs</Heading>
					<p>
						Het Archief voor Onderwijs is geweldig. Speciaal gemaakt voor lesgevers actief in het
						Vlaamse Onderwijs. Natuurlijk wil jij toegang tot onze schat aan audiovisueel materiaal!
						Denk je dat je in aanmerking komt voor een account? Dan kan je een aanvraag indienen. Je
						aanvraag wordt verwerkt binnen de 5 werkdagen.{' '}
						<Link to={AUTH_PATH.STUDENT_TEACHER}>Ben je student-leerkracht?</Link>
					</p>
					<Heading type="h3">Aanvraagformulier</Heading>
					<Grid>
						<Column size="2-6" className="m-manual-registration">
							<FormGroup label="Naam *" labelFor="name">
								<TextInput id="name" value={name} onChange={setName} />
							</FormGroup>
							<FormGroup label="(Professioneel) e-mailadres *" labelFor="email">
								<TextInput id="email *" value={email} onChange={setEmail} />
								<Tooltip position="bottom" contentClassName="m-email-tooltip">
									<TooltipTrigger>
										<span>
											<Icon className="a-info-icon" name="info" size="small" />
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											Gelieve in onderstaand formulier het professioneel e-mailadres dat je hebt
											gekregen van je school of instelling in te geven, bv
											jan.smit@basisschool-deklaver.be. Zo kunnen we je aanvraag sneller behandelen.
											Voer dus enkel een privé-adres in indien je niet over een professioneel adres
											beschikt.
										</p>
									</TooltipContent>
								</Tooltip>
							</FormGroup>
							<FormGroup label="Organisatie of onderwijsinstelling *" labelFor="organization">
								<TextInput id="organization" value={organization} onChange={setOrganization} />
							</FormGroup>
							<FormGroup label="Functie of beroep *" labelFor="function">
								<TextInput id="function" value={profession} onChange={setProfession} />
							</FormGroup>
							<FormGroup label="Reden voor aanvraag *" labelFor="reason">
								<TextArea height="small" id="reason" value={reason} onChange={setReason} />
							</FormGroup>
							<Button type="primary" onClick={createZendeskTicket}>
								Vraag een account aan
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
