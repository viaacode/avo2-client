import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps } from 'react-router';

import {
	Alert,
	Button,
	Checkbox,
	Container,
	FormGroup,
	Heading,
	Icon,
	Grid,
	RadioButton,
	RadioButtonGroup,
	Spacer,
} from '@viaa/avo2-components';

import { APP_PATH } from '../../../constants';
import toastService from '../../../shared/services/toast-service';
import { StamboekInput } from '../../components/StamboekInput';
import {
	redirectToClientPage,
	redirectToServerArchiefRegistrationIdp,
} from '../../helpers/redirects';

export interface RegisterStamboekProps extends RouteComponentProps {}

export type StamboekValidationStatus =
	| 'INCOMPLETE'
	| 'INVALID_FORMAT'
	| 'INVALID_NUMBER'
	| 'VALID_FORMAT'
	| 'VALID'
	| 'ALREADY_IN_USE'
	| 'SERVER_ERROR';

export const STAMBOEK_LOCAL_STORAGE_KEY = 'AVO.stamboek';

const RegisterStamboek: FunctionComponent<RegisterStamboekProps> = ({
	history,
	location,
	...props
}) => {
	const [hasAcceptedConditions, setHasAcceptedConditions] = useState<boolean>(false);
	const [intendsToHaveStamboekNumber, setIntendsToHaveStamboekNumber] = useState<
		boolean | undefined
	>(undefined);
	const [validStamboekNumber, setValidStamboekNumber] = useState<string>('');

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<div className="c-content">
					<Heading type="h2">Geef hieronder je lerarenkaart- of stamboeknummer in.</Heading>
					<p>
						Zo gaan wij na of jij een actieve lesgever bent aan een Vlaamse erkende
						onderwijsinstelling.
					</p>
					<Spacer margin="top-small">
						{/* TODO add links to help article */}
						<Alert type="info">
							{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
							<a onClick={() => toastService.info('Nog niet geimplementeerd')}>
								Waarom hebben jullie mijn stamboeknummer nodig?
							</a>
						</Alert>
					</Spacer>
				</div>
				<Spacer margin="top-large">
					<FormGroup label="Lerarenkaart- of stamboeknummer" labelFor="stamboekInput">
						<Spacer
							className="m-stamboek-input-field-wrapper"
							margin={['top-small', 'bottom-large']}
						>
							<TextInput
								id="stamboekInput"
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
					</FormGroup>
				</Spacer>
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
						disabled={stamboekValidationStatus !== 'VALID' || !hasAcceptedConditions}
						onClick={() => redirectToServerArchiefRegistrationIdp(location, validStamboekNumber)}
					/>
				</FormGroup>

				<Spacer margin="top-large">
					{/* TODO add links to help article */}
					<Alert type="info">
						{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
						<a onClick={() => toastService.info('Nog niet geimplementeerd')}>
							Ik ben lesgever en heb (nog) geen lerarenkaart of stamboeknummer.
						</a>
					</Alert>
				</Spacer>
			</Container>
		</Container>
	);
};

export default RegisterStamboek;
