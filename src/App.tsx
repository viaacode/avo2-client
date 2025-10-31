import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isEqual, noop, uniq } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { QueryParamProvider } from 'use-query-params';

import { withAdminCoreConfig } from './admin/shared/hoc/with-admin-core-config';
import { SpecialUserGroupId } from './admin/user-groups/user-group.const';
import { commonUserAtom } from './authentication/authentication.store';
import { PermissionService } from './authentication/helpers/permission-service';
import { ConfirmModal } from './shared/components/ConfirmModal/ConfirmModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from './shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { ROUTE_PARTS } from './shared/constants';
import { CustomError } from './shared/helpers/custom-error';
import { ReactRouter7Adapter } from './shared/helpers/routing/react-router-v7-adapter-for-use-query-params';
import { useHideZendeskWidget } from './shared/hooks/useHideZendeskWidget';
import { usePageLoaded } from './shared/hooks/usePageLoaded';
import { useTranslation } from './shared/hooks/useTranslation';
import { ToastService } from './shared/services/toast-service';
import { embedFlowAtom, historyLocationsAtom } from './shared/store/ui.store';
import { waitForTranslations } from './shared/translations/i18n';

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import './App.scss';
import './styles/main.scss';
import { ZendeskWrapper } from './shared/components/ZendeskWrapper/ZendeskWrapper';
import { Navigation } from './shared/components/Navigation/Navigation';
import { Footer } from './shared/components/Footer/Footer';
import { ACMIDMNudgeModal } from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';

const App: FC = () => {
	const { tText, tHtml } = useTranslation();
	const location = useLocation();
	const navigateFunc = useNavigate();

	const commonUser = useAtomValue(commonUserAtom);
	const [historyLocations, setHistoryLocations] = useAtom(historyLocationsAtom);
	const setEmbedFlow = useSetAtom(embedFlowAtom);

	const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);

	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(location.pathname);
	const isPupilUser = [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
		.map(String)
		.includes(String(commonUser?.userGroup?.id));
	const query = new URLSearchParams(location?.search || '');
	const isPreviewRoute = query.get('preview') === 'true';

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	/**
	 * Scroll to the element with the id that is in the hash of the url
	 */
	const handlePageLoaded = useCallback(() => {
		if (window.location.hash) {
			const decodedHash = decodeURIComponent(window.location.hash).replaceAll(' ', '-');
			document.querySelector(decodedHash)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);
	usePageLoaded(handlePageLoaded, !!location.hash);

	/**
	 * Wait for translations to be loaded before rendering the app
	 */
	useEffect(() => {
		waitForTranslations
			.then(() => {
				setLoadingInfo({ state: 'loaded' });
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setLoadingInfo]);

	/**
	 * Hide zendesk when a pupil is logged in
	 */
	useHideZendeskWidget(commonUser, isPupilUser);

	/**
	 * Redirect after linking an account the the hetarchief account (eg: leerid, smartschool, klascement)
	 */
	useEffect(() => {
		if (loadingInfo.state === 'loaded') {
			const url = new URL(window.location.href);
			const linked: Avo.Auth.IdpLinkedSuccessQueryParam = 'linked';
			const hasLinked = url.searchParams.get(linked) !== null;
			if (hasLinked) {
				ToastService.success(tHtml('app___je-account-is-gekoppeld'));
				url.searchParams.delete(linked);
				navigateFunc(url.toString().replace(url.origin, ''), { replace: true });
			}
		}
	}, [loadingInfo, tHtml, navigateFunc]);

	/**
	 * Keep track of route changes and track the 3 last visited pages for tracking events
	 * Store them in the redux store
	 */
	useEffect(() => {
		const existingHistoryLocations = historyLocations;
		const newHistoryLocations = uniq([...existingHistoryLocations, location.pathname]).slice(
			-3
		);
		if (!isEqual(existingHistoryLocations, newHistoryLocations)) {
			setHistoryLocations(newHistoryLocations);
		}
		handlePageLoaded();
	}, [location, historyLocations, setHistoryLocations, handlePageLoaded]);

	/**
	 * Check if this window was opened from somewhere else and get the embed-flow query param
	 * Store the embed-flow query param in the redux store
	 */
	useEffect(() => {
		const url = new URL(window.location.href);
		const embedFlow = url.searchParams.get('embed-flow') || '';
		const isOpenedByOtherPage = !!window.opener;

		if (isOpenedByOtherPage && !!embedFlow && commonUser) {
			if (PermissionService.hasPerm(commonUser, PermissionName.EMBED_ITEMS_ON_OTHER_SITES)) {
				setEmbedFlow(embedFlow);
			} else {
				ToastService.info(tHtml('app___je-hebt-geen-toegang-tot-de-embed-functionaliteit'));
			}
		} else if (embedFlow) {
			console.error(
				"Embed flow query param is present, but the page wasn't opened from another page, so window.opener is undefined. Cannot start the embed flow"
			);
		}
	}, [setEmbedFlow, commonUser, tHtml]);

	// Render
	const renderApp = () => {
		return (
			<div
				className={clsx('o-app', {
					'o-app--admin': isAdminRoute,
					'o-app--preview': isPreviewRoute,
				})}
			>
				<ToastContainer
					autoClose={4000}
					className="c-alert-stack"
					closeButton={false}
					closeOnClick={false}
					draggable={false}
					position="bottom-left"
					transition={Slide}
				/>
				<Navigation isPreviewRoute={isPreviewRoute} />
				<Outlet />
				<Footer />
				<ACMIDMNudgeModal />
				<ZendeskWrapper />
			</div>
		);
	};

	return (
		<>
			{/* Use query params*/}
			<QueryParamProvider adapter={ReactRouter7Adapter}>
				<>
					<LoadingErrorLoadedComponent
						loadingInfo={loadingInfo}
						dataObject={{}}
						render={renderApp}
					/>
					<ConfirmModal
						className="c-modal__unsaved-changes"
						isOpen={isUnsavedChangesModalOpen}
						confirmCallback={() => {
							setIsUnsavedChangesModalOpen(false);
							(confirmUnsavedChangesCallback || noop)(true);
							confirmUnsavedChangesCallback = null;
						}}
						onClose={() => {
							setIsUnsavedChangesModalOpen(false);
							(confirmUnsavedChangesCallback || noop)(false);
							confirmUnsavedChangesCallback = null;
						}}
						cancelLabel={tText('app___blijven')}
						confirmLabel={tText('app___verlaten')}
						title={tHtml('app___wijzigingen-opslaan')}
						body={tHtml(
							'app___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
						)}
						confirmButtonType="primary"
					/>
				</>
			</QueryParamProvider>
		</>
	);
};

export const AppWithAdminCoreConfig = withAdminCoreConfig(App) as FC;

let confirmUnsavedChangesCallback: ((navigateAway: boolean) => void) | null;
