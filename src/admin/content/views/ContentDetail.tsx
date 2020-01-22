import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Avatar,
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Header,
	HeaderAvatar,
	HeaderButtons,
	Navbar,
	Spacer,
	Table,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import { formatDate, getAvatarProps, navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';
import { ContentBlockPreview } from '../../content-block/components';
import { parseContentBlocks } from '../../content-block/helpers';
import { useContentBlocksByContentId } from '../../content-block/hooks';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { CONTENT_DETAIL_TABS, CONTENT_PATH, CONTENT_RESULT_PATH } from '../content.const';
import { DELETE_CONTENT, GET_CONTENT_BY_ID } from '../content.gql';
import { ContentDetailParams } from '../content.types';

interface ContentDetailProps extends DefaultSecureRouteProps<ContentDetailParams> {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history, match, user }) => {
	const { id } = match.params;

	// Hooks
	const [content, setContent] = useState<Avo.Content.Content | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	const [contentBlocks] = useContentBlocksByContentId(id);
	const [currentTab, setCurrentTab, tabs] = useTabs(CONTENT_DETAIL_TABS, CONTENT_DETAIL_TABS[0].id);

	// Computed
	const avatarProps = getAvatarProps(get(content, 'profile', null));
	const contentBlockConfigs = parseContentBlocks(contentBlocks);
	const isAdminUser = get(user, 'role.name', null) === 'admin';
	const isContentProtected = get(content, 'is_protected', false);
	const pageTitle = `Content: ${get(content, 'title', '')}`;

	// Methods
	const handleDelete = () => {
		triggerContentDelete({
			variables: { id },
			update: ApolloCacheManager.clearContentCache,
		})
			.then(() => {
				history.push(CONTENT_PATH.CONTENT);
				toastService.success(
					t('admin/content/views/content-detail___het-content-item-is-succesvol-verwijderd'),
					false
				);
			})
			.catch(err => {
				console.error(err);
				toastService.danger(
					t('admin/content/views/content-detail___het-verwijderen-van-het-content-item-is-mislukt'),
					false
				);
			});
	};

	// Render
	const renderFormattedDate = (date: string | null | undefined) =>
		!!date ? formatDate(date) : '-';

	const renderContentDetail = (contentItem: Avo.Content.Content) => {
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
						contentWidth={/* content.content_width */ 'default'} // TODO: add once available
						blockState={contentBlockConfig.block.state}
					/>
				));
			case 'metadata':
				return (
					<Container mode="vertical" size="small">
						<Container mode="horizontal">
							{!!contentItem.description && (
								<Spacer margin="bottom-large">
									<BlockHeading type="h4">
										<Trans i18nKey="admin/content/views/content-detail___omschrijving">
											Omschrijving:
										</Trans>
									</BlockHeading>
									<p>{contentItem.description}</p>
								</Spacer>
							)}

							<BlockHeading type="h4">
								<Trans i18nKey="admin/content/views/content-detail___metadata">Metadata:</Trans>
							</BlockHeading>
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
											<Trans i18nKey="admin/content/views/content-detail___beschermde-pagina">
												Beschermde pagina:
											</Trans>
										</th>
										<td>
											{contentItem.is_protected
												? t('admin/content/views/content-detail___ja')
												: t('admin/content/views/content-detail___nee')}
										</td>
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
							<Avatar {...avatarProps} dark />
						</HeaderAvatar>
					)}
					<HeaderButtons>
						<ButtonToolbar>
							<Button
								label={t('admin/content/views/content-detail___bewerken')}
								onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							/>
							{/* TODO: also check permissions */}
							{(!isContentProtected || (isContentProtected && isAdminUser)) && (
								<Button
									label={t('admin/content/views/content-detail___verwijderen')}
									onClick={() => setIsConfirmModalOpen(true)}
									type="danger-hover"
								/>
							)}
						</ButtonToolbar>
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
					resultPath={`${CONTENT_RESULT_PATH.GET}[0]`}
					variables={{ id }}
				/>
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete()}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
					body={
						isContentProtected
							? t('admin/content/views/content-detail___opgelet-dit-is-een-beschermde-pagina')
							: ''
					}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentDetail;
