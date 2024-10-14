import {
	type ContentPageInfo,
	ContentPageRenderer,
	ContentPageService,
	convertDbContentPagesToContentPageInfos,
} from '@meemoo/admin-core-ui/dist/client.mjs';
import { Button, Spacer, Spinner, Toolbar, ToolbarCenter } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact, get } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { type Dispatch } from 'redux';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, type LoadingInfo } from '../../../shared/components';
import { CustomError, isUserPupilElementary } from '../../../shared/helpers';
import { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { NotificationService } from '../../../shared/services/notification-service';
import { ToastService } from '../../../shared/services/toast-service';
import { Locale } from '../../../shared/translations/translations.types';
import { type AppState } from '../../../store';
import { type DefaultSecureRouteProps } from '../../components/SecuredRoute';
import { redirectToClientPage } from '../../helpers/redirects';
import { acceptConditionsAction } from '../../store/actions';
import { selectLogin } from '../../store/selectors';

import AcceptElementaryPupilConditions from './accept-elementary-pupil-conditions';

export const ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS =
	'ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS';

export interface AcceptConditionsProps {
	acceptConditions: () => Dispatch;
	loginState: Avo.Auth.LoginResponse | null;
}

const AcceptConditions: FC<AcceptConditionsProps & DefaultSecureRouteProps & UserProps> = ({
	history,
	location,
	acceptConditions,
	loginState,
}) => {
	const { tText, tHtml } = useTranslation();

	// The term of use and the privacy conditions
	const [pages, setPages] = useState<(ContentPageInfo | null)[]>([]);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [acceptInProgress, setAcceptInProgress] = useState<boolean>(false);
	const commonUser = (loginState as Avo.Auth.LoginResponseLoggedIn)?.commonUserInfo;
	const isElementaryPupil = isUserPupilElementary(commonUser);
	const dataObject = isElementaryPupil ? {} : pages[0];

	const fetchContentPage = useCallback(async () => {
		if (isElementaryPupil) {
			setLoadingInfo({ state: 'loaded' });
			return;
		}

		try {
			const dbContentPages = compact(
				await Promise.all([
					ContentPageService.getContentPageByLanguageAndPath(
						Locale.Nl as any,
						'/gebruikersvoorwaarden'
					),
					ContentPageService.getContentPageByLanguageAndPath(
						Locale.Nl as any,
						'/privacy-voorwaarden'
					),
				])
			);
			setPages(convertDbContentPagesToContentPageInfos(dbContentPages) || []);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'authentication/views/registration-flow/l-8-accept-conditions___het-ophalen-van-de-gebruikers-en-privacy-voorwaarden-is-mislukt'
				),
			});
		}
	}, [setLoadingInfo, setPages, tText, commonUser]);

	useEffect(() => {
		fetchContentPage();
	}, [fetchContentPage]);

	useEffect(() => {
		if (pages && pages.length === 2) {
			if (pages[0] && pages[1]) {
				setLoadingInfo({ state: 'loaded' });
			} else {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'authentication/views/registration-flow/l-8-accept-conditions___het-ophalen-van-de-gebruikers-en-privacy-voorwaarden-is-mislukt'
					),
				});
			}
		}
	}, [pages, tText]);

	useEffect(() => {
		if (get(loginState, 'acceptedConditions')) {
			const fromRoute = get(location, 'state.from.pathname');
			if (!fromRoute) {
				throw new CustomError(
					'Failed to navigate to previously requested route because location.state.from is not set',
					null,
					{ location }
				);
			}
			redirectToClientPage(fromRoute, history);
		}
	}, [loginState, location, history]);

	const handleAcceptConditions = async () => {
		try {
			setAcceptInProgress(true);
			await NotificationService.setNotification(
				ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS,
				commonUser?.profileId || '',
				true,
				true
			);

			acceptConditions();
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to set accept conditions notification in the database',
					err,
					{ commonUser }
				)
			);
			ToastService.danger(
				tHtml(
					'authentication/views/registration-flow/l-8-accept-conditions___het-opslaan-van-de-accepteer-condities-is-mislukt'
				)
			);
			setAcceptInProgress(false); // Disable on on error, if success => we redirect to other route
		}
	};

	const renderAcceptConditionsPage = () => {
		return (
			<>
				<Spacer margin="bottom-large">
					{/* terms of use */}
					{!!pages[0] && (
						<ContentPageRenderer
							contentPageInfo={pages[0] as ContentPageInfo}
							commonUser={commonUser}
						/>
					)}
					{/* privacy conditions */}
					{!!pages[1] && (
						<ContentPageRenderer
							contentPageInfo={pages[1] as ContentPageInfo}
							commonUser={commonUser}
						/>
					)}
				</Spacer>
				<Spacer margin="large">
					<Toolbar>
						<ToolbarCenter>
							{acceptInProgress ? (
								<Spinner size={'large'} />
							) : (
								<Button
									label={tText(
										'authentication/views/registration-flow/l-8-accept-conditions___accepteer-voorwaarden'
									)}
									title={tText(
										'authentication/views/registration-flow/l-8-accept-conditions___accepteer-de-gebruiks-en-privacy-voorwaarden'
									)}
									type="primary"
									onClick={handleAcceptConditions}
								/>
							)}
						</ToolbarCenter>
					</Toolbar>
				</Spacer>
			</>
		);
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText(
							'authentication/views/registration-flow/l-8-accept-conditions___voorwaarden-pagina-titel'
						)
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'authentication/views/registration-flow/l-8-accept-conditions___voorwaarden-pagina-beschrijving'
					)}
				/>
			</Helmet>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={dataObject}
				render={
					isElementaryPupil
						? () => <AcceptElementaryPupilConditions user={commonUser} />
						: renderAcceptConditionsPage
				}
			/>
		</>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginState: selectLogin(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		acceptConditions: () => dispatch(acceptConditionsAction() as any),
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AcceptConditions));
