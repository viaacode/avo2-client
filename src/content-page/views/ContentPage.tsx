import { get, intersection } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Avo } from '@viaa/avo2-types';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { parseContentBlocks } from '../../admin/content-block/helpers';
import { SpecialPermissionGroups } from '../../admin/menu/views/MenuEdit';
import { ContentBlockConfig } from '../../admin/shared/types';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { ErrorView } from '../../error/views';
import { CustomError } from '../../shared/helpers';

import './ContentPage.scss';

interface ContentPageDetailProps extends DefaultSecureRouteProps {
	contentPage: Avo.Content.Content;
}

const ContentPage: FunctionComponent<ContentPageDetailProps> = ({ contentPage, user }) => {
	const [t] = useTranslation();

	const pageUserGroups: number[] = contentPage.user_group_ids || [];
	const userUserGroups: number[] = [
		...get(user, 'profile.userGroupIds', []),
		user ? SpecialPermissionGroups.loggedInUsers : SpecialPermissionGroups.loggedOutUsers,
	];
	if (!intersection(pageUserGroups, userUserGroups).length) {
		// User isn't allowed to see this page (this will in the future also be checked by the graphql instance
		console.error(
			new CustomError('Permissions for content page are not met', null, {
				pageUserGroups,
				userUserGroups,
			})
		);
		return (
			<ErrorView
				message={t('error/views/error-view___de-pagina-werd-niet-gevonden')}
				icon="search"
				actionButtons={['home', 'helpdesk']}
			/>
		);
	}
	const contentBlockConfig: ContentBlockConfig[] = parseContentBlocks(
		contentPage.contentBlockssBycontentId
	);
	return (
		<>
			{contentBlockConfig.map((contentBlockConfig: ContentBlockConfig, index) => (
				<ContentBlockPreview
					key={contentPage.contentBlockssBycontentId[index].id}
					componentState={contentBlockConfig.components.state}
					contentWidth={contentPage.content_width}
					blockState={contentBlockConfig.block.state}
				/>
			))}
		</>
	);
};

export default ContentPage;
