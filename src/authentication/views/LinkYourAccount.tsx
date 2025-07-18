import { Button, ButtonToolbar, Container, Icon, IconName, Spacer } from '@viaa/avo2-components';
import React, { type FC } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router';

import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { navigate } from '../../shared/helpers/link';
import useTranslation from '../../shared/hooks/useTranslation';

import './LinkYourAccount.scss';

const LinkYourAccount: FC<RouteComponentProps> = ({ history }) => {
	const { tText, tHtml } = useTranslation();

	return (
		<Container mode="horizontal" size="medium">
			<Container mode="vertical">
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText('authentication/views/link-your-account___link-uw-account')
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'authentication/views/link-your-account___link-uw-account-paginabeschrijving'
						)}
					/>
				</Helmet>
				<Spacer margin="bottom-extra-large">
					<h1 className="c-h1 u-m-0">
						{tHtml(
							'authentication/views/link-your-account___dag-heb-je-al-een-account-bij-ons'
						)}
					</h1>
				</Spacer>
				<Spacer margin="bottom-extra-large">
					<p>
						{tHtml(
							'authentication/views/link-your-account___om-in-te-loggen-met-itsme-e-id-of-een-digitale-sleutel-heb-je-het-volgende-nodig'
						)}
					</p>
				</Spacer>
				<Spacer margin="bottom-extra-large">
					<Spacer margin="bottom">
						<div className="c-requirement">
							<Icon name={IconName.circleCheck} type="multicolor" />
							<div>
								<Spacer margin="left-small">
									<p>
										{tHtml(
											'authentication/views/link-your-account___een-bestaand-account-met-e-mailadres-smartschool-of-klas-cement'
										)}
									</p>
								</Spacer>
							</div>
						</div>
					</Spacer>
					<Spacer margin="bottom">
						<div className="c-requirement">
							<Icon name={IconName.circleCheck} type="multicolor" />
							<div>
								<Spacer margin="left-small">
									<p>
										{tHtml(
											'authentication/views/link-your-account___een-koppeling-tussen-je-account-en-burgerprofiel'
										)}
									</p>
								</Spacer>
							</div>
						</div>
					</Spacer>
					<Spacer margin="bottom">
						{tHtml(
							'authentication/views/link-your-account___lees-er-alles-over-in-dit-faq-artikel'
						)}
					</Spacer>
				</Spacer>
				<ButtonToolbar>
					<Button
						onClick={() => navigate(history, APP_PATH.REGISTER_OR_LOGIN.route)}
						label={tText('authentication/views/link-your-account___inloggen')}
					/>
					<Button
						onClick={() => navigate(history, APP_PATH.STAMBOEK.route)}
						type="secondary"
						label={tText('authentication/views/link-your-account___account-aanmaken')}
					/>
				</ButtonToolbar>
			</Container>
		</Container>
	);
};

export default withRouter(LinkYourAccount);
