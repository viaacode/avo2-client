import { Button, ButtonToolbar, Container, Icon, Spacer } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps, withRouter } from 'react-router';

import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { navigate } from '../../shared/helpers';

import './LinkYourAccount.scss';
import Html from '../../shared/components/Html/Html';

const LinkYourAccount: FunctionComponent<RouteComponentProps> = ({ history }) => {
	const [t] = useTranslation();

	return (
		<Container mode="horizontal" size="medium">
			<Container mode="vertical">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t('authentication/views/link-your-account___link-uw-account')
						)}
					</title>
					<meta
						name="description"
						content={t(
							'authentication/views/link-your-account___link-uw-account-paginabeschrijving'
						)}
					/>
				</MetaTags>
				<Spacer margin="bottom-extra-large">
					<h1 className="c-h1 u-m-0">
						{t(
							'authentication/views/link-your-account___dag-heb-je-al-een-account-bij-ons'
						)}
					</h1>
				</Spacer>
				<Spacer margin="bottom-extra-large">
					<p>
						{t(
							'authentication/views/link-your-account___om-in-te-loggen-met-itsme-e-id-of-een-digitale-sleutel-heb-je-het-volgende-nodig'
						)}
					</p>
				</Spacer>
				<Spacer margin="bottom-extra-large">
					<Spacer margin="bottom">
						<div className="c-requirement">
							<Icon name="circle-check" type="multicolor" />
							<div>
								<Spacer margin="left-small">
									<p>
										{t(
											'authentication/views/link-your-account___een-bestaand-account-met-e-mailadres-smartschool-of-klas-cement'
										)}
									</p>
								</Spacer>
							</div>
						</div>
					</Spacer>
					<Spacer margin="bottom">
						<div className="c-requirement">
							<Icon name="circle-check" type="multicolor" />
							<div>
								<Spacer margin="left-small">
									<p>
										{t(
											'authentication/views/link-your-account___een-koppeling-tussen-je-account-en-burgerprofiel'
										)}
									</p>
								</Spacer>
							</div>
						</div>
					</Spacer>
					<Spacer margin="bottom">
						<Html
							content={t(
								'authentication/views/link-your-account___lees-er-alles-over-in-dit-faq-artikel'
							)}
						/>
					</Spacer>
				</Spacer>
				<ButtonToolbar>
					<Button
						onClick={() => navigate(history, APP_PATH.REGISTER_OR_LOGIN.route)}
						label={t('authentication/views/link-your-account___inloggen')}
					/>
					<Button
						onClick={() => navigate(history, APP_PATH.STAMBOEK.route)}
						type="secondary"
						label={t('authentication/views/link-your-account___account-aanmaken')}
					/>
				</ButtonToolbar>
			</Container>
		</Container>
	);
};

export default withRouter(LinkYourAccount);
