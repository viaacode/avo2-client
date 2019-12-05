import queryString from 'query-string';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Alert,
	Button,
	Checkbox,
	Column,
	Container,
	FormGroup,
	Grid,
	Icon,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	TextInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import {
	StamboekValidationStatuses,
	ValidateStamboekResponse,
} from '@viaa/avo2-types/types/stamboek/types';

import { APP_PATH } from '../../../constants';
import { getEnv } from '../../../shared/helpers';
import toastService, { ToastType } from '../../../shared/services/toast-service';
import {
	redirectToClientPage,
	redirectToServerArchiefRegistrationIdp,
} from '../../helpers/redirects';

import './r3-stamboek.scss';

export interface RegisterStamboekProps extends RouteComponentProps {}

type validationStatuses =
	| 'INCOMPLETE'
	| 'INVALID_FORMAT'
	| 'INVALID_NUMBER'
	| 'VALID_FORMAT'
	| 'VALID'
	| 'ALREADY_IN_USE'
	| 'SERVER_ERROR';

export const STAMBOEK_LOCAL_STORAGE_KEY = 'AVO.stamboek';

const RegisterStamboek: FunctionComponent<RegisterStamboekProps> = ({ history, location }) => {
	const [intendsToHaveStamboekNumber, setIntendsToHaveStamboekNumber] = useState<
		boolean | undefined
	>(undefined);
	const [stamboekValidationStatus, setStamboekValidationStatus] = useState<validationStatuses>(
		'INCOMPLETE'
	);
	const [hasAcceptedConditions, setHasAcceptedConditions] = useState<boolean>(false);
	const [rawStamboekNumber, setRawStamboekNumber] = useState<string>('');
	const [validStamboekNumber, setValidStamboekNumber] = useState<string>('');
	const [stamboekValidationCache, setStamboekValidationCache] = useState<{
		[stamboekNumber: string]: boolean;
	}>({});

	const STAMBOEK_MESSAGES: {
		[status in validationStatuses]: { message: string | ReactNode; status: ToastType | undefined }
	} = {
		INCOMPLETE: {
			message: '',
			status: undefined,
		},
		INVALID_FORMAT: {
			message:
				'Het stamboek nummer heeft een ongeldig formaat. Geldige formaten: 00000000000 of 00000000000-000000',
			status: ToastType.DANGER,
		},
		INVALID_NUMBER: {
			message: (
				<span>
					Het stamboek nummer is niet geldig, of nog niet geactiveerd. Indien u nog maar recent uw
					kaart heeft ontvangen kan u via{' '}
					<Button
						onClick={() => redirectToClientPage(APP_PATH.MANUAL_ACCESS_REQUEST, history)}
						label="een manuele aanvraag"
						type="inline-link"
					/>{' '}
					toch al toegang krijgen.
				</span>
			),
			status: ToastType.DANGER,
		},
		VALID_FORMAT: {
			message: 'Bezig met valideren',
			status: ToastType.SPINNER,
		},
		VALID: {
			message: 'Het stamboek nummer is geldig',
			status: ToastType.SUCCESS,
		},
		ALREADY_IN_USE: {
			message: (
				<span>
					Dit stamboek nummer is reeds in gebruik,{' '}
					<Button
						label="contacteer de helpdesk"
						onClick={() => redirectToClientPage(APP_PATH.MANUAL_ACCESS_REQUEST, history)}
						type="inline-link"
					/>
					.
				</span>
			),
			status: ToastType.SUCCESS,
		},
		SERVER_ERROR: {
			message:
				'Er ging iets mis bij het valideren van het stamboek nummer. Probeer later eens opnieuw.',
			status: ToastType.DANGER,
		},
	};

	const verifyStamboekNumber = async (
		stamboekNumber: string
	): Promise<StamboekValidationStatuses> => {
		if (stamboekValidationCache[stamboekNumber]) {
			return 'VALID';
		}
		const response = await fetch(
			`${getEnv('PROXY_URL')}/stamboek/validate?${queryString.stringify({
				stamboekNumber,
			})}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			}
		);

		const data: ValidateStamboekResponse = await response.json();
		if (data.status === 'VALID') {
			// Cache values as much as possible, to avoid multiple requests to the stamboek api
			setStamboekValidationCache({
				...stamboekValidationCache,
				[stamboekNumber]: true,
			});
		}
		return data.status;
	};

	const setStamboekNumber = async (rawStamboekNumber: string) => {
		try {
			setRawStamboekNumber(rawStamboekNumber);
			const cleanedStamboekNumber = rawStamboekNumber.replace(/[^0-9-]+/, '');
			// Check if stamboek number is incomplete
			// eg: 3256
			// or: 43457876543-34
			if (/^[0-9]{0,10}$/g.test(cleanedStamboekNumber)) {
				setStamboekValidationStatus('INCOMPLETE');
				return;
			}
			if (/^[0-9]{11}(-[0-9]*)?$/g.test(cleanedStamboekNumber)) {
				const stamboekNumber = cleanedStamboekNumber.substring(0, 11);
				setStamboekValidationStatus('VALID_FORMAT');
				const validationStatus: StamboekValidationStatuses = await verifyStamboekNumber(
					stamboekNumber
				);
				if (validationStatus === 'VALID') {
					setValidStamboekNumber(stamboekNumber);
					setStamboekValidationStatus('VALID');
				} else if (validationStatus === 'ALREADY_IN_USE') {
					setStamboekValidationStatus('ALREADY_IN_USE');
				} else {
					// 'INVALID' server response
					setStamboekValidationStatus('INVALID_NUMBER');
				}
			} else {
				setStamboekValidationStatus('INVALID_FORMAT');
			}
		} catch (err) {
			setStamboekValidationStatus('SERVER_ERROR');
		}
	};

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<Grid>
					<Column size="2-7">
						<div className="c-content">
							<p className="u-text-bold">Heb je een stamboeknummer?</p>
						</div>
						<FormGroup>
							<RadioButtonGroup>
								<RadioButton
									name="stamboeknummer"
									value="yes"
									label="Ja, ik heb een stamboeknummer / lerarenkaart nummer"
									checked={intendsToHaveStamboekNumber}
									onChange={setIntendsToHaveStamboekNumber}
								/>
								{intendsToHaveStamboekNumber && (
									<Spacer
										className="m-stamboek-input-field-wrapper"
										margin={['left-large', 'top-small', 'bottom-large']}
									>
										<TextInput
											placeholder="00000000000-000000"
											value={rawStamboekNumber}
											onChange={setStamboekNumber}
										/>
										<Tooltip position="bottom" contentClassName="m-stamboek-tooltip">
											<TooltipTrigger>
												<span>
													<Icon className="a-info-icon" name="info" size="small" />
												</span>
											</TooltipTrigger>
											<TooltipContent>
												<Spacer margin={'small'}>
													<Spacer margin="bottom-small">
														<span>Je stamboek nummer staat op je lerarenkaart</span>
													</Spacer>
													<img
														alt="Voorbeeld leeraren kaart"
														className="a-stamboek-image"
														src="/images/leerkrachten-kaart-voorbeeld-nummer.png"
													/>
												</Spacer>
											</TooltipContent>
										</Tooltip>
										<Spacer margin="top-small">
											{STAMBOEK_MESSAGES[stamboekValidationStatus].status && (
												<Alert type={STAMBOEK_MESSAGES[stamboekValidationStatus].status}>
													<div>
														<Spacer margin="bottom-small">
															{STAMBOEK_MESSAGES[stamboekValidationStatus].message}
														</Spacer>
													</div>
												</Alert>
											)}
										</Spacer>
									</Spacer>
								)}
								<RadioButton
									name="stamboeknummer"
									value="no"
									label="Nee, ik heb geen stamboeknummer"
									checked={intendsToHaveStamboekNumber === false}
									onChange={checked => setIntendsToHaveStamboekNumber(!checked)}
								/>
								{intendsToHaveStamboekNumber === false && (
									<Spacer margin="left-large">
										<Alert type="info">
											<div>
												<Spacer margin="bottom-small">
													Zonder stamboek nummer heb je geen toegang tot de website. Indien u toch
													denkt toegang te moeten hebben, vraag dan manueel een account aan.
												</Spacer>
												<Button
													label="Manuele aanvraag"
													onClick={() =>
														redirectToClientPage(APP_PATH.MANUAL_ACCESS_REQUEST, history)
													}
												/>
											</div>
										</Alert>
									</Spacer>
								)}
							</RadioButtonGroup>
						</FormGroup>
						<Spacer margin={['bottom-large', 'top-large']}>
							<FormGroup>
								<Checkbox
									label="Ik aanvaard de gebruiksvoorwaarden en privacyverklaring."
									checked={hasAcceptedConditions}
									onChange={setHasAcceptedConditions}
								/>
							</FormGroup>
						</Spacer>
						<FormGroup>
							<Button
								label="Account aanmaken"
								type="primary"
								disabled={
									stamboekValidationStatus !== 'VALID' ||
									!intendsToHaveStamboekNumber ||
									!hasAcceptedConditions
								}
								onClick={() =>
									redirectToServerArchiefRegistrationIdp(location, validStamboekNumber)
								}
							/>
						</FormGroup>
					</Column>
					<Column size="2-5">
						<Spacer margin="top-small">
							<Alert type="info">
								{/* TODO add links to help article */}
								<a onClick={() => toastService.info('Nog niet geimplementeerd')}>
									Waarom hebben jullie mijn stamboeknummer nodig?
								</a>
							</Alert>
						</Spacer>
						<Spacer margin="top-large">
							{/* TODO add links to help article */}
							<Alert type="info">
								<a onClick={() => toastService.info('Nog niet geimplementeerd')}>
									Ik ben lesgever en heb (nog) geen lerarenkaart of stamboeknummer.
								</a>
							</Alert>
						</Spacer>
					</Column>
				</Grid>
			</Container>
		</Container>
	);
};

export default withRouter(RegisterStamboek);
