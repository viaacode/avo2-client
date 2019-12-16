import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps } from 'react-router';

import {
	Alert,
	Button,
	Checkbox,
	Column,
	Container,
	FormGroup,
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
									<StamboekInput
										onChange={setValidStamboekNumber}
										location={location}
										history={history}
										{...props}
									/>
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
									!validStamboekNumber || !intendsToHaveStamboekNumber || !hasAcceptedConditions
								}
								onClick={() =>
									redirectToServerArchiefRegistrationIdp(location, validStamboekNumber)
								}
							/>
						</FormGroup>
					</Column>
					<Column size="2-5">
						<Spacer margin="top-small">
							{/* TODO add links to help article */}
							<Alert type="info">
								{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
								<a onClick={() => toastService.info('Nog niet geimplementeerd')}>
									Waarom hebben jullie mijn stamboeknummer nodig?
								</a>
							</Alert>
						</Spacer>
						<Spacer margin="top-large">
							{/* TODO add links to help article */}
							<Alert type="info">
								{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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

export default RegisterStamboek;
