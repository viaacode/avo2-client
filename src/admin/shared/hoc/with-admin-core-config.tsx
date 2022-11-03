import {
	AdminConfig,
	AdminConfigManager,
	AvoOrHetArchief,
	CommonUser,
	ContentBlockType,
	LinkInfo,
	ToastInfo,
} from '@meemoo/admin-core-ui';
import { Icon, IconName, IconProps, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { compact, noop } from 'lodash-es';
import React, { ComponentType, FunctionComponent, useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { Link, useHistory, useParams } from 'react-router-dom';
import { compose } from 'redux';

import { toAbsoluteUrl } from '../../../authentication/helpers/redirects';
import { APP_PATH, RouteId } from '../../../constants';
import { getEnv } from '../../../shared/helpers';
import { tHtml } from '../../../shared/helpers/translate';
import withUser from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/use-translation/use-translation';
import { AssetsService } from '../../../shared/services/assets-service/assets.service';
import { SmartschoolAnalyticsService } from '../../../shared/services/smartschool-analytics-service';
import { ToastService } from '../../../shared/services/toast-service';
import { navigationService } from '../../navigation/services/navigation-service';
import { PermissionsService } from '../services/permissions';
import { UserGroupsService } from '../services/user-groups';

const InternalLink = (linkInfo: LinkInfo) => {
	return <Link {...linkInfo} />;
};

export const withAdminCoreConfig = (WrappedComponent: ComponentType): ComponentType => {
	const Component = (props: Record<string, unknown>) => {
		const [adminCoreConfig, setAdminCoreConfig] = useState<AdminConfig | null>(null);
		const user = props.user as Avo.User.User | undefined;
		const { tText } = useTranslation();

		const initConfigValue = useCallback(() => {
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

			const config: AdminConfig = {
				navigation: {
					service: navigationService,
					views: {
						overview: {
							labels: { tableHeads: {} },
						},
					},
				},
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
					availableContentBlocks: [
						ContentBlockType.Heading,
						ContentBlockType.Intro,
						ContentBlockType.RichText,
						ContentBlockType.RichTextTwoColumns,
						ContentBlockType.Buttons,
						ContentBlockType.Image,
						ContentBlockType.ImageGrid,
						ContentBlockType.PageOverview,
						ContentBlockType.UspGrid,
						ContentBlockType.Quote,
					],
					defaultPageWidth: 'LARGE',
					onSaveContentPage: noop,
				},
				navigationBars: { enableIcons: false },
				icon: {
					component: ({ name }: { name: IconName }) => <Icon name={name} />,
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
					} as Record<string, IconProps>,
					list: [],
				},
				components: {
					loader: {
						component: () => <Spinner size="large" />,
					},
					table: {
						sortingIcons: {
							asc: <Icon className="c-sorting-icon" name="chevron-up" />,
							default: (
								<Icon className="c-sorting-icon" name="chevrons-up-and-down" />
							),
							desc: <Icon className="c-sorting-icon" name="chevron-down" />,
						},
					},
					buttonTypes: () => [
						{
							label: tText('modules/admin/wrappers/with-admin-core-config___zilver'),
							value: 'content-page-button--silver',
						},
						{
							label: tText(
								'modules/admin/wrappers/with-admin-core-config___blauw-groen'
							),
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
				},
				services: {
					toastService: {
						showToast: (toastInfo: ToastInfo) => {
							toastInfo.type;
							ToastService.showToast(
								{
									title: toastInfo.title,
									description: toastInfo.description,
								},
								{},
								toastInfo.type
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
					UserGroupsService,
					PermissionsService,
					assetService: AssetsService,
				},
				database: {
					databaseApplicationType: AvoOrHetArchief.hetArchief,
					proxyUrl: getEnv('PROXY_URL'),
				},
				flowplayer: {
					FLOW_PLAYER_ID: getEnv('FLOW_PLAYER_ID'),
					FLOW_PLAYER_TOKEN: getEnv('FLOW_PLAYER_TOKEN'),
				},
				handlers: {
					onExternalLink: (url: string, label: string) => {
						SmartschoolAnalyticsService.triggerUrlEvent(toAbsoluteUrl(url), label);
					},
				},
				user: commonUser,
			};
			AdminConfigManager.setConfig(config);
			setAdminCoreConfig(config);
		}, []);

		useEffect(() => {
			initConfigValue();
		}, [initConfigValue]);

		if (!adminCoreConfig) {
			return <Spinner size="large" />;
		}

		return <WrappedComponent {...props} />;
	};

	return compose(withRouter, withUser)(Component) as ComponentType;
};
