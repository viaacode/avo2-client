import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Button,
	Checkbox,
	Container,
	FormGroup,
	Spacer,
	Spinner,
	TextArea,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import type { Requests } from 'node-zendesk';
import queryString from 'query-string';
import React, { type FunctionComponent, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { FileUpload } from '../../shared/components';
import { getFullName, isMobileWidth } from '../../shared/helpers';
import { DOC_TYPES, isPhoto } from '../../shared/helpers/files';
import { groupLomLinks } from '../../shared/helpers/lom';
import withUser from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ZendeskService } from '../../shared/services/zendesk-service';

export type UserItemRequestFormProps = DefaultSecureRouteProps;

const UserItemRequestForm: FunctionComponent<UserItemRequestFormProps> = ({
	history,
	user,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	const [description, setDescription] = useState<string>('');
	const [wantsToUploadAttachment, setWantsToUploadAttachment] = useState<boolean>(false);
	const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getValidationErrors = (): string[] => {
		const requiredError = tText(
			'user-item-request-form/views/user-item-request-form___is-verplicht'
		);
		const errors = [];
		if (!description) {
			errors.push(
				`${tText(
					'user-item-request-form/views/user-item-request-form___omschrijving'
				)} ${requiredError}`
			);
		}
		return errors;
	};

	const renderAttachment = () => {
		const filename = get(
			queryString.parse((attachmentUrl || '').split('?').pop() || ''),
			'name',
			tText('user-item-request-form/views/user-item-request-form___bestand')
		);
		if (wantsToUploadAttachment && attachmentUrl) {
			if (isPhoto(attachmentUrl)) {
				return `<img src="${attachmentUrl}" alt="Bijlage"/>`;
			}
			return `<a href="${attachmentUrl}">${filename}</a>`;
		}
		return tText(
			'user-item-request-form/views/user-item-request-form___er-werd-geen-bijlage-toegevoegd'
		);
	};

	const onSend = async () => {
		let ticket: Requests.CreateModel | undefined;
		try {
			const errors = getValidationErrors();
			if (errors.length) {
				ToastService.danger(errors);
				return;
			}

			setIsLoading(true);
			// create zendesk ticket
			const groupedLoms = groupLomLinks(commonUser.loms);
			const body = {
				description,
				firstName: user.first_name,
				lastName: user.last_name,
				email: user.mail,
				organization: (commonUser?.educationalOrganisations || [])
					.map((org) => org.organisationLabel)
					.join(', '),
				subjects: groupedLoms.subject.map((subject) => subject.label).join(', '),
				educationLevels: groupedLoms.educationLevel
					.map((educationLevel) => educationLevel.label)
					.join(', '),
			};
			ticket = {
				comment: {
					url: window.location.href,
					body: JSON.stringify(body),
					html_body: `<dl>
  <dt>${tText('user-item-request-form/views/user-item-request-form___bericht')}</dt><dd>${
		body.description
  }</dd>
  <dt>${tText(
		'user-item-request-form/views/user-item-request-form___bijlage'
  )}</dt><dd>${renderAttachment()}</dd>
  <dt>${tText(
		'authentication/views/registration-flow/r-4-manual-registration___school-of-organisatie'
  )}</dt><dd>${body.organization}</dd>
  <dt>${tText('user-item-request-form/views/user-item-request-form___vakken')}</dt><dd>${
		body.subjects
  }</dd>
  <dt>${tText('user-item-request-form/views/user-item-request-form___onderwijsniveaus')}</dt><dd>${
		body.educationLevels
  }</dd>
</dl>`,
					public: false,
				},
				subject: tText(
					'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-item'
				),
				requester: {
					email: get(user, 'mail'),
					name: getFullName(user as { profile: Avo.User.Profile }, true, false) || '',
				},
			};
			await ZendeskService.createTicket(ticket);

			trackEvents(
				{
					object: description,
					object_type: 'item',
					action: 'request',
				},
				user
			);

			ToastService.success(
				tHtml(
					'authentication/views/registration-flow/r-4-manual-registration___je-aanvraag-is-verstuurt'
				)
			);
			redirectToClientPage(APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route, history);
		} catch (err) {
			console.error('Failed to create zendesk ticket', err, ticket);
			ToastService.danger(
				tHtml(
					'user-item-request-form/views/user-item-request-form___het-versturen-van-je-aanvraag-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const renderForm = () => {
		return (
			<>
				<BlockHeading type="h2">
					{tHtml(
						'user-item-request-form/views/user-item-request-form___niet-gevonden-wat-je-zocht-vraag-het-aan'
					)}
				</BlockHeading>
				{tHtml(
					'user-item-request-form/views/user-item-request-form___vul-onderstaand-formulier-in'
				)}
				<Container mode="vertical">
					{tHtml(
						'user-item-request-form/views/user-item-request-form___omschrijf-je-aanvraag'
					)}
					<FormGroup>
						<TextArea
							id="description"
							value={description}
							onChange={setDescription}
							rows={isMobileWidth() ? 6 : 15}
							placeholder={tText(
								'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-beschrijving'
							)}
						/>
					</FormGroup>
					<FormGroup label="" labelFor="attachment">
						<Checkbox
							label={tText(
								'user-item-request-form/views/user-item-request-form___ik-wil-een-bijlage-opladen'
							)}
							checked={wantsToUploadAttachment}
							onChange={setWantsToUploadAttachment}
						/>
						{wantsToUploadAttachment && (
							<FileUpload
								assetType="ZENDESK_ATTACHMENT"
								urls={attachmentUrl ? [attachmentUrl] : []}
								onChange={(attachments) => setAttachmentUrl(attachments[0])}
								ownerId=""
								allowedTypes={DOC_TYPES}
								allowMulti={false}
								label={tText(
									'user-item-request-form/views/user-item-request-form___selecteer-een-betand-word-excel-max-xxx-mb'
								)}
							/>
						)}
					</FormGroup>
					<Spacer margin={['top', 'bottom-extra-large']}>
						<FormGroup>
							{isLoading ? (
								<Spinner size="large" />
							) : (
								<Button
									type="primary"
									onClick={onSend}
									label={tText(
										'user-item-request-form/views/user-item-request-form___aanvraag-indienen'
									)}
								/>
							)}
						</FormGroup>
					</Spacer>
					{tHtml(
						'user-item-request-form/views/user-item-request-form___welk-materiaal-komt-in-aanmerking-voor-publicatie'
					)}
				</Container>
			</>
		);
	};

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-pagina-beschrijving'
						)}
					/>
				</Helmet>
				<div className="c-content">{renderForm()}</div>
			</Container>
		</Container>
	);
};

export default compose(withRouter, withUser)(UserItemRequestForm) as FunctionComponent;
