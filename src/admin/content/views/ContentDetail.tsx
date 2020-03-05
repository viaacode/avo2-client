import { useMutation } from '@apollo/react-hooks';
import { compact, get } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
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
	TagInfo,
	TagList,
	TagOption,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import {
	formatDate,
	getAvatarProps,
	navigate,
	sanitize,
	sanitizePresets,
} from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { ApolloCacheManager, ToastService } from '../../../shared/services';
import { fetchAllUserGroups } from '../../../shared/services/user-groups-service';
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
	const [allUserGroups, setAllUserGroups] = useState<TagInfo[]>([]);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	const [contentBlocks] = useContentBlocksByContentId(id);
	const [currentTab, setCurrentTab, tabs] = useTabs(
		CONTENT_DETAIL_TABS,
		CONTENT_DETAIL_TABS[0].id
	);

	// Computed
	const avatarProps = getAvatarProps(get(content, 'profile', null));
	const contentBlockConfigs = parseContentBlocks(contentBlocks);
	const isAdminUser = get(user, 'role.name', null) === 'admin';
	const isContentProtected = get(content, 'is_protected', false);
	const pageTitle = `Content: ${get(content, 'title', '')}`;

	// Get labels of the userGroups, so we can show a readable error message
	useEffect(() => {
		fetchAllUserGroups()
			.then(userGroups => {
				setAllUserGroups(userGroups);
			})
			.catch((err: any) => {
				console.error('Failed to get user groups', err);
				ToastService.danger(
					t(
						'admin/shared/components/user-group-select/user-group-select___het-controleren-van-je-account-rechten-is-mislukt'
					),
					false
				);
			});
	}, [setAllUserGroups, t]);

	// Methods
	const getUserGroups = (contentItem: Avo.Content.Content): TagOption[] => {
		const tagInfos: TagInfo[] = compact(
			(contentItem.user_group_ids || []).map((userGroupId: number): TagInfo | undefined => {
				return allUserGroups.find(userGroupOption => userGroupOption.value === userGroupId);
			})
		);
		const tagOptions = tagInfos.map(
			(ug: TagInfo): TagOption => ({
				id: ug.value,
				label: ug.label,
			})
		);
		if (tagOptions && tagOptions.length) {
			return tagOptions;
		}
		return [
			{
				id: -3,
				label: t('admin/menu/components/menu-edit-form/menu-edit-form___niemand'),
			},
		];
	};

	const handleDelete = () => {
		triggerContentDelete({
			variables: { id },
			update: ApolloCacheManager.clearContentCache,
		})
			.then(() => {
				history.push(CONTENT_PATH.CONTENT);
				ToastService.success(
					t(
						'admin/content/views/content-detail___het-content-item-is-succesvol-verwijderd'
					),
					false
				);
			})
			.catch(err => {
				console.error(err);
				ToastService.danger(
					t(
						'admin/content/views/content-detail___het-verwijderen-van-het-content-item-is-mislukt'
					),
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
						contentWidth={get(content, 'content_width')}
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
									<p
										dangerouslySetInnerHTML={{
											__html: sanitize(
												contentItem.description,
												sanitizePresets.link
											),
										}}
									/>
								</Spacer>
							)}

							<BlockHeading type="h4">
								<Trans i18nKey="admin/content/views/content-detail___metadata">
									Metadata:
								</Trans>
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
									<tr>
										<th>
											<Trans i18nKey="admin/content/views/content-detail___toegankelijk-voor">
												Toegankelijk voor:
											</Trans>
										</th>
										<td>
											<TagList
												swatches={false}
												selectable={false}
												closable={false}
												tags={getUserGroups(contentItem)}
											/>
										</td>
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
		<AdminLayout showBackButton>
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
							? t(
									'admin/content/views/content-detail___opgelet-dit-is-een-beschermde-pagina'
							  )
							: ''
					}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentDetail;
