import { Button, Container, Spacer } from '@viaa/avo2-components';
import React, { type FC } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../constants';
import { useTranslation } from '../../shared/hooks/useTranslation';

type UserItemRequestFormProps = DefaultSecureRouteProps;

export const UserItemRequestFormConfirm: FC<UserItemRequestFormProps> = () => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();

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
							onClick={() => navigateFunc(-1)}
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
