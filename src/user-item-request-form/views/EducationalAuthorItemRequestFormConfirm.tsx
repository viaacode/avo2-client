import { Button, Container, Spacer } from '@viaa/avo2-components';
import React, { type FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../constants';
import useTranslation from '../../shared/hooks/useTranslation';

export type UserItemRequestFormProps = DefaultSecureRouteProps;

const UserItemRequestFormConfirm: FunctionComponent<UserItemRequestFormProps> = ({ history }) => {
	const { tText, tHtml } = useTranslation();

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<Helmet>
					<title>{GENERATE_SITE_TITLE(tText('Gebruikersaanvraag pagina titel'))}</title>
					<meta
						name="description"
						content={tText('Gebruikersaanvraag pagina beschrijving')}
					/>
				</Helmet>
				<div className="c-content">
					{tHtml('Bevestiging')}
					<Spacer margin="top-large">
						<Button
							type="primary"
							onClick={history.goBack}
							label={tText('Doe nog een aanvraag')}
							title={tText('Doe nog een aanvraag')}
							ariaLabel={tText('De nog een aanvraag')}
						/>
					</Spacer>
				</div>
			</Container>
		</Container>
	);
};

export default withRouter(UserItemRequestFormConfirm);
