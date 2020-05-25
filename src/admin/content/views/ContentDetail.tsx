import { useMutation } from '@apollo/react-hooks';
import { compact, flatten, get } from 'lodash-es';
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	LinkTarget,
	Navbar,
	Spacer,
	Table,
	Tabs,
	TagInfo,
	TagList,
	TagOption,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ContentPage } from '../../../content-page/views';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import {
	CustomError,
	navigate,
	navigateToAbsoluteOrRelativeUrl,
	sanitize,
	sanitizePresets,
} from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { ApolloCacheManager, ToastService } from '../../../shared/services';
import { fetchAllUserGroups } from '../../../shared/services/user-groups-service';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import {
	AdminLayout,
	AdminLayoutBody,
	AdminLayoutHeader,
	AdminLayoutTopBarRight,
} from '../../shared/layouts';
import ShareContentPageModal from '../components/ShareContentPageModal';
import { CONTENT_PATH, GET_CONTENT_DETAIL_TABS, GET_CONTENT_WIDTH_OPTIONS } from '../content.const';
import { DELETE_CONTENT } from '../content.gql';
import { ContentService } from '../content.service';
import { ContentDetailParams, DbContent } from '../content.types';

import './ContentDetail.scss';

interface ContentDetailProps extends DefaultSecureRouteProps<ContentDetailParams> {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history, match, user }) => {
	const { id } = match.params;

	// Hooks
	const [contentPage, setContentPage] = useState<DbContent | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [allUserGroups, setAllUserGroups] = useState<TagInfo[]>([]);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	const [currentTab, setCurrentTab, tabs] = useTabs(
		GET_CONTENT_DETAIL_TABS(),
		GET_CONTENT_DETAIL_TABS()[0].id
	);

	// Computed
	const isAdminUser = get(user, 'role.name', null) === 'admin';
	const isContentProtected = get(contentPage, 'is_protected', false);
	const pageTitle = `Content: ${get(contentPage, 'title', '')}`;

