import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

import { Avo } from '@viaa/avo2-types';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { DataQueryComponent } from '../../shared/components';
import { GET_CONTENT_PAGE_BY_PATH } from '../content-page.gql';

import { ContentBlockConfig } from '../../admin/content-block/content-block.types';
import { parseContentBlocks } from '../../admin/content-block/helpers';
import './ContentPage.scss';

interface ContentPageDetailProps extends DefaultSecureRouteProps<{ path: string }> {}

const ContentPage: FunctionComponent<ContentPageDetailProps> = ({ match }) => {
	const [t] = useTranslation();

	const getCurrentPath = useCallback(() => `/${match.params.path}`, [match]);

	// State
	const [path, setPath] = useState<string>(getCurrentPath());

	useEffect(() => {
		if (path !== getCurrentPath()) {
			setPath(getCurrentPath());
		}
	}, [getCurrentPath, path]);

	const renderContentPage = (contentPage: Avo.Content.Content) => {
		const contentBlockConfig: ContentBlockConfig[] = parseContentBlocks(
			contentPage.contentBlockssBycontentId
		);
		return contentBlockConfig.map((contentBlockConfig: ContentBlockConfig, index) => (
			<ContentBlockPreview
				key={contentPage.contentBlockssBycontentId[index].id}
				componentState={contentBlockConfig.components.state}
				blockState={contentBlockConfig.block.state}
			/>
		));
	};

	return (
		<DataQueryComponent
			query={GET_CONTENT_PAGE_BY_PATH}
			variables={{ path }} //  userGroupIds: get(user, 'profile.userGroupIds')
			resultPath="app_content[0]"
			renderData={renderContentPage}
			notFoundMessage={t(
				'content-page/views/content-page___deze-pagina-is-niet-gevonden-of-u-hebt-geen-rechten-om-hem-te-bekijken'
			)}
		/>
	);
};

export default withRouter(ContentPage);
