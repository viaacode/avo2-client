import { History, Location } from 'history';
import { get, memoize } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, ReactNode, useReducer, useState } from 'react';
import { withRouter } from 'react-router';

import {
	Alert,
	Button,
	Checkbox,
	Container,
	FormGroup,
	Icon,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	TextInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';

import { getEnv } from '../../../shared/helpers';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { AUTH_PATH, INITIAL_USER_STATE } from '../../authentication.const';
import { Action, UserState } from '../../authentication.types';

import './r3-stamboek.scss';

export type StamboekValidationStatuses = 'VALID' | 'ALREADY_IN_USE' | 'INVALID'; // TODO use typings version

// TODO use typings version
export interface ValidateStamboekResponse {
	status: StamboekValidationStatuses;
}

export interface RegisterStamboekProps {
	history: History;
	location: Location;
}

const userReducer = (state: UserState, { type, payload }: Action) => ({
	...state,
	[type]: payload,
});

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
	const [userState, userDispatch] = useReducer(userReducer, INITIAL_USER_STATE);
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

	const redirectToManualAccessRequest = () => {
		toastService('Deze functionaliteit is nog niet beschikbaar', TOAST_TYPE.INFO);
		// history.push(`/${RouteParts.ManualAccessRequest}`);
	};

	const redirectToArchiefRegistrationIdp = () => {
		const base = window.location.href.split(AUTH_PATH.STAMBOEK)[0];
		const returnToUrl = base + get(location, 'state.from.pathname', AUTH_PATH.LOGIN_AVO);

		window.location.href = `${getEnv('PROXY_URL')}/auth/hetarchief/register?${queryString.stringify(
			{
				returnToUrl,
				stamboekNumber: validStamboekNumber,
			}
		)}`;
	};

	const STAMBOEK_MESSAGES: {
		[status in validationStatuses]: { message: string | ReactNode; status: TOAST_TYPE | undefined }
	} = {
		INCOMPLETE: {
			message: '',
			status: undefined,
		},
		INVALID_FORMAT: {
			message:
				'Het stamboek nummer heeft een ongeldig formaat. Geldige formaten: 00000000000 of 00000000000-000000',
			status: TOAST_TYPE.DANGER,
		},
		INVALID_NUMBER: {
			message: (
				<span>
					Het stamboek nummer is niet geldig, of nog niet geactiveerd. Indien u nog maar recent uw
					kaart heeft ontvangen kan u via{' '}
					<Button
						onClick={redirectToManualAccessRequest}
						label="een manuele aanvraag"
						type="inline-link"
					/>{' '}
					toch al toegang krijgen.
				</span>
			),
			status: TOAST_TYPE.DANGER,
		},
		VALID_FORMAT: {
			message: 'Bezig met valideren',
			status: TOAST_TYPE.SPINNER,
		},
		VALID: {
			message: 'Het stamboek nummer is geldig',
			status: TOAST_TYPE.SUCCESS,
		},
		ALREADY_IN_USE: {
			message: (
				<span>
					Dit stamboek nummer is reeds in gebruik,{' '}
					<Button
						label="contacteer de helpdesk"
						onClick={redirectToManualAccessRequest}
						type="inline-link"
					/>
					.
				</span>
			),
			status: TOAST_TYPE.SUCCESS,
		},
		SERVER_ERROR: {
			message:
				'Er ging iets mis bij het valideren van het stamboek nummer. Probeer later eens opnieuw.',
			status: TOAST_TYPE.DANGER,
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
			const cleanedStamboekNumber = rawStamboekNumber.replace(/[^0-9\-]+/, '');
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
			<Container mode="horizontal" size="small">
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
						{intendsToHaveStamboekNumber === true && (
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
											Zonder stamboek nummer heb je geen toegang tot de website. Indien u toch denkt
											toegang te moeten hebben, vraag dan manueel een account aan.
										</Spacer>
										<Button label="Manuele aanvraag" onClick={redirectToManualAccessRequest} />
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
						onClick={redirectToArchiefRegistrationIdp}
					/>
				</FormGroup>
			</Container>
		</Container>
	);
};

export default withRouter(RegisterStamboek);
