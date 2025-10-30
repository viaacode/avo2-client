import {
	type AdminConfig,
	type FlowPlayerWrapperProps,
	type LinkInfo,
	type ToastInfo,
	UserBulkAction,
} from '@meemoo/admin-core-ui/admin';
import { ContentBlockType, ContentPageWidth } from '@meemoo/admin-core-ui/client';
import { Icon, IconName, Spinner } from '@viaa/avo2-components';
import { type Avo, DatabaseType } from '@viaa/avo2-types';
import { compact, noop } from 'lodash-es';
import React, { type FC } from 'react';
import { type NavigateFunction } from 'react-router';
import { Link } from 'react-router-dom';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { APP_PATH, type RouteId } from '../../../constants';
import { FlowPlayerWrapper } from '../../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { DEFAULT_AUDIO_STILL, ROUTE_PARTS } from '../../../shared/constants';
import { getEnv } from '../../../shared/helpers/env';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { EducationOrganisationService } from '../../../shared/services/education-organizations-service';
import { ToastService, ToastTypeToAvoToastType } from '../../../shared/services/toast-service';
import { store } from '../../../shared/store/ui.store';
import { Locale } from '../../../shared/translations/translations.types';
import { ADMIN_PATH } from '../../admin.const';
import { BlockSearch } from '../../content-page/components/blocks/BlockSearch/BlockSearch';
import { MediaGridWrapper } from '../../content-page/components/blocks/MediaGridWrapper/MediaGridWrapper';
import { GET_ADMIN_ICON_OPTIONS } from '../constants';

const alertIcons: IconName[] = [
	IconName.notification,
	IconName.user,
	IconName.alertCircle,
	IconName.alertOctagon,
	IconName.alertTriangle,
	IconName.info,
	IconName.unlock,
	IconName.calendar,
	IconName.book,
];

const getAlertIconNames = (): Partial<Record<IconName, string>> => ({
	[IconName.notification]: tText('admin/shared/hoc/with-admin-core-config___notificatie'),
	[IconName.user]: tText('admin/shared/hoc/with-admin-core-config___gebruiker'),
	[IconName.alertCircle]: tText('admin/shared/hoc/with-admin-core-config___waarschuwing-cirkel'),
	[IconName.alertOctagon]: tText(
		'admin/shared/hoc/with-admin-core-config___waarschuwing-achthoek'
	),
	[IconName.alertTriangle]: tText(
		'admin/shared/hoc/with-admin-core-config___waarschuwing-driehoek'
	),
	[IconName.info]: tText('admin/shared/hoc/with-admin-core-config___info'),
	[IconName.unlock]: tText('admin/shared/hoc/with-admin-core-config___slot'),
	[IconName.calendar]: tText('admin/shared/hoc/with-admin-core-config___kalender'),
	[IconName.book]: tText('admin/shared/hoc/with-admin-core-config___boek'),
});

const ALERT_ICON_LIST_CONFIG = (): {
	key: IconName;
	value: IconName;
	label: string;
}[] =>
	alertIcons.map((iconKey: IconName) => ({
		key: iconKey,
		value: iconKey,
		label: getAlertIconNames()[iconKey] || iconKey,
	}));

