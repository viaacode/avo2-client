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
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-pagina-beschrijving'
						)}
					/>
				</Helmet>
				<div className="c-content">
					{tHtml(
						'authentication/views/registration-flow/r-4-manual-registration___bevestiging'
					)}
					<Spacer margin="top-large">
						<Button
							type="primary"
							onClick={history.goBack}
							label={tText(
								'user-item-request-form/views/user-item-request-form-confirm___doe-nog-een-aanvraag'
							)}
							title={tText(
								'user-item-request-form/views/user-item-request-form-confirm___doe-nog-een-aanvraag'
							)}
							ariaLabel={tText(
								'user-item-request-form/views/user-item-request-form-confirm___oe-nog-een-aanvraag'
							)}
						/>
					</Spacer>
				</div>
			</Container>
		</Container>
	);
};

export default withRouter(UserItemRequestFormConfirm);
