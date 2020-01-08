import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import {
	Alert,
	Button,
	Checkbox,
	Container,
	FormGroup,
	Heading,
	Spacer,
} from '@viaa/avo2-components';

import { Link } from 'react-router-dom';
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
	const [t] = useTranslation();

	const [hasAcceptedConditions, setHasAcceptedConditions] = useState<boolean>(false);
	const [validStamboekNumber, setValidStamboekNumber] = useState<string>('');

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<div className="c-content">
					<Heading type="h2">
						<Trans i18nKey="authentication/views/registration-flow/r-3-stamboek___geef-hieronder-je-lerarenkaart-of-stamboeknummer-in">
							Geef hieronder je lerarenkaart- of stamboeknummer in.
						</Trans>
					</Heading>
					<p>
						<Trans i18nKey="authentication/views/registration-flow/r-3-stamboek___zo-gaan-wij-na-of-jij-een-actieve-lesgever-bent-aan-een-vlaamse-erkende-onderwijsinstelling">
							Zo gaan wij na of jij een actieve lesgever bent aan een Vlaamse erkende
							onderwijsinstelling.
						</Trans>
					</p>
					<Spacer margin="top-small">
						{/* TODO add links to help article */}
						<Alert type="info">
							{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
							<a onClick={() => toastService.info('Nog niet geimplementeerd')}>
								<Trans i18nKey="authentication/views/registration-flow/r-3-stamboek___waarom-hebben-jullie-mijn-stamboeknummer-nodig">
									Waarom hebben jullie mijn stamboeknummer nodig?
								</Trans>
							</a>
						</Alert>
					</Spacer>
				</div>
				<Spacer margin="top-large">
					<FormGroup
						label={t(
							'authentication/views/registration-flow/r-3-stamboek___lerarenkaart-of-stamboeknummer'
						)}
						labelFor="stamboekInput"
					>
						<StamboekInput
							onChange={setValidStamboekNumber}
							history={history}
							location={location}
							{...props}
						/>
					</FormGroup>
				</Spacer>
				<Spacer margin={['bottom-large', 'top-large']}>
					<FormGroup>
						<Checkbox
							label={t(
								'authentication/views/registration-flow/r-3-stamboek___ik-aanvaard-de-gebruiksvoorwaarden-en-privacyverklaring'
							)}
							checked={hasAcceptedConditions}
							onChange={setHasAcceptedConditions}
						/>
					</FormGroup>
				</Spacer>
				<FormGroup>
					<Button
						label={t('authentication/views/registration-flow/r-3-stamboek___account-aanmaken')}
						type="primary"
						disabled={!validStamboekNumber || !hasAcceptedConditions}
						onClick={() => redirectToServerArchiefRegistrationIdp(location, validStamboekNumber)}
					/>
				</FormGroup>

				<Spacer margin="top-large">
					{/* TODO add links to help article */}
					<Alert type="info">
						{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
						<Link to={APP_PATH.MANUAL_ACCESS_REQUEST}>
							Ik ben lesgever en heb (nog) geen lerarenkaart of stamboeknummer.
						</Link>
					</Alert>
				</Spacer>
			</Container>
		</Container>
	);
};

export default RegisterStamboek;