export function getAdminCoreConfig(navigateFunc: NavigateFunction): AdminConfig {
	const InternalLink = (linkInfo: LinkInfo) => {
		return <Link {...linkInfo} to={linkInfo.to || ''} />;
	};

	const proxyUrl = getEnv('PROXY_URL') as string;

	return {
		staticPages: {
			[Locale.Nl]: compact(
				(Object.keys(APP_PATH) as RouteId[]).map((routeId) => {
					if (APP_PATH[routeId].showInContentPicker) {
						return APP_PATH[routeId].route;
					} else {
						return null;
					}
				})
			),
		},
		contentPage: {
			availableContentBlocks: [
				ContentBlockType.AnchorLinks,
				ContentBlockType.Buttons,
				ContentBlockType.ContentPageMeta,
				ContentBlockType.CTAs,
				ContentBlockType.Eventbrite,
				ContentBlockType.Heading,
				ContentBlockType.AvoHero,
				ContentBlockType.IFrame,
				ContentBlockType.Image,
				ContentBlockType.ImageGrid,
				ContentBlockType.ImageTitleTextButton,
				ContentBlockType.Intro,
				ContentBlockType.Klaar,
				ContentBlockType.LogoGrid,
				ContentBlockType.MediaGrid,
				ContentBlockType.MediaPlayer,
				ContentBlockType.MediaPlayerTitleTextButton,
				ContentBlockType.PageOverview,
				ContentBlockType.ProjectsSpotlight,
				ContentBlockType.Quote,
				ContentBlockType.RichText,
				ContentBlockType.RichTextTwoColumns,
				ContentBlockType.Search,
				ContentBlockType.Spotlight,
				ContentBlockType.Uitgeklaard,
				ContentBlockType.UspGrid,
				ContentBlockType.AvoImageTextBackground,
				ContentBlockType.ScrollDownNudge,
			],
			defaultPageWidth: ContentPageWidth.EXTRA_LARGE,
			onSaveContentPage: () => new Promise(noop),
		},
		navigationBars: {
			enableIcons: false,
			customNavigationElements: ['<PupilOrTeacherDropdown>', '<LoginOptionsDropdown>'],
		},
		icon: {
			component: ({ name }: { name: string }) => <Icon name={name as IconName} />,
			componentProps: {
				add: { name: IconName.plus },
				angleDown: { name: IconName.caretDown },
				angleLeft: { name: IconName.chevronLeft },
				angleRight: { name: IconName.chevronRight },
				angleUp: { name: IconName.caretUp },
				anglesLeft: { name: IconName.chevronsLeft },
				anglesRight: { name: IconName.chevronsRight },
				arrowDown: { name: IconName.arrowDown },
				arrowRight: { name: IconName.arrowRight },
				arrowUp: { name: IconName.arrowUp },
				audio: { name: IconName.headphone },
				calendar: { name: IconName.calendar },
				check: { name: IconName.check },
				chevronLeft: { name: IconName.chevronLeft },
				clock: { name: IconName.clock },
				copy: { name: IconName.copy },
				delete: { name: IconName.delete },
				edit: { name: IconName.edit },
				export: { name: IconName.download },
				extraOptions: { name: IconName.moreHorizontal },
				eyeOff: { name: IconName.eyeOff },
				filter: { name: IconName.search },
				info: { name: IconName.info },
				sortTable: { name: IconName.chevronsUpAndDown },
				video: { name: IconName.video },
				view: { name: IconName.eye },
				warning: { name: IconName.alertTriangle },
				newspaper: { name: IconName.fileText },
				noAudio: { name: IconName.bellOff },
				noVideo: { name: IconName.videoOff },
			},
			list: GET_ADMIN_ICON_OPTIONS,
			alerts: ALERT_ICON_LIST_CONFIG,
		},
		components: {
			loader: {
				component: () => <Spinner size="large" />,
			},
			defaultAudioStill: DEFAULT_AUDIO_STILL,
			enableMultiLanguage: false,
			buttonTypes: () => [
				{
					label: tText('admin/content-block/content-block___primair'),
					value: 'primary',
				},
				{
					label: tText('admin/content-block/content-block___secundair'),
					value: 'secondary',
				},
				{
					label: tText('admin/content-block/content-block___secundair-invers'),
					value: 'secondary-i',
				},
				{
					label: tText('admin/content-block/content-block___tertiair'),
					value: 'tertiary',
				},
				{
					label: tText('admin/content-block/content-block___randloos'),
					value: 'borderless',
				},
				{
					label: tText('admin/content-block/content-block___randloos-invers'),
					value: 'borderless-i',
				},
				{
					label: tText('admin/content-block/content-block___gevaar'),
					value: 'danger',
				},
				{
					label: tText('admin/content-block/content-block___gevaar-hover'),
					value: 'danger-hover',
				},
				{
					label: tText('admin/content-block/content-block___link'),
					value: 'link',
				},
				{
					label: tText('admin/content-block/content-block___link-inline'),
					value: 'inline-link',
				},
				{
					label: tText('admin/content-block/content-block___leerling-primair-geel'),
					value: 'pupil-primary',
				},
				{
					label: tText('admin/content-block/content-block___leerling-link-tekst-in-geel'),
					value: 'pupil-link',
				},
				{
					label: tText('admin/content-block/content-block___leerling-link-geel-inline'),
					value: 'pupil-inline-link',
				},
			],
			flowplayer: FlowPlayerWrapper as FC<FlowPlayerWrapperProps>,
		},
		content_blocks: {
			SEARCH: BlockSearch,
			MEDIA_GRID: MediaGridWrapper,
		},
		services: {
			toastService: {
				showToast: (toastInfo: ToastInfo): string => {
					return ToastService.showToast(
						<div
							role="dialog"
							aria-labelledby="toastTitle"
							aria-describedby="toastDescription"
						>
							<b aria-describedby="toastDescription" id="toastTitle">
								{toastInfo.title}
							</b>
							<p id="toastDescription">{toastInfo.description}</p>
						</div>,
						{},
						ToastTypeToAvoToastType[toastInfo.type]
					) as string;
				},
				hideToast: (toastId: string) => {
					ToastService.hideToast(toastId);
				},
			},
			// Use the avo2-proxy to fetch content pages, so their media tile blocks are resolved
			// https://app.diagrams.net/#G1WCrp76U14pGpajEplYlSVGiuWfEQpRqI
			getContentPageByLanguageAndPathEndpoint: `${proxyUrl}/content-pages`,
			i18n: { tHtml, tText },
			educationOrganisationService: {
				fetchEducationOrganisationName:
					EducationOrganisationService.fetchEducationOrganisationName,
				fetchCities: EducationOrganisationService.fetchCities,
				fetchEducationOrganisations:
					EducationOrganisationService.fetchEducationOrganisations,
			},
			router: {
				Link: InternalLink as FC<LinkInfo>,
				useHistory: () => ({
					// TODO replace useHistory with single navigate function
					push: (url: string) => navigateFunc(url),
					replace: (url: string) => navigateFunc(url, { replace: true }),
				}),
			},
			queryCache: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				clear: async (_key: string) => Promise.resolve(),
			},
		},
		database: {
			proxyUrl,
		},
		flowplayer: {
			FLOW_PLAYER_ID: getEnv('FLOW_PLAYER_ID') || '',
			FLOW_PLAYER_TOKEN: getEnv('FLOW_PLAYER_TOKEN') || '',
		},
		handlers: {
			onExternalLink: noop,
		},
		routes: {
			ADMIN_ALERTS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
			ADMIN_ASSIGNMENTS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.assignments}`,
			ADMIN_ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.pupilCollections}`,
			ADMIN_BUNDLES_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}`,
			ADMIN_COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
			ADMIN_CONTENT_PAGE_CREATE: ADMIN_PATH.CONTENT_PAGE_CREATE,
			ADMIN_CONTENT_PAGE_DETAIL: ADMIN_PATH.CONTENT_PAGE_DETAIL,
			ADMIN_CONTENT_PAGE_EDIT: ADMIN_PATH.CONTENT_PAGE_EDIT,
			ADMIN_CONTENT_PAGE_LABEL_CREATE: ADMIN_PATH.CONTENT_PAGE_LABEL_CREATE,
			ADMIN_CONTENT_PAGE_LABEL_DETAIL: ADMIN_PATH.CONTENT_PAGE_LABEL_DETAIL,
			ADMIN_CONTENT_PAGE_LABEL_EDIT: ADMIN_PATH.CONTENT_PAGE_LABEL_EDIT,
			ADMIN_CONTENT_PAGE_LABEL_OVERVIEW: ADMIN_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
			ADMIN_CONTENT_PAGE_OVERVIEW: ADMIN_PATH.CONTENT_PAGE_OVERVIEW,
			ADMIN_NAVIGATION_CREATE: ADMIN_PATH.NAVIGATIONS_CREATE,
			ADMIN_NAVIGATION_DETAIL: ADMIN_PATH.NAVIGATIONS_DETAIL,
			ADMIN_NAVIGATION_ITEM_CREATE: ADMIN_PATH.NAVIGATIONS_ITEM_CREATE,
			ADMIN_NAVIGATION_ITEM_EDIT: ADMIN_PATH.NAVIGATIONS_ITEM_EDIT,
			ADMIN_NAVIGATION_OVERVIEW: ADMIN_PATH.NAVIGATIONS_OVERVIEW,
			ADMIN_TRANSLATIONS_OVERVIEW: ADMIN_PATH.TRANSLATIONS,
			ADMIN_USER_DETAIL: ADMIN_PATH.USER_DETAIL,
			ADMIN_USER_EDIT: ADMIN_PATH.USER_EDIT,
			ADMIN_USER_GROUP_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/${ROUTE_PARTS.create}`,
			ADMIN_USER_GROUP_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id`,
			ADMIN_USER_GROUP_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id/${ROUTE_PARTS.edit}`,
			ADMIN_USER_GROUP_OVERVIEW: ADMIN_PATH.USER_GROUP_OVERVIEW,
			ADMIN_USER_OVERVIEW: ADMIN_PATH.USER_OVERVIEW,
			ASSIGNMENT_DETAIL: APP_PATH.ASSIGNMENT_DETAIL.route,
			BUNDLE_DETAIL: APP_PATH.BUNDLE_DETAIL.route,
			BUNDLE_EDIT: APP_PATH.BUNDLE_EDIT.route,
			COLLECTION_DETAIL: APP_PATH.COLLECTION_DETAIL.route,
			ITEM_DETAIL: APP_PATH.ITEM_DETAIL.route,
			NEWS: `/${ROUTE_PARTS.news}`,
			SEARCH: APP_PATH.SEARCH.route,
		},
		users: {
			bulkActions: [
				UserBulkAction.BLOCK,
				UserBulkAction.UNBLOCK,
				UserBulkAction.DELETE,
				UserBulkAction.CHANGE_SUBJECTS,
				UserBulkAction.EXPORT_SELECTION,
				UserBulkAction.EXPORT_ALL,
			],
			getCommonUser: (): Avo.User.CommonUser | null => {
				return store.get(commonUserAtom);
			},
		},
		locale: Locale.Nl as any,
		env: {
			CLIENT_URL: window.location.origin,
			LDAP_DASHBOARD_PEOPLE_URL: getEnv('LDAP_DASHBOARD_PEOPLE_URL'),
			DATABASE_APPLICATION_TYPE: DatabaseType.avo,
		},
	};
}
