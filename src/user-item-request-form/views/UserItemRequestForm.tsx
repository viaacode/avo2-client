import { get } from 'lodash-es';
import { Tickets } from 'node-zendesk';
import queryString from 'query-string';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	Button,
	Checkbox,
	Container,
	FormGroup,
	Spacer,
	Spinner,
	TextArea,
} from '@viaa/avo2-components';

import { createZendeskTicket } from '../../authentication/authentication.service';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { FileUpload } from '../../shared/components';
import { isPhoto } from '../../shared/components/FileUpload/FileUpload';
import { toastService } from '../../shared/services';

export interface UserItemRequestFormProps extends DefaultSecureRouteProps {}

const UserItemRequestForm: FunctionComponent<UserItemRequestFormProps> = ({ history, user }) => {
	const [t] = useTranslation();

	const [description, setDescription] = useState<string>('');
	const [wantsToUploadAttachment, setWantsToUploadAttachment] = useState<boolean>(false);
	const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasBeenSent, setHasBeenSent] = useState<boolean>(false);

	const getValidationErrors = (): string[] => {
		const requiredError = t('is verplicht');
		const errors = [];
		if (!description) {
			errors.push(`${t('Omschrijving')} ${requiredError}`);
		}
		return errors;
	};

	const renderAttachment = () => {
		const filename = get(
			queryString.parse((attachmentUrl || '').split('?').pop() || ''),
			'name',
			t('bestand')
		);
		if (wantsToUploadAttachment && attachmentUrl) {
			if (isPhoto(attachmentUrl)) {
				return `<img src="${attachmentUrl}" alt="Bijlage"/>`;
			}
			return `<a href="${attachmentUrl}">${filename}</a>`;
		}
		return t('Er werd geen bijlage toegevoegd');
	};

	const onSend = async () => {
		let ticket: Tickets.CreateModel | undefined;
		try {
			const errors = getValidationErrors();
			if (errors.length) {
				toastService.danger(errors);
				return;
			}

			setIsLoading(true);
			// create zendesk ticket
			const body = {
				description,
				firstName: user.first_name,
				lastName: user.last_name,
				email: user.mail,
				organization: get(user, 'profile.organizations', [])
					.map((org: { label: string }) => org.label)
					.join(', '),
				subjects: get(user, 'profile.subjects', []).join(', '),
				educationLevels: get(user, 'profile.educationLevels', []).join(', '),
			};
			ticket = {
				comment: {
					url: window.location.href,
					body: JSON.stringify(body),
					html_body: `<dl>
  <dt><Trans>Bericht</Trans></dt><dd>${body.description}</dd>
  <dt><Trans>Bijlage</Trans></dt><dd>${renderAttachment()}</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___voornaam">Voornaam</Trans></dt><dd>${
		body.firstName
  }</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___achternaam">Achternaam</Trans></dt><dd>${
		body.lastName
  }</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___email">Email</Trans></dt><dd>${
		body.email
  }</dd>
  <dt><Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___school-of-organisatie">School of organisatie</Trans></dt><dd>${
		body.organization
  }</dd>
  <dt><Trans>Vakken</Trans></dt><dd>${body.subjects}</dd>
  <dt><Trans>Onderwijsniveaus</Trans></dt><dd>${body.educationLevels}</dd>
</dl>`,
					public: false,
				},
				subject: t('Gebruikersaanvraag item'),
			};
			await createZendeskTicket(ticket);
			toastService.success(
				t(
					'authentication/views/registration-flow/r-4-manual-registration___je-aanvraag-is-verstuurt'
				)
			);
			setHasBeenSent(true);
		} catch (err) {
			console.error('Failed to create zendesk ticket', err, ticket);
			toastService.danger(t('Het versturen van je aanvraag is mislukt'));
		}
		setIsLoading(false);
	};

	const renderForm = () => {
		return (
			<>
				<Button type="secondary" onClick={history.goBack}>
					<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___terug">
						Terug
					</Trans>
				</Button>
				<BlockHeading type="h2">
					<Trans>Niet gevonden wat je zocht? Vraag het aan!</Trans>
				</BlockHeading>
				<p>
					<Trans>
						Vul onderstaand formulier in. Wij gaan na of de fragment(en) in aanmerking
						komen voor publicatie op ons platform. We mogen immers niet zomaar alles
						publiceren omdat we gebonden zijn aan enkele strikte richtlijnen. Bekijk
						deze aandachtig verderop deze pagina. Tip: Ben je zeker dat het door jou
						gezochte fragment fragment niet op ons platform staat? Misschien heeft het
						ondertussen een andere titel? Of is er een gelijkaardig fragment dat je in
						de plaats kunt gebruiken? <Link to="/zoektips">Bekijk onze zoektips</Link>.
					</Trans>
				</p>

				<Container mode="vertical">
					<FormGroup label={t('Omschrijf je aanvraag')} labelFor="description">
						<TextArea
							id="description"
							value={description}
							onChange={setDescription}
							width="large"
							rows={6}
							placeholder={t(
								'Bezorg ons de naam van het programma, titel van een filmpje, aanbieder of zender, uitzenddatum en korte omschrijving. Misschien heb je ook een link?'
							)}
						/>
					</FormGroup>
					<FormGroup label="" labelFor="attachment">
						<Checkbox
							label={t('Ik wil een bijlage opladen')}
							checked={wantsToUploadAttachment}
							onChange={setWantsToUploadAttachment}
						/>
						{wantsToUploadAttachment && (
							<FileUpload
								assetType="ZENDESK_ATTACHMENT"
								urls={attachmentUrl ? [attachmentUrl] : []}
								onChange={attachments => setAttachmentUrl(attachments[0])}
								ownerId=""
								allowedTypes={[]} // allow all types
								allowMulti={false}
								label={t('Selecteer een betand (Word, Excel, … max. xxx MB)')}
							/>
						)}
					</FormGroup>
					<Spacer margin={['top', 'bottom-large']}>
						<FormGroup>
							{isLoading ? (
								<Spinner size="large" />
							) : (
								<Button type="primary" onClick={onSend}>
									<Trans>Aanvraag indienen</Trans>
								</Button>
							)}
						</FormGroup>
					</Spacer>
				</Container>
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
			<Container mode="horizontal" size="large">
				<div className="c-content">{hasBeenSent ? renderConfirmation() : renderForm()}</div>
			</Container>
		</Container>
	);
};

export default withRouter(UserItemRequestForm);
