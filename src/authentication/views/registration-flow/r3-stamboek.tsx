import { type ContentPageInfo } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { BlockHeading, ContentPageRenderer } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Accordion,
	Button,
	Container,
	FormGroup,
	IconName,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import React, { type FC, useState } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps } from 'react-router';

import { useGetContentPageByPath } from '../../../admin/content-page/hooks/get-content-page-by-path';
import { GENERATE_SITE_TITLE } from '../../../constants';
import ErrorView from '../../../error/views/ErrorView';
import useTranslation from '../../../shared/hooks/useTranslation';
import { StamboekInput } from '../../components/StamboekInput';
import { redirectToServerArchiefRegistrationIdp } from '../../helpers/redirects';

import ManualRegistration from './r4-manual-registration';

type RegisterStamboekProps = RouteComponentProps;

export type StamboekValidationStatus =
	| 'INCOMPLETE'
	| 'INVALID_FORMAT'
	| 'INVALID_NUMBER'
	| 'VALID_FORMAT'
	| 'VALID'
	| 'ALREADY_IN_USE'
	| 'SERVER_ERROR';

export const STAMBOEK_LOCAL_STORAGE_KEY = 'AVO.stamboek';

const RegisterStamboek: FC<RegisterStamboekProps> = ({ location }) => {
	const { tText, tHtml } = useTranslation();

	const [validStamboekNumber, setValidStamboekNumber] = useState<string>('');

	const {
		data: whyTeacherCardPageInfo,
		isLoading: whyTeacherCardIsLoading,
		isError: whyTeacherCardIsError,
	} = useGetContentPageByPath('/faq-lesgever/waarom-lerarenkaart-of-stamboeknummer');

	const {
		data: whereFindPageInfo,
		isLoading: whereFindIsLoading,
		isError: whereFindIsError,
	} = useGetContentPageByPath('/faq-lesgever/waar-vind-ik-mijn-lerarenkaart-nummer');

	const handleCreateAccountButtonClicked = () => {
		redirectToServerArchiefRegistrationIdp(location, validStamboekNumber);
	};

	const renderContentPage = (
		contentPageInfo: ContentPageInfo | null | undefined,
		isLoading: boolean,
		isError: boolean
	) => {
		if (isLoading) {
			return <Spinner />;
		}
		if (isError) {
			return (
				<ErrorView
					message={tText(
						'authentication/views/registration-flow/r-3-stamboek___het-laden-van-dit-help-artikel-is-mislukt'
					)}
					icon={IconName.alertTriangle}
				/>
			);
		}
		if (contentPageInfo) {
			return <ContentPageRenderer contentPageInfo={contentPageInfo} />;
		}
		return null;
	};

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="medium">
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'authentication/views/registration-flow/r-3-stamboek___stamboek-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'authentication/views/registration-flow/r-3-stamboek___stamboek-pagina-beschrijving'
						)}
					/>
				</Helmet>
				<div className="c-content">
					<BlockHeading type="h2">
						{tHtml(
							'authentication/views/registration-flow/r-3-stamboek___geef-hieronder-je-lerarenkaart-of-stamboeknummer-in'
						)}
					</BlockHeading>
					<p>
						{tHtml(
							'authentication/views/registration-flow/r-3-stamboek___zo-gaan-wij-na-of-jij-een-actieve-lesgever-bent-aan-een-vlaamse-erkende-onderwijsinstelling'
						)}
					</p>
				</div>
				<Spacer margin={['top-large', 'bottom']}>
					<FormGroup
						label={tText(
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
						label={tText(
							'authentication/views/registration-flow/r-3-stamboek___account-aanmaken'
						)}
						type="primary"
						disabled={!validStamboekNumber}
						onClick={handleCreateAccountButtonClicked}
					/>
				</FormGroup>

				<Accordion
					title={tText(
						'authentication/views/registration-flow/r-3-stamboek___waar-vind-ik-mijn-lerarenkaart-nummer'
					)}
					className="u-m-t-xl"
					isOpen={false}
				>
					{renderContentPage(whereFindPageInfo, whereFindIsLoading, whereFindIsError)}
				</Accordion>
				<Accordion
					title={tText(
						'authentication/views/registration-flow/r-3-stamboek___waarom-hebben-jullie-mijn-stamboeknummer-nodig'
					)}
					className="u-m-t-s"
					isOpen={false}
				>
					{renderContentPage(
						whyTeacherCardPageInfo,
						whyTeacherCardIsLoading,
						whyTeacherCardIsError
					)}
				</Accordion>
				<Accordion
					title={tText(
						'authentication/views/registration-flow/r-3-stamboek___ik-ben-lesgever-en-heb-nog-geen-lerarenkaart-of-stamboeknummer'
					)}
					className="u-m-t-s"
					isOpen={false}
				>
					<ManualRegistration />
				</Accordion>
			</Container>
		</Container>
	);
};

export default RegisterStamboek;
