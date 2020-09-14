import { isString, omit } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	BlockHeading,
	Button,
	Column,
	Container,
	Flex,
	FlexItem,
	Grid,
	Modal,
	ModalBody,
	Spacer,
} from '@viaa/avo2-components';

import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import LoginOptions from '../components/LoginOptions';
import { getBaseUrl, getFromPath, redirectToClientPage } from '../helpers/redirects';

import './RegisterOrLogin.scss';

export interface RegisterOrLoginProps {}

const RegisterOrRegisterOrLogin: FunctionComponent<RegisterOrLoginProps & RouteComponentProps> = ({
	history,
	location,
	match,
}) => {
	const [t] = useTranslation();

	const getRedirectAfterLogin = () => {
		// From query string
		const queryStrings = queryString.parse(location.search);
		if (queryStrings.returnToUrl && isString(queryStrings.returnToUrl)) {
			if (
				queryStrings.returnToUrl.startsWith('http') ||
				queryStrings.returnToUrl.startsWith('//')
			) {
				// replace absolute url by relative url
				return `/${queryStrings.returnToUrl.split(/\/\/[^/]+?\//).pop() || 'start'}`;
			}
			return queryStrings.returnToUrl;
		}

		// From location history
		if (location.pathname === `/${ROUTE_PARTS.registerOrLogin}`) {
			return getBaseUrl(location) + getFromPath(location);
		}

		return (
			location.pathname +
			location.hash +
			queryString.stringify(omit(queryStrings, ['returnToUrl']))
		);
	};

	return (
		<Container className="c-register-login-view" mode="horizontal">
			<Container mode="vertical">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'authentication/views/register-or-login___registratie-of-login-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'authentication/views/register-or-login___registratie-of-login-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<Modal className="c-register-login-view__modal" isOpen size="medium">
					<ModalBody>
						<Grid>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<h2 className="c-h2 u-m-0">
											<Trans i18nKey="authentication/views/register-or-login___welkom-op-het-archief-voor-onderwijs">
												Welkom op Het Archief voor Onderwijs
											</Trans>
										</h2>
										<Spacer margin={['top-small', 'bottom']}>
											<p>
												<Trans i18nKey="authentication/views/register-or-login___maak-een-gratis-account-aan-en-verrijk-je-lessen-met-beeld-en-geluid-op-maat-van-de-klas">
													Maak een gratis account aan en verrijk je lessen
													met beeld en geluid op maat van de klas.
												</Trans>
											</p>
										</Spacer>
										<Spacer margin={['top-small', 'bottom-small']}>
											<Button
												block
												label={t(
													'authentication/views/register-or-login___account-aanmaken-als-lesgever'
												)}
												type="primary"
												onClick={() =>
													redirectToClientPage(
														APP_PATH.STAMBOEK.route,
														history
													)
												}
											/>
										</Spacer>
										<Button
											block
											label={t(
												'authentication/views/register-or-login___krijg-toegang-als-leerling'
											)}
											type="primary"
											onClick={() =>
												redirectToClientPage(
													`/${ROUTE_PARTS.pupils}`,
													history
												)
											}
										/>
									</FlexItem>
								</Flex>
							</Column>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<BlockHeading type="h2" className="u-m-0">
											<Trans i18nKey="authentication/views/register-or-login___reeds-een-account">
												Reeds een account?
											</Trans>
											<br />
											<Trans i18nKey="authentication/views/register-or-login___log-dan-hier-in">
												Log dan hier in.
											</Trans>
										</BlockHeading>
										<LoginOptions
											history={history}
											location={location}
											match={match}
											redirectAfterLogin={getRedirectAfterLogin()}
										/>
									</FlexItem>
								</Flex>
							</Column>
						</Grid>
					</ModalBody>
				</Modal>
			</Container>
		</Container>
	);
};

export default withRouter(RegisterOrRegisterOrLogin);