	const fetchContentPageById = useCallback(async () => {
		try {
			setContentPage(await ContentService.getContentPageById(id));
		} catch (err) {
			console.error(
				new CustomError('Failed to get content page by id', err, {
					query: 'GET_CONTENT_PAGE_BY_ID',
					variables: {
						id,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/content/views/content-detail___het-ophalen-van-de-content-pagina-is-mislukt'
				),
			});
		}
	}, [setContentPage, setLoadingInfo, t, id]);

	useEffect(() => {
		fetchContentPageById();
	}, [fetchContentPageById]);

	useEffect(() => {
		if (contentPage) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [contentPage, setLoadingInfo]);

	// Get labels of the contentPages, so we can show a readable error message
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
	const getUserGroups = (contentPage: Avo.Content.Content): TagOption[] => {
		const tagInfos: TagInfo[] = compact(
			(contentPage.user_group_ids || []).map((userGroupId: number): TagInfo | undefined => {
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

	const getLabels = (contentPage: DbContent): TagOption[] => {
		return flatten(
			(contentPage.content_content_labels || []).map(
				(contentLabelLink: Avo.Content.ContentLabelLink) => {
					return contentLabelLink.content_label;
				}
			)
		);
	};

	const getContentPageWidthLabel = (contentPage: Avo.Content.Content): string => {
		return (
			get(
				GET_CONTENT_WIDTH_OPTIONS().find(
					option => option.value === contentPage.content_width
				),
				'label'
			) || '-'
		);
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

	function handlePreviewClicked() {
		if (contentPage && contentPage.path) {
			navigateToAbsoluteOrRelativeUrl(contentPage.path, history, LinkTarget.Blank);
		} else {
			ToastService.danger(
				t('admin/content/views/content-detail___de-preview-kon-niet-worden-geopend')
			);
		}
	}

	const handleShareModalClose = async (newContentPage?: Partial<DbContent>) => {
		try {
			if (newContentPage) {
				await ContentService.updateContentPage({
					...contentPage,
					...newContentPage,
				});

				ToastService.success(
					newContentPage.is_public
						? t('admin/content/views/content-detail___de-content-pagina-is-nu-publiek')
						: t(
								'admin/content/views/content-detail___de-content-pagina-is-nu-niet-meer-publiek'
						  ),
					false
				);
			}
		} catch (err) {
			console.error('Failed to save is_public state to content page', err, {
				newContentPage,
				contentPage,
			});
			ToastService.danger(
				t(
					'admin/content/views/content-detail___het-opslaan-van-de-publiek-status-van-de-content-pagina-is-mislukt'
				),
				false
			);
		}
		setIsShareModalOpen(false);
	};

	// Render
	const renderContentDetail = (): ReactElement | null => {
		if (!contentPage) {
			return null;
		}
		// TODO: Move tab contents to separate views
		switch (currentTab) {
			case 'inhoud':
				return <ContentPage contentPage={contentPage} />;
			case 'metadata':
				return (
					<Container mode="vertical" size="small">
						<Container mode="horizontal">
							{!!contentPage.description && (
								<Spacer margin="bottom-large">
									<BlockHeading type="h4">
										<Trans i18nKey="admin/content/views/content-detail___omschrijving">
											Omschrijving:
										</Trans>
									</BlockHeading>
									<p
										dangerouslySetInnerHTML={{
											__html: sanitize(
												contentPage.description,
												sanitizePresets.link
											),
										}}
									/>
								</Spacer>
							)}

							<Table horizontal variant="invisible" className="c-table_detail-page">
								<tbody>
									{/* TODO: Change typings repo to allow removal of as any cast */}
									{renderDetailRow(
										<div style={{ width: '400px' }}>
											<Thumbnail
												category="item"
												src={(contentPage as any).thumbnail_path}
											/>
										</div>,
										t('admin/content/views/content-detail___cover-afbeelding')
									)}
									{renderSimpleDetailRows(contentPage, [
										['title', t('admin/content/views/content-detail___titel')],
										[
											'description',
											t('admin/content/views/content-detail___beschrijving'),
										],
										[
											'content_type',
											t('admin/content/views/content-detail___content-type'),
										],
										['path', t('admin/content/views/content-detail___pad')],
										[
											'is_protected',
											t(
												'admin/content/views/content-detail___beschermde-pagina'
											),
										],
									])}
									{renderDetailRow(
										getContentPageWidthLabel(contentPage),
										t('admin/content/views/content-detail___breedte')
									)}
									{renderDetailRow(
										`${get(contentPage, 'profile.user.first_name')} ${get(
											contentPage,
											'profile.user.last_name'
										)}`,
										t('admin/content/views/content-detail___auteur')
									)}
									{renderDetailRow(
										get(contentPage, 'profile.user.role.label'),
										t('admin/content/views/content-detail___auteur-rol')
									)}
									{renderDateDetailRows(contentPage, [
										[
											'created_at',
											t('admin/content/views/content-detail___aangemaakt'),
										],
										[
											'updated_at',
											t(
												'admin/content/views/content-detail___laatst-bewerkt'
											),
										],
										[
											'publish_at',
											t('admin/content/views/content-detail___gepubliceerd'),
										],
										[
											'depublish_at',
											t(
												'admin/content/views/content-detail___gedepubliceerd'
											),
										],
									])}
									{renderDetailRow(
										<TagList
											swatches={false}
											selectable={false}
											closable={false}
											tags={getUserGroups(contentPage)}
										/>,
										t('admin/content/views/content-detail___toegankelijk-voor')
									)}
									{renderDetailRow(
										<TagList
											swatches={false}
											selectable={false}
											closable={false}
											tags={getLabels(contentPage)}
										/>,
										t('admin/content/views/content-detail___labels')
									)}
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
		<AdminLayout showBackButton pageTitle={pageTitle}>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						type="secondary"
						icon={get(contentPage, 'is_public') === true ? 'unlock-3' : 'lock'}
						label={t('admin/content/views/content-detail___publiceren')}
						title={t(
							'admin/content/views/content-detail___maak-de-content-pagina-publiek-niet-publiek'
						)}
						ariaLabel={t(
							'admin/content/views/content-detail___maak-de-content-pagina-publiek-niet-publiek'
						)}
						onClick={() => setIsShareModalOpen(true)}
					/>
					<Button
						type="secondary"
						icon="eye"
						label={t('admin/content/views/content-detail___preview')}
						title={t(
							'admin/content/views/content-detail___bekijk-deze-pagina-in-de-website'
						)}
						ariaLabel={t(
							'admin/content/views/content-detail___bekijk-deze-pagina-in-de-website'
						)}
						onClick={handlePreviewClicked}
					/>
					<Button
						label={t('admin/content/views/content-detail___bewerken')}
						title={t('admin/content/views/content-detail___bewerk-deze-content-pagina')}
						onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
					/>
					{/* TODO: also check permissions */}
					{(!isContentProtected || (isContentProtected && isAdminUser)) && (
						<Button
							label={t('admin/content/views/content-detail___verwijderen')}
							title={t(
								'admin/content/views/content-detail___verwijder-deze-content-pagina'
							)}
							onClick={() => setIsConfirmModalOpen(true)}
							type="danger-hover"
						/>
					)}
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutHeader>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={setCurrentTab} />
					</Container>
				</Navbar>
			</AdminLayoutHeader>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							get(contentPage, 'title'),
							t(
								'admin/content/views/content-detail___content-beheer-detail-pagina-titel'
							)
						)}
					</title>
					<meta name="description" content={get(contentPage, 'description') || ''} />
				</MetaTags>
				<div className="m-content-detail-preview">
					<LoadingErrorLoadedComponent
						loadingInfo={loadingInfo}
						dataObject={contentPage}
						render={renderContentDetail}
					/>
					<DeleteObjectModal
						deleteObjectCallback={handleDelete}
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
					{!!contentPage && (
						<ShareContentPageModal
							contentPage={contentPage}
							isOpen={isShareModalOpen}
							onClose={handleShareModalClose}
						/>
					)}
				</div>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentDetail;
