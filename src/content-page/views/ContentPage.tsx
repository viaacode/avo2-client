import { get, intersection } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { ContentBlockConfig } from '../../admin/content-block/content-block.types';
import { parseContentBlocks } from '../../admin/content-block/helpers';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { ErrorActionButton } from '../../error/views/ErrorView';
import { DataQueryComponent } from '../../shared/components';

import { ErrorView } from '../../error/views';
import { GET_CONTENT_PAGE_BY_PATH } from '../content-page.gql';
import './ContentPage.scss';

interface ErrorInfo {
	message?: string;
	icon?: IconName;
	actionButtons?: ErrorActionButton[];
}

interface ContentPageDetailProps extends DefaultSecureRouteProps<{ path: string }> {}

const ContentPage: FunctionComponent<ContentPageDetailProps> = ({ match, user }) => {
	const [t] = useTranslation();

	const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

	const getCurrentPath = useCallback(() => `/${match.params.path}`, [match]);

	// State
	const [path, setPath] = useState<string>(getCurrentPath());

	useEffect(() => {
		if (path !== getCurrentPath()) {
			setPath(getCurrentPath());
		}
	}, [getCurrentPath, path]);

	const renderContentPage = (contentPage: Avo.Content.Content) => {
		const pageUserGroups: number[] = (contentPage as any).user_group_ids || []; // TODO remove cast to any when typings v2.10.0 is released
		const userUserGroups: number[] = [...get(user, 'profile.userGroupIds', []), user ? -2 : -1]; // Ingelogde gebruiker en niet ingelogde gebruiker
		if (!intersection(pageUserGroups, userUserGroups).length) {
			// User isn't allowed to see this page (this will in the future also be checked by the graphql instance
			setErrorInfo({
				message: t(
					'content-page/views/content-page___deze-pagina-is-niet-gevonden-of-u-hebt-geen-rechten-om-hem-te-bekijken'
				),
				icon: 'search',
				actionButtons: ['home', 'helpdesk'],
			});
		}
		const contentBlockConfig: ContentBlockConfig[] = parseContentBlocks(
			contentPage.contentBlockssBycontentId
		);
		return contentBlockConfig.map((contentBlockConfig: ContentBlockConfig, index) => (
			<ContentBlockPreview
				key={contentPage.contentBlockssBycontentId[index].id}
				componentState={contentBlockConfig.components.state}
				contentWidth={(contentPage as any).content_width} // TODO: remove any with typings update
				blockState={contentBlockConfig.block.state}
			/>
		));
	};

	return errorInfo ? (
		<ErrorView
			message={errorInfo.message}
			icon={errorInfo.icon}
			actionButtons={errorInfo.actionButtons}
		/>
	) : (
		<DataQueryComponent
			query={GET_CONTENT_PAGE_BY_PATH}
			variables={{ path }}
			resultPath="app_content[0]"
			renderData={renderContentPage}
			notFoundMessage={t(
				'content-page/views/content-page___deze-pagina-is-niet-gevonden-of-u-hebt-geen-rechten-om-hem-te-bekijken'
			)}
			actionButtons={['home', 'helpdesk']}
		/>
	);
};

export default withRouter(ContentPage);
