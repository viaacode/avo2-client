import { Alert, BlockHeading, Button, Container, FormGroup, Spacer } from '@viaa/avo2-components';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { StamboekInput } from '../../components/StamboekInput';
import { redirectToServerArchiefRegistrationIdp } from '../../helpers/redirects';

export type RegisterStamboekProps = RouteComponentProps;

export type StamboekValidationStatus =
	| 'INCOMPLETE'
	| 'INVALID_FORMAT'
	| 'INVALID_NUMBER'
	| 'VALID_FORMAT'
	| 'VALID'
	| 'ALREADY_IN_USE'
	| 'SERVER_ERROR';

export const STAMBOEK_LOCAL_STORAGE_KEY = 'AVO.stamboek';

const RegisterStamboek: FunctionComponent<RegisterStamboekProps> = ({ location }) => {
	const [t] = useTranslation();

	const [validStamboekNumber, setValidStamboekNumber] = useState<string>('');

	const handleCreateAccountButtonClicked = () => {
		redirectToServerArchiefRegistrationIdp(location, validStamboekNumber);
	};

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'authentication/views/registration-flow/r-3-stamboek___stamboek-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'authentication/views/registration-flow/r-3-stamboek___stamboek-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<div className="c-content">
					<BlockHeading type="h2">
						<Trans i18nKey="authentication/views/registration-flow/r-3-stamboek___geef-hieronder-je-lerarenkaart-of-stamboeknummer-in">
							Geef hieronder je lerarenkaart- of stamboeknummer in.
						</Trans>
					</BlockHeading>
					<p>
						<Trans i18nKey="authentication/views/registration-flow/r-3-stamboek___zo-gaan-wij-na-of-jij-een-actieve-lesgever-bent-aan-een-vlaamse-erkende-onderwijsinstelling">
							Zo gaan wij na of jij een actieve lesgever bent aan een Vlaamse erkende
							onderwijsinstelling.
						</Trans>
					</p>
					<Spacer margin="top-small">
						<Alert type="info">
							<a
								href="/faq-lesgever/waarom-lerarenkaart-of-stamboeknummer"
								target="_blank"
							>
								<Trans i18nKey="authentication/views/registration-flow/r-3-stamboek___waarom-hebben-jullie-mijn-stamboeknummer-nodig">
									Waarom hebben jullie mijn stamboeknummer nodig?
								</Trans>
							</a>
						</Alert>
					</Spacer>
				</div>
				<Spacer margin={['top-large', 'bottom']}>
					<FormGroup
						label={t(
							'authentication/views/registration-flow/r-3-stamboek___lerarenkaart-of-stamboeknummer'
						)}
						labelFor="stamboekInput"
						required
					>
						<StamboekInput onChange={setValidStamboekNumber} />
					</FormGroup>
				</Spacer>
				<FormGroup>
					<Button
						label={t(
							'authentication/views/registration-flow/r-3-stamboek___account-aanmaken'
						)}
						type="primary"
						disabled={!validStamboekNumber}
						onClick={handleCreateAccountButtonClicked}
					/>
				</FormGroup>

				<Spacer margin="top-large">
					{/* TODO add links to help article */}
					<Alert type="info">
						<Link to={APP_PATH.MANUAL_ACCESS_REQUEST.route}>
							Ik ben lesgever en heb (nog) geen lerarenkaart of stamboeknummer.
						</Link>
					</Alert>
				</Spacer>
			</Container>
		</Container>
	);
};

export default RegisterStamboek;
