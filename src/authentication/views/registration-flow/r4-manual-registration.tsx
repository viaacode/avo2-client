import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	Checkbox,
	Column,
	Container,
	FormGroup,
	Grid,
	Icon,
	IconName,
	Spacer,
	TagInfo,
	TagsInput,
	TextArea,
	TextInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import type { Requests } from 'node-zendesk';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps, withRouter } from 'react-router';

import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ROUTE_PARTS } from '../../../shared/constants';
import { CustomError, validateEmailAddress } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { fetchEducationLevels } from '../../../shared/services/education-levels-service';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { ZendeskService } from '../../../shared/services/zendesk-service';

import './r4-manual-registration.scss';

export type ManualRegistrationProps = RouteComponentProps;

const ManualRegistration: FunctionComponent<ManualRegistrationProps> = ({ history }) => {
	const { tText, tHtml } = useTranslation();

	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [organization, setOrganization] = useState<string>('');
	const [profession, setProfession] = useState<string>('');
	const [reason, setReason] = useState<string>('');
	const [hasBeenSent, setHasBeenSent] = useState<boolean>(false);
	const [acceptedPrivacyConditions, setAcceptedPrivacyConditions] = useState<boolean>(false);
	const [selectedEducationLevels, setSelectedEducationLevels] = useState<TagInfo[]>([]);
	const [educationLevels, setEducationLevels] = useState<TagInfo[]>([]);

	const retrieveEducationLevels = useCallback(async () => {
		try {
			const educationLevels = await fetchEducationLevels();

			setEducationLevels(
				educationLevels.map((item: any) => ({
					value: item,
					label: item,
				}))
			);
		} catch (err) {
			console.error(new CustomError('Failed to get education levels from the database', err));

			ToastService.danger(
				tHtml(
					'authentication/views/registration-flow/r-4-manual-registration___onderwijsniveaus-konden-niet-worden-opgehaald'
				)
			);
		}
	}, [setEducationLevels, tText]);

	useEffect(() => {
		retrieveEducationLevels();
	}, [retrieveEducationLevels]);

	const getValidationErrors = (): string[] => {
		const requiredError = 'is verplicht';
		const errors = [];
		if (!firstName) {
			errors.push(
				`${tText(
					'authentication/views/registration-flow/r-4-manual-registration___voornaam'
				)} ${requiredError}`
			);
		}
		if (!lastName) {
			errors.push(
				`${tText(
					'authentication/views/registration-flow/r-4-manual-registration___achternaam'
				)} ${requiredError}`
			);
		}
		if (!email) {
			errors.push(`Email ${requiredError}`);
		} else if (!validateEmailAddress(email)) {
			errors.push(
				tText(
					'authentication/views/registration-flow/r-4-manual-registration___email-is-geen-geldig-email-adres'
				)
			);
		}
		if (!organization) {
			errors.push(
				`${tText(
					'authentication/views/registration-flow/r-4-manual-registration___school-of-organisatie'
				)} ${requiredError}`
			);
		}
		if (!profession) {
			errors.push(
				`${tText(
					'authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep'
				)} ${requiredError}`
			);
		}
		if (!reason) {
			errors.push(
				`${tText(
					'authentication/views/registration-flow/r-4-manual-registration___reden-van-aanvraag'
				)} ${requiredError}`
			);
		}
		if (!acceptedPrivacyConditions) {
			errors.push(
				tText(
					'authentication/views/registration-flow/r-4-manual-registration___je-moet-de-privacy-voorwaarden-accepteren-om-manueel-toegang-aan-te-vragen'
				)
			);
		}
		return errors;
	};

	const onSend = async () => {
		let ticket: Requests.CreateModel | undefined;
		try {
			const errors = getValidationErrors();

			if (errors.length) {
				ToastService.danger(errors);
				return;
			}

			const parsedEducationLevels = selectedEducationLevels
				.map((selectedEducationLevel) => selectedEducationLevel.label)
				.join(', ');

			// create zendesk ticket
			ticket = {
				comment: {
					url: window.location.href,
					body: JSON.stringify({
						organization,
						profession,
						reason,
						educationLevels: selectedEducationLevels,
					}),
					html_body: `<dl>
  <dt>${tText(
		'authentication/views/registration-flow/r-4-manual-registration___school-of-organisatie'
  )}</dt><dd>${organization}</dd>
  <dt>${tText(
		'authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep'
  )}</dt><dd>${profession}</dd>
  <dt>${tText(
		'authentication/views/registration-flow/r-4-manual-registration___onderwijsniveaus'
  )}</dt><dd>${parsedEducationLevels}</dd>
  <dt>${tText(
		'authentication/views/registration-flow/r-4-manual-registration___reden-voor-aanvraag'
  )}</dt><dd>${reason}</dd>`,
					public: false,
				},
				subject: tText(
					'authentication/views/registration-flow/r-4-manual-registration___manuele-aanvraag-account-op-av-o'
				),
				requester: {
					email,
					name: `${firstName} ${lastName}`,
				},
			};
			await ZendeskService.createTicket(ticket);

			trackEvents(
				{
					object: '',
					object_type: 'account',
					action: 'request',
				},
				null
			);

			ToastService.success(
				tHtml(
					'authentication/views/registration-flow/r-4-manual-registration___je-aanvraag-is-verstuurt'
				)
			);
			setHasBeenSent(true);
		} catch (err) {
			console.error('Failed to create zendesk ticket', err, ticket);
			ToastService.danger(
				tHtml(
					'authentication/views/registration-flow/r-4-manual-registration___het-versturen-van-je-aanvraag-is-mislukt'
				)
			);
		}
	};

	const links = {
		linkToStudentTeacher: APP_PATH.STUDENT_TEACHER.route,
		linkToPupilAccessVersionTeachers: '/leerlingen-toegang-versie-leerkrachten',
		linkForPupilAccess: `/${ROUTE_PARTS.pupils}`,
		linkToStamboek: APP_PATH.STAMBOEK.route,
	};

	const renderForm = () => {
		return (
			<>
				<Spacer margin="bottom-large">
					<Button
						type="secondary"
						onClick={history.goBack}
						icon={IconName.arrowLeft}
						title={tText(
							'authentication/views/registration-flow/r-4-manual-registration___ga-terug-naar-de-stamboek-pagina'
						)}
						ariaLabel={tText(
							'authentication/views/registration-flow/r-4-manual-registration___ga-terug-naar-de-stamboek-pagina'
						)}
					/>
				</Spacer>
				<BlockHeading type="h2">
					{tHtml(
						'authentication/views/registration-flow/r-4-manual-registration___vraag-een-account-aan-op-het-archief-voor-onderwijs'
					)}
				</BlockHeading>
				{tHtml(
					'authentication/views/registration-flow/r-4-manual-registration___intro',
					links
				)}
				<BlockHeading type="h3">
					{tHtml(
						'authentication/views/registration-flow/r-4-manual-registration___aanvraagformulier'
					)}
				</BlockHeading>
				<Grid>
					<Column size="2-6" className="m-manual-registration">
						<FormGroup
							label={tText(
								'authentication/views/registration-flow/r-4-manual-registration___voornaam'
							)}
							labelFor="firstName"
						>
							<TextInput id="firstName" value={firstName} onChange={setFirstName} />
						</FormGroup>
						<FormGroup
							label={tText(
								'authentication/views/registration-flow/r-4-manual-registration___achternaam'
							)}
							labelFor="lastName"
						>
							<TextInput id="lastName" value={lastName} onChange={setLastName} />
						</FormGroup>
						<FormGroup
							label={tText(
								'authentication/views/registration-flow/r-4-manual-registration___professioneel-e-mailadres'
							)}
							labelFor="email"
						>
							<TextInput id="email *" value={email} onChange={setEmail} />
							<Tooltip position="bottom" contentClassName="m-email-tooltip">
								<TooltipTrigger>
									<span>
										<Icon
											className="a-info-icon"
											name={IconName.info}
											size="small"
										/>
									</span>
								</TooltipTrigger>
								<TooltipContent>
									<p>
										{tHtml(
											'authentication/views/registration-flow/r-4-manual-registration___tooltip-professioneel-email-adres'
										)}
									</p>
								</TooltipContent>
							</Tooltip>
						</FormGroup>
						<FormGroup
							label={tText(
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
							label={tText(
								'authentication/views/registration-flow/r-4-manual-registration___functie-of-beroep'
							)}
							labelFor="function"
						>
							<TextInput id="function" value={profession} onChange={setProfession} />
						</FormGroup>
						<FormGroup
							label={tText(
								'collection/views/collection-edit-meta-data___onderwijsniveau'
							)}
							labelFor="classificationId"
						>
							<TagsInput
								options={educationLevels}
								value={selectedEducationLevels}
								onChange={(values: TagInfo[]) => setSelectedEducationLevels(values)}
							/>
						</FormGroup>
						<FormGroup
							label={tText(
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
						<FormGroup>
							<Checkbox
								label={tHtml(
									'authentication/views/registration-flow/r-3-stamboek___ik-aanvaard-de-privacyverklaring'
								)}
								checked={acceptedPrivacyConditions}
								onChange={setAcceptedPrivacyConditions}
							/>
						</FormGroup>
						<Button type="primary" onClick={onSend}>
							{tHtml(
								'authentication/views/registration-flow/r-4-manual-registration___vraag-een-account-aan'
							)}
						</Button>
					</Column>
					<Column size="2-5">
						<></>
					</Column>
				</Grid>
			</>
		);
	};

	const renderConfirmation = () =>
		tHtml('authentication/views/registration-flow/r-4-manual-registration___bevestiging');

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'authentication/views/registration-flow/r-4-manual-registration___manuele-account-aanvraag-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'authentication/views/registration-flow/r-4-manual-registration___manuele-account-aanvraag-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<div className="c-content">{hasBeenSent ? renderConfirmation() : renderForm()}</div>
			</Container>
		</Container>
	);
};

export default withRouter(ManualRegistration);
