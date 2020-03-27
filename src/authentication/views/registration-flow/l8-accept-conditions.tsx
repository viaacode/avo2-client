import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { Button, Spacer, Spinner, Toolbar, ToolbarCenter } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentPage } from '../../../content-page/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ContentPageService } from '../../../shared/services/content-page-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { AppState } from '../../../store';
import { DefaultSecureRouteProps } from '../../components/SecuredRoute';
import { redirectToClientPage } from '../../helpers/redirects';
import { getLoginStateAction } from '../../store/actions';
import { selectLogin, selectUser } from '../../store/selectors';

export const ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS =
	'ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS';

export interface AcceptConditionsProps extends DefaultSecureRouteProps {
	getLoginState: () => Dispatch;
	loginState: Avo.Auth.LoginResponse | null;
}

const AcceptConditions: FunctionComponent<AcceptConditionsProps> = ({
	history,
	location,
	user,
	getLoginState,
	loginState,
}) => {
	const [t] = useTranslation();

	// The term of use and the privacy conditions
	const [pages, setPages] = useState<(Avo.Content.Content | null)[]>([]);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [acceptInProgress, setAcceptInProgress] = useState<boolean>(false);

	const fetchContentPage = useCallback(async () => {
		try {
			setPages(
				await Promise.all([
					ContentPageService.getContentPageByPath('/gebruikersvoorwaarden'),
					ContentPageService.getContentPageByPath('/privacy-voorwaarden'),
				])
			);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de gebruikers- en privacy voorwaarden is mislukt'),
			});
		}
	}, [setLoadingInfo, setPages, t]);

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
					message: t('Het ophalen van de gebruikers- en privacy voorwaarden is mislukt'),
				});
			}
		}
	}, [pages, t]);

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
				get(user, 'profile.id'),
				true,
				true
			);

			getLoginState();
		} catch (err) {
			console.error(
				new CustomError('Failed to set accept conditions notification in the database')
			);
			ToastService.danger(t('Het opslaan van de accepteer condities is mislukt'));
			setAcceptInProgress(false); // Disable on on error, if success => we redirect to other route
		}
	};

	const renderAcceptConditionsPage = () => {
		return (
			<>
				<Spacer margin="bottom-large">
					{/* terms of use */}
					<ContentPage contentPage={pages[0] as Avo.Content.Content} />
					{/* privacy conditions */}
					<ContentPage contentPage={pages[1] as Avo.Content.Content} />
				</Spacer>
				<Spacer margin="large">
					<Toolbar>
						<ToolbarCenter>
							{acceptInProgress ? (
								<Spinner size={'large'} />
							) : (
								<Button
									label={t('Accepteer voorwaarden')}
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
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={pages[0]}
			render={renderAcceptConditionsPage}
		/>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
	loginState: selectLogin(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AcceptConditions));
