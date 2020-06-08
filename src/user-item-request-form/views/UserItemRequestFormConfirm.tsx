import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router';

import { Button, Container, Spacer } from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../constants';

export interface UserItemRequestFormProps extends DefaultSecureRouteProps {}

const UserItemRequestFormConfirm: FunctionComponent<UserItemRequestFormProps> = ({ history }) => {
	const [t] = useTranslation();

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'user-item-request-form/views/user-item-request-form___gebruikersaanvraag-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<div className="c-content">
					<Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___bevestiging">
						Bedankt voor je aanvraag. Onze helpdesk bekijkt deze binnen de vijf
						werkdagen. Heb je ondertussen nog vragen of toevoegingen met betrekking tot
						je aanvraag? Formuleer deze dan in een reply op automatische
						bevestigingsmail die je krijgt van onze helpdesk.
					</Trans>
					<Spacer margin="top-large">
						<Button
							type="primary"
							onClick={history.goBack}
							label={t(
								'user-item-request-form/views/user-item-request-form-confirm___doe-nog-een-aanvraag'
							)}
							title={t(
								'user-item-request-form/views/user-item-request-form-confirm___doe-nog-een-aanvraag'
							)}
							ariaLabel={t(
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
