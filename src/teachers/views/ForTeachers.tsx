import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';

export interface ForTeachersProps extends RouteComponentProps {}

const ForTeachers: FunctionComponent<ForTeachersProps> = ({ history }) => {
	const [t] = useTranslation();

	return (
		<Container className="c-for-teachers-view" mode="vertical">
			<Container mode="horizontal" size="small">
				<ButtonToolbar>
					<Button
						label={t('teachers/views/for-teachers___login')}
						type="primary"
						onClick={() => redirectToClientPage(APP_PATH.REGISTER_OR_LOGIN, history)}
					/>
					<Button
						label={t('teachers/views/for-teachers___maak-je-gratis-account-aan')}
						type="secondary"
						onClick={() => redirectToClientPage(APP_PATH.STAMBOEK, history)}
					/>
				</ButtonToolbar>
			</Container>
		</Container>
	);
};

export default ForTeachers;
