import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Avatar,
	Button,
	Container,
	Header,
	HeaderAvatar,
	HeaderButtons,
	Heading,
	Navbar,
	Spacer,
	Table,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { DataQueryComponent } from '../../../shared/components';
import { formatDate, getAvatarProps, navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { ContentBlockPreview } from '../../content-block/components';
import { parseContentBlocks } from '../../content-block/content-block.services';
import { useContentBlocksByContentId } from '../../content-block/hooks';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { CONTENT_DETAIL_TABS, CONTENT_PATH, CONTENT_RESULT_PATH } from '../content.const';
import { GET_CONTENT_BY_ID } from '../content.gql';
import { ContentParams } from '../content.types';

interface ContentDetailProps extends DefaultSecureRouteProps<ContentParams> {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history, match }) => {
	const { id } = match.params;

	// Hooks
	const [content, setContent] = useState<Avo.Content.Content | null>(null);
	const [currentTab, setCurrentTab, tabs] = useTabs(CONTENT_DETAIL_TABS, 'inhoud');

	const [t] = useTranslation();

	const [contentBlocks] = useContentBlocksByContentId(id);

	// Computed
	const avatarProps = getAvatarProps(get(content, 'profile', null));
	const contentBlockConfigs = parseContentBlocks(contentBlocks);
	const pageTitle = `Content: ${get(content, 'title', '')}`;

	// Render
	const renderFormattedDate = (date: string | null | undefined) =>
		!!date ? formatDate(date) : '-';

	const renderContentDetail = (data: Avo.Content.Content[]) => {
		const contentItem: Avo.Content.Content = get(data, '[0]');

		if (contentItem) {
			setContent(contentItem);
		}

		// TODO: Move tab contents to separate views
		switch (currentTab) {
			case 'inhoud':
				return contentBlockConfigs.map((contentBlockConfig, index) => (
					<ContentBlockPreview
						key={contentBlocks[index].id}
						componentState={contentBlockConfig.components.state}
						blockState={contentBlockConfig.block.state}
					/>
				));
			case 'metadata':
				return (
					<Container mode="vertical" size="small">
						<Container mode="horizontal">
							{!!contentItem.description && (
								<Spacer margin="bottom-large">
									<Heading type="h4">
										<Trans i18nKey="admin/content/views/content-detail___omschrijving">
											Omschrijving:
										</Trans>
									</Heading>
									<p>{contentItem.description}</p>
								</Spacer>
							)}

							<Heading type="h4">
								<Trans i18nKey="admin/content/views/content-detail___metadata">Metadata:</Trans>
							</Heading>
							<Table horizontal variant="invisible">
								<tbody>
									<tr>
										<th>
											<Trans i18nKey="admin/content/views/content-detail___content-type">
												Content type:
											</Trans>
										</th>
										<td>{contentItem.content_type}</td>
									</tr>
									<tr>
										<th>
											<Trans i18nKey="admin/content/views/content-detail___aangemaakt">
												Aangemaakt:
											</Trans>
										</th>
										<td>{renderFormattedDate(contentItem.created_at)}</td>
									</tr>
									<tr>
										<th>
											<Trans i18nKey="admin/content/views/content-detail___laatst-bewerkt">
												Laatst bewerkt:
											</Trans>
										</th>
										<td>{renderFormattedDate(contentItem.updated_at)}</td>
									</tr>
									<tr>
										<th>
											<Trans i18nKey="admin/content/views/content-detail___gepubliceerd">
												Gepubliceerd:
											</Trans>
										</th>
										<td>{renderFormattedDate(contentItem.publish_at)}</td>
									</tr>
									<tr>
										<th>
											<Trans i18nKey="admin/content/views/content-detail___gedepubliceerd">
												Gedepubliceerd:
											</Trans>
										</th>
										<td>{renderFormattedDate(contentItem.depublish_at)}</td>
									</tr>
								</tbody>
							</Table>
						</Container>
					</Container>
				);

			default:
				return null;
		}
	};

	return (
		<AdminLayout navigateBack={() => history.push(CONTENT_PATH.CONTENT)}>
			<AdminLayoutHeader>
				<Header category="audio" title={pageTitle} showMetaData={false}>
					{(avatarProps.name || avatarProps.initials) && (
						<HeaderAvatar>
							<Avatar {...avatarProps} />
						</HeaderAvatar>
					)}
					<HeaderButtons>
						<Button
							label={t('admin/content/views/content-detail___bewerken')}
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
						/>
					</HeaderButtons>
				</Header>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={setCurrentTab} />
					</Container>
				</Navbar>
			</AdminLayoutHeader>
			<AdminLayoutBody>
				<DataQueryComponent
					query={GET_CONTENT_BY_ID}
					renderData={renderContentDetail}
					resultPath={CONTENT_RESULT_PATH.GET}
					variables={{ id }}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentDetail;
