import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactElement,
	ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Blankslate,
	Button,
	ButtonToolbar,
	Container,
	DropdownButton,
	DropdownContent,
	LinkTarget,
	MenuContent,
	Navbar,
	Tabs,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ContentPage } from '../../../content-page/views';
import {
	ControlledDropdown,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	navigate,
	navigateToAbsoluteOrRelativeUrl,
} from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { ApolloCacheManager, ToastService } from '../../../shared/services';
import {
	AdminLayout,
	AdminLayoutBody,
	AdminLayoutHeader,
	AdminLayoutTopBarRight,
} from '../../shared/layouts';
import PublishContentPageModal from '../components/PublishContentPageModal';
import { CONTENT_PATH, GET_CONTENT_DETAIL_TABS } from '../content.const';
import { DELETE_CONTENT } from '../content.gql';
import { ContentService } from '../content.service';
import { ContentDetailParams, ContentPageInfo } from '../content.types';
import { isPublic } from '../helpers/get-published-state';

import './ContentDetail.scss';
import { ContentDetailMetaData } from './ContentDetailMetaData';

export const CONTENT_PAGE_COPY = 'Kopie %index%: ';
export const CONTENT_PAGE_COPY_REGEX = /^Kopie [0-9]+: /gi;

interface ContentDetailProps extends DefaultSecureRouteProps<ContentDetailParams> {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history, match, user }) => {
	const { id } = match.params;

	// Hooks
	const [t] = useTranslation();

