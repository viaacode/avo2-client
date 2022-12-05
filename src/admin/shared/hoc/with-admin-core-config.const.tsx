import {
	AdminConfig,
	AvoOrHetArchief,
	CommonUser,
	ContentBlockType,
	LinkInfo,
	ToastInfo,
} from '@meemoo/admin-core-ui';
import { Icon, IconName, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { compact, noop } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import { toAbsoluteUrl } from '../../../authentication/helpers/redirects';
import { APP_PATH, RouteId } from '../../../constants';
import { FlowPlayerWrapper } from '../../../shared/components';
import { getEnv } from '../../../shared/helpers';
import { tHtml, tText } from '../../../shared/helpers/translate';
import { AssetsService } from '../../../shared/services/assets-service/assets.service';
import { SmartschoolAnalyticsService } from '../../../shared/services/smartschool-analytics-service';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_CORE_ROUTE_PARTS } from '../constants/admin-core.routes';
import { PermissionsService } from '../services/permissions';

export function getAdminCoreConfig(user?: Avo.User.User): AdminConfig {
	const InternalLink = (linkInfo: LinkInfo) => {
		return <Link {...linkInfo} to={() => linkInfo.to || ''} />;
	};

	const commonUser: CommonUser = {
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
		fullName: user?.full_name || undefined,
		last_access_at: user?.last_access_at || undefined, // TODO enable once last_access_at field is added to the database
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		permissions: user?.profile?.permissions as any[],
	};

	return {
		// navigation: {
		// 	service: navigationService,
		// 	views: {
		// 		overview: {
		// 			labels: { tableHeads: {} },
		// 		},
		// 	},
		// },
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
			availableContentBlocks: ContentBlockType,
			defaultPageWidth: 'LARGE',
			onSaveContentPage: () => new Promise(noop),
		},
		navigationBars: { enableIcons: false },
		icon: {
			component: ({ name }: { name: string }) => <Icon name={name as IconName} />,
			componentProps: {
				add: { name: 'plus' },
				view: { name: 'eye' },
				angleDown: { name: 'caret-down' },
				angleUp: { name: 'caret-up' },
				angleLeft: { name: 'caret-left' },
				angleRight: { name: 'caret-right' },
				delete: { name: 'delete' },
				edit: { name: 'edit' },
				filter: { name: 'search' },
				arrowUp: { name: 'arrow-up' },
				sortTable: { name: 'chevrons-up-and-down' },
				arrowDown: { name: 'arrow-down' },
			},
			list: [],
		},
		components: {
			loader: {
				component: () => <Spinner size="large" />,
			},
			table: {
				sortingIcons: {
					asc: <Icon className="c-sorting-icon" name="chevron-up" />,
					default: <Icon className="c-sorting-icon" name="chevrons-up-and-down" />,
					desc: <Icon className="c-sorting-icon" name="chevron-down" />,
				},
			},
			buttonTypes: () => [
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___zilver'),
					value: 'content-page-button--silver',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___blauw-groen'),
					value: 'content-page-button--teal',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___wit'),
					value: 'content-page-button--white',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___zwart'),
					value: 'content-page-button--black',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___outline'),
					value: 'content-page-button--outline',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___tekst'),
					value: 'content-page-button--text',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___rood'),
					value: 'content-page-button--red',
				},
				{
					label: tText('modules/admin/wrappers/with-admin-core-config___link'),
					value: 'content-page-button--link',
				},
			],
			flowplayer: FlowPlayerWrapper,
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
						toastInfo.type as any
					);
				},
			},
			i18n: { tHtml, tText },
			educationOrganisationService: {
				fetchEducationOrganisationName: () => Promise.resolve(null),
				fetchCities: () => Promise.resolve([]),
				fetchEducationOrganisations: () => Promise.resolve([]),
			},
			router: {
				Link: InternalLink as FunctionComponent<LinkInfo>,
				useHistory: useHistory,
				useParams: useParams,
			},
			queryCache: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				clear: async (_key: string) => Promise.resolve(),
			},
			// UserGroupsService,
			PermissionsService,
			assetService: AssetsService,
		},
		database: {
			databaseApplicationType: AvoOrHetArchief.avo,
			proxyUrl: getEnv('PROXY_URL') || '',
		},
		flowplayer: {
			FLOW_PLAYER_ID: getEnv('FLOW_PLAYER_ID') || '',
			FLOW_PLAYER_TOKEN: getEnv('FLOW_PLAYER_TOKEN') || '',
		},
		handlers: {
			onExternalLink: (url: string) => {
				SmartschoolAnalyticsService.triggerUrlEvent(toAbsoluteUrl(url));
			},
		},
		user: commonUser,
		route_parts: Object.freeze(ADMIN_CORE_ROUTE_PARTS),
	};
}
