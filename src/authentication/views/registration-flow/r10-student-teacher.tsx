import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import { BlockHeading, Button, Container } from '@viaa/avo2-components';

import { APP_PATH } from '../../../constants';
import { sanitize } from '../../../shared/helpers/sanitize';
import sanitizePresets from '../../../shared/helpers/sanitize/presets';
import { redirectToClientPage } from '../../helpers/redirects';

export interface StudentTeacherProps extends RouteComponentProps {}

const StudentTeacher: FunctionComponent<StudentTeacherProps> = ({ history }) => {
	const [t] = useTranslation();

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<div className="c-content">
					<Button
						type="secondary"
						onClick={() =>
							redirectToClientPage(APP_PATH.MANUAL_ACCESS_REQUEST.route, history)
						}
						icon="arrow-left"
						title={t('Ga terug naar de manuele account aanvraag pagina')}
						ariaLabel={t('Ga terug naar de manuele account aanvraag pagina')}
					/>
					<BlockHeading type="h2">
						<Trans i18nKey="authentication/views/registration-flow/r-10-student-teacher___het-archief-voor-onderwijs-voor-student-leerkrachten">
							Het Archief voor Onderwijs voor Student-leerkrachten
						</Trans>
					</BlockHeading>
					<p
						dangerouslySetInnerHTML={{
							__html: sanitize(
								t(
									'authentication/views/registration-flow/r-10-student-teacher___student-teacher-description'
								),
								sanitizePresets.link
							),
						}}
					/>
				</div>
			</Container>
		</Container>
	);
};

export default StudentTeacher;