	const [contentPageInfo, setContentPageInfo] = useState<ContentPageInfo | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);

	const [currentTab, setCurrentTab, tabs] = useTabs(
		GET_CONTENT_DETAIL_TABS(),
		GET_CONTENT_DETAIL_TABS()[0].id
	);

	// Computed
	const isAdminUser = get(user, 'role.name', null) === 'admin';
	const isContentProtected = get(contentPageInfo, 'is_protected', false);
	const pageTitle = `Content: ${get(contentPageInfo, 'title', '')}`;
	const description = contentPageInfo ? ContentService.getDescription(contentPageInfo) : '';

	const fetchContentPageById = useCallback(async () => {
		try {
			setContentPageInfo(await ContentService.getContentPageById(id));
		} catch (err) {
			console.error(
				new CustomError('Failed to get content page by id', err, {
					query: 'GET_CONTENT_PAGE_BY_ID',
					variables: {
						id,
					},
				})
			);
			const notFound = JSON.stringify(err).includes('NOT_FOUND');
			setLoadingInfo({
				state: 'error',
				message: notFound
					? t(
							'admin/content/views/content-detail___een-content-pagina-met-dit-id-kon-niet-worden-gevonden'
					  )
					: t(
							'admin/content/views/content-detail___het-ophalen-van-de-content-pagina-is-mislukt'
					  ),
				icon: notFound ? 'search' : 'alert-triangle',
			});
		}
	}, [setContentPageInfo, setLoadingInfo, t, id]);

	useEffect(() => {
		fetchContentPageById();
	}, [fetchContentPageById]);

	useEffect(() => {
		if (contentPageInfo) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [contentPageInfo, setLoadingInfo]);

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
		if (contentPageInfo && contentPageInfo.path) {
			navigateToAbsoluteOrRelativeUrl(contentPageInfo.path, history, LinkTarget.Blank);
		} else {
			ToastService.danger(
				t('admin/content/views/content-detail___de-preview-kon-niet-worden-geopend')
			);
		}
	}

	const handleShareModalClose = async (newContentPage?: Partial<ContentPageInfo>) => {
		try {
			if (newContentPage) {
				await ContentService.updateContentPage({
					...contentPageInfo,
					...newContentPage,
				});

				setContentPageInfo({
					...contentPageInfo,
					...newContentPage,
				} as ContentPageInfo);

				ToastService.success(
					isPublic(newContentPage)
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
				contentPage: contentPageInfo,
			});

			ToastService.danger(
				t(
					'admin/content/views/content-detail___het-opslaan-van-de-publiek-status-van-de-content-pagina-is-mislukt'
				),
				false
			);
		}

		setIsPublishModalOpen(false);
	};

	const CONTENT_DROPDOWN_ITEMS = [
		createDropdownMenuItem(
			'duplicate',
			t('collection/views/collection-detail___dupliceer'),
			'copy'
		),
		...(!isContentProtected || (isContentProtected && isAdminUser)
			? [
					createDropdownMenuItem(
						'delete',
						t('admin/content/views/content-detail___verwijderen')
					),
			  ]
			: []),
	];

	const executeAction = async (item: ReactText) => {
		switch (item) {
			case 'duplicate':
				try {
					if (!contentPageInfo) {
						ToastService.danger(
							t(
								'admin/content/views/content-detail___de-content-pagina-kon-niet-worden-gedupliceerd'
							),
							false
						);
						return;
					}

					const duplicateContentPage = await ContentService.duplicateContentPage(
						contentPageInfo,
						CONTENT_PAGE_COPY,
						CONTENT_PAGE_COPY_REGEX,
						get(user, 'profile.id')
					);

					if (!duplicateContentPage) {
						ToastService.danger(
							t(
								'admin/content/views/content-detail___de-gedupliceerde-content-pagina-kon-niet-worden-gevonden'
							),
							false
						);
						return;
					}

					redirectToClientPage(
						buildLink(CONTENT_PATH.CONTENT_DETAIL, { id: duplicateContentPage.id }),
						history
					);

					ToastService.success(
						t('admin/content/views/content-detail___de-content-pagina-is-gedupliceerd'),
						false
					);
				} catch (err) {
					console.error('Failed to duplicate content page', err, {
						originalContentPage: contentPageInfo,
					});

					ToastService.danger(
						t(
							'admin/content/views/content-detail___het-dupliceren-van-de-content-pagina-is-mislukt'
						),
						false
					);
				}
				break;

			case 'delete':
				setIsConfirmModalOpen(true);
				break;

			default:
				return null;
		}
	};

	const renderContentActions = () => (
		<ButtonToolbar>
			{((PermissionService.hasPerm(user, PermissionName.PUBLISH_ANY_CONTENT_PAGE) &&
				!isPublic(contentPageInfo)) ||
				(PermissionService.hasPerm(user, PermissionName.UNPUBLISH_ANY_CONTENT_PAGE) &&
					isPublic(contentPageInfo))) && (
				<Button
					type="secondary"
					icon={isPublic(contentPageInfo) ? 'unlock-3' : 'lock'}
					label={t('admin/content/views/content-detail___publiceren')}
					title={t(
						'admin/content/views/content-detail___maak-de-content-pagina-publiek-niet-publiek'
					)}
					ariaLabel={t(
						'admin/content/views/content-detail___maak-de-content-pagina-publiek-niet-publiek'
					)}
					onClick={() => setIsPublishModalOpen(true)}
				/>
			)}
			<Button
				type="secondary"
				icon="eye"
				label={t('admin/content/views/content-detail___preview')}
				title={t('admin/content/views/content-detail___bekijk-deze-pagina-in-de-website')}
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
			<ControlledDropdown
				isOpen={isOptionsMenuOpen}
				menuWidth="fit-content"
				onOpen={() => setIsOptionsMenuOpen(true)}
				onClose={() => setIsOptionsMenuOpen(false)}
				placement="bottom-end"
			>
				<DropdownButton>
					<Button
						type="secondary"
						icon="more-horizontal"
						ariaLabel={t('collection/views/collection-detail___meer-opties')}
						title={t('collection/views/collection-detail___meer-opties')}
					/>
				</DropdownButton>
				<DropdownContent>
					<MenuContent menuItems={CONTENT_DROPDOWN_ITEMS} onClick={executeAction} />
				</DropdownContent>
			</ControlledDropdown>
		</ButtonToolbar>
	);

	// Render
	const renderContentDetail = (contentPageInfo: ContentPageInfo | null): ReactElement | null => {
		if (!contentPageInfo) {
			ToastService.danger(
				t(
					'admin/content/views/content-detail___de-content-pagina-kon-niet-worden-ingeladen'
				),
				false
			);
			return null;
		}

		switch (currentTab) {
			case 'inhoud':
				return <ContentPage contentPageInfo={contentPageInfo} />;
			case 'metadata':
				return <ContentDetailMetaData contentPageInfo={contentPageInfo} />;
			default:
				return (
					<Blankslate
						title={t(
							'admin/content/views/content-detail___dit-tabblad-kon-niet-gevonden-worden'
						)}
					/>
				);
		}
	};

	return (
		<AdminLayout showBackButton pageTitle={pageTitle}>
			<AdminLayoutTopBarRight>{renderContentActions()}</AdminLayoutTopBarRight>
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
							get(contentPageInfo, 'title'),
							t(
								'admin/content/views/content-detail___content-beheer-detail-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={get(contentPageInfo, 'seo_description') || description || ''}
					/>
				</MetaTags>
				<div className="m-content-detail-preview">
					<LoadingErrorLoadedComponent
						loadingInfo={loadingInfo}
						dataObject={contentPageInfo}
						render={() => renderContentDetail(contentPageInfo)}
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
					{!!contentPageInfo && (
						<PublishContentPageModal
							contentPage={contentPageInfo}
							isOpen={isPublishModalOpen}
							onClose={handleShareModalClose}
						/>
					)}
				</div>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentDetail;
