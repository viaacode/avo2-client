import { AdminConfig, ContentBlockType, LinkInfo, ToastInfo } from '@meemoo/admin-core-ui';
import { Icon, IconName, Spinner } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { DatabaseType } from '@viaa/avo2-types';
import { compact, noop } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { APP_PATH, RouteId } from '../../../constants';
import BlockSearch from '../../../search/components/BlockSearch';
import MediaGridWrapper from '../../../search/components/MediaGridWrapper/MediaGridWrapper';
import { FlowPlayerWrapper } from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { getEnv } from '../../../shared/helpers';
import { tHtml, tText } from '../../../shared/helpers/translate';
import { EducationOrganisationService } from '../../../shared/services/education-organizations-service';
import { FileUploadService } from '../../../shared/services/file-upload-service';
import { ToastService, ToastTypeToAvoToastType } from '../../../shared/services/toast-service';
import { GET_ADMIN_ICON_OPTIONS } from '../constants';

export function getAdminCoreConfig(user?: Avo.User.User): AdminConfig {
	const InternalLink = (linkInfo: LinkInfo) => {
		return <Link {...linkInfo} to={() => linkInfo.to || ''} />;
	};

	const commonUser: any = {
		uid: user?.uid,
		profileId: user?.profile?.id as string,
		userId: user?.uid,
		// idp: user?.idp,
		email: user?.mail,
		acceptedTosAt: '1970-01-01', // TODO see where this is stored in avo
		userGroup: {
			name: String(user?.profile?.userGroupIds[0]), // TODO figure out a label in a synchronous way
			id: user?.profile?.userGroupIds[0],
		},
		firstName: user?.first_name || undefined,
		lastName: user?.last_name || undefined,
		fullName:
			user?.full_name || [user?.first_name, user?.last_name].join(' ').trim() || undefined,
		lastAccessAt: user?.last_access_at || undefined, // TODO enable once last_access_at field is added to the database
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		permissions: user?.profile?.permissions as any[],
		tempAccess: null,
	};

	const proxyUrl = getEnv('PROXY_URL') as string;

	return {
		staticPages: compact(
			(Object.keys(APP_PATH) as RouteId[]).map((routeId) => {
				if (APP_PATH[routeId].showInContentPicker) {
					return APP_PATH[routeId].route;
				} else {
					return null;
				}
			})
		),
		contentPage: {
			availableContentBlocks: Object.values(ContentBlockType),
			defaultPageWidth: 'EXTRA_LARGE',
			onSaveContentPage: () => new Promise(noop),
		},
		navigationBars: { enableIcons: false },
		icon: {
			component: ({ name }: { name: string }) => <Icon name={name as IconName} />,
			componentProps: {
				add: { name: IconName.plus },
				view: { name: IconName.eye },
				angleDown: { name: IconName.caretDown },
				angleUp: { name: IconName.caretUp },
				angleLeft: { name: IconName.caretLeft },
				angleRight: { name: IconName.caretRight },
				delete: { name: IconName.delete },
				edit: { name: IconName.edit },
				filter: { name: IconName.search },
				arrowUp: { name: IconName.arrowUp },
				sortTable: { name: IconName.chevronsUpAndDown },
				arrowDown: { name: IconName.arrowDown },
				chevronLeft: { name: IconName.chevronLeft },
				extraOptions: { name: IconName.moreHorizontal },
				copy: { name: IconName.copy },
			},
			list: GET_ADMIN_ICON_OPTIONS,
		},
		components: {
			loader: {
				component: () => <Spinner size="large" />,
			},
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
			flowplayer: FlowPlayerWrapper,
		},
		content_blocks: {
			SEARCH: BlockSearch,
			MEDIA_GRID: MediaGridWrapper,
		},
		services: {
			toastService: {
				showToast: (toastInfo: ToastInfo) => {
					ToastService.showToast(
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
					);
				},
			},
			// Use the avo2-proxy to fetch content pages, so their media tile blocks are resolved
			// https://app.diagrams.net/#G1WCrp76U14pGpajEplYlSVGiuWfEQpRqI
			getContentPageByPathEndpoint: `${proxyUrl}/content-pages`,
			i18n: { tHtml, tText },
			educationOrganisationService: {
				fetchEducationOrganisationName:
					EducationOrganisationService.fetchEducationOrganisationName,
				fetchCities: EducationOrganisationService.fetchCities,
				fetchEducationOrganisations:
					EducationOrganisationService.fetchEducationOrganisations,
			},
			router: {
				Link: InternalLink as FunctionComponent<LinkInfo>,
				useHistory: useHistory,
			},
			queryCache: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				clear: async (_key: string) => Promise.resolve(),
			},
			assetService: FileUploadService,
		},
		database: {
			databaseApplicationType: DatabaseType.avo,
			proxyUrl,
		},
		flowplayer: {
			FLOW_PLAYER_ID: getEnv('FLOW_PLAYER_ID') || '',
			FLOW_PLAYER_TOKEN: getEnv('FLOW_PLAYER_TOKEN') || '',
		},
		handlers: {
			onExternalLink: noop,
		},
		user: commonUser,
		routes: {
			BUNDLE_DETAIL: `/${ROUTE_PARTS.bundles}/:id`,
			BUNDLE_EDIT: `/${ROUTE_PARTS.bundles}/:id/${ROUTE_PARTS.edit}`,
			COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
			COLLECTION_DETAIL: `/${ROUTE_PARTS.collections}/:id`,
			CONTENT_PAGE_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/${ROUTE_PARTS.create}`,
			CONTENT_PAGE_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id`,
			CONTENT_PAGE_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id/${ROUTE_PARTS.edit}`,
			CONTENT_PAGE_LABEL_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}/${ROUTE_PARTS.create}`,
			CONTENT_PAGE_LABEL_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}/:id`,
			CONTENT_PAGE_LABEL_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}/:id/${ROUTE_PARTS.edit}`,
			CONTENT_PAGE_LABEL_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}`,
			CONTENT_PAGE_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
			ITEM_DETAIL: `/${ROUTE_PARTS.item}/:id`,
			NAVIGATION_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/${ROUTE_PARTS.create}`,
			NAVIGATION_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/:navigationBarId`,
			NAVIGATION_ITEM_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/:navigationBarId/${ROUTE_PARTS.create}`,
			NAVIGATION_ITEM_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/:navigationBarId/:navigationItemId/${ROUTE_PARTS.edit}`,
			NAVIGATION_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}`,
			NEWS: `/${ROUTE_PARTS.news}`,
			TRANSLATIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.translations}`,
			USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.users}/:id`,
			USER_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.users}/:id/${ROUTE_PARTS.edit}`,
			USER_GROUP_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/${ROUTE_PARTS.create}`,
			USER_GROUP_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id`,
			USER_GROUP_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id/${ROUTE_PARTS.edit}`,
			USER_GROUP_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}`,
			USER_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.users}`,
			SEARCH: `/${ROUTE_PARTS.search}`,
		},
		users: {
			bulkActions: ['block', 'unblock', 'delete', 'change_subjects', 'export'],
		},
		env: {
			LDAP_DASHBOARD_PEOPLE_URL: getEnv('LDAP_DASHBOARD_PEOPLE_URL'),
		},
	};
}
