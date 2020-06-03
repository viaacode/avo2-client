import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps } from 'react-router';

import { BlockHeading, Button, Container } from '@viaa/avo2-components';

import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import Html from '../../../shared/components/Html/Html';
import { redirectToClientPage } from '../../helpers/redirects';

export interface StudentTeacherProps extends RouteComponentProps {}

const StudentTeacher: FunctionComponent<StudentTeacherProps> = ({ history }) => {
	const [t] = useTranslation();

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'authentication/views/registration-flow/r-10-student-teacher___student-lesgever-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'authentication/views/registration-flow/r-10-student-teacher___student-lesgever-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<div className="c-content">
					<Button
						type="secondary"
						onClick={() =>
							redirectToClientPage(APP_PATH.MANUAL_ACCESS_REQUEST.route, history)
						}
						icon="arrow-left"
						title={t(
							'authentication/views/registration-flow/r-10-student-teacher___ga-terug-naar-de-manuele-account-aanvraag-pagina'
						)}
						ariaLabel={t(
							'authentication/views/registration-flow/r-10-student-teacher___ga-terug-naar-de-manuele-account-aanvraag-pagina'
						)}
					/>
					<BlockHeading type="h2">
						<Trans i18nKey="authentication/views/registration-flow/r-10-student-teacher___het-archief-voor-onderwijs-voor-student-leerkrachten">
							Het Archief voor Onderwijs voor Student-leerkrachten
						</Trans>
					</BlockHeading>
					<Html
						content={t(
							'authentication/views/registration-flow/r-10-student-teacher___student-teacher-description'
						)}
					/>
				</div>
			</Container>
		</Container>
	);
};

export default StudentTeacher;
