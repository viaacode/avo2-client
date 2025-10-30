import { toggleSortOrder } from '@meemoo/admin-core-ui/admin';
import { OrderDirection, PaginationBar } from '@meemoo/react-components';
import {
	Button,
	IconName,
	MetaData,
	MetaDataItem,
	Spacer,
	Table,
	type TableColumn,
	Thumbnail,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { orderBy } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import { FragmentShareModal } from '../../shared/components/FragmentShareModal/FragmentShareModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error';
import { formatDate, fromNow } from '../../shared/helpers/formatters';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTranslation } from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	CONTENT_TYPE_TO_EVENT_CONTENT_TYPE,
} from '../../shared/services/bookmarks-views-plays-service';
import {
	type BookmarkInfo,
	type EventContentType,
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { ToastService } from '../../shared/services/toast-service';
import { embedFlowAtom } from '../../shared/store/ui.store';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

const ITEMS_PER_PAGE = 5;

interface BookmarksOverviewProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

export const BookmarksOverview: FC<BookmarksOverviewProps> = ({ numberOfItems, onUpdate }) => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();
	const commonUser = useAtomValue(commonUserAtom);
	const isSmartSchoolEmbedFlow = useAtomValue(embedFlowAtom);

	// State
	const [bookmarks, setBookmarks] = useState<BookmarkInfo[] | null>(null);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkInfo | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [mediaItemForEmbedCodeModal, setMediaItemForEmbedCodeModal] =
		useState<Avo.Item.Item | null>(null);
	const [sortColumn, setSortColumn] = useState<keyof BookmarkInfo>('createdAt');
	const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.desc);
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [paginatedBookmarks, setPaginatedBookmarks] = useState<BookmarkInfo[]>([]);

	const BOOKMARK_COLUMNS: TableColumn[] = [
		{ id: 'contentThumbnailPath', label: '', col: '2' },
		{
			id: 'contentTitle',
			label: tText('collection/views/collection-overview___titel'),
			col: '6',
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		...(isMobileWidth()
			? []
			: [
					{
						id: 'createdAt',
						label: tText('workspace/views/bookmarks___aangemaakt-op'),
						col: '3',
						sortable: true,
						visibleByDefault: true,
						dataType: TableColumnDataType.dateTime,
					},
			  ]),
		{
			id: ACTIONS_TABLE_COLUMN_ID,
			tooltip: tText('workspace/views/bookmarks-overview___acties'),
			col: '1',
		},
	] as TableColumn[];

	const fetchBookmarks = useCallback(async () => {
		try {
			const bookmarkInfos = await BookmarksViewsPlaysService.getAllBookmarksForUser();
			setBookmarks(bookmarkInfos);
			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(
				new CustomError('Failed to get all bookmarks for user', err, { commonUser })
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'workspace/views/bookmarks___het-ophalen-van-je-bladwijzers-is-mislukt'
				),
			});
		}
	}, [commonUser, setBookmarks, setLoadingInfo, tHtml]);

	useEffect(() => {
		fetchBookmarks();
	}, [fetchBookmarks]);

	const updatePaginatedBookmarks = useCallback(() => {
		setPaginatedBookmarks(
			orderBy(bookmarks, [sortColumn], [sortOrder]).slice(
				ITEMS_PER_PAGE * page,
				ITEMS_PER_PAGE * (page + 1)
			)
		);
	}, [setPaginatedBookmarks, sortColumn, sortOrder, page, bookmarks]);

	useEffect(updatePaginatedBookmarks, [updatePaginatedBookmarks]);

	const onDeleteBookmark = async () => {
		try {
			setIsDeleteModalOpen(false);
			if (!bookmarkToDelete) {
				ToastService.danger(
					tHtml(
						'workspace/views/bookmarks___het-verwijderen-van-de-bladwijzer-is-mislukt'
					)
				);
				return;
			}
			await BookmarksViewsPlaysService.toggleBookmark(
				bookmarkToDelete.contentId,
				commonUser as Avo.User.CommonUser,
				CONTENT_TYPE_TO_EVENT_CONTENT_TYPE[bookmarkToDelete.contentType],
				true
			);

			await fetchBookmarks();
			onUpdate();
			ToastService.success(tHtml('workspace/views/bookmarks___de-bladwijzer-is-verwijderd'));
		} catch (err) {
			console.error(
				new CustomError('Failed t delete bookmark', err, { bookmarkToDelete, commonUser })
			);
			ToastService.danger(
				tHtml('workspace/views/bookmarks___het-verwijderen-van-de-bladwijzer-is-mislukt')
			);
		}

		setBookmarkToDelete(null);
	};

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof BookmarkInfo) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(toggleSortOrder(sortOrder));
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder(OrderDirection.asc);
		}
		setPage(0);
	};

	const handleEmbedCodeClicked = (bookmarkInfo: BookmarkInfo) => {
		setMediaItemForEmbedCodeModal({
			title: bookmarkInfo.contentTitle,
			description: bookmarkInfo.contentDescription,
			duration: bookmarkInfo.contentDuration,
			external_id: bookmarkInfo.contentLinkId,
			thumbnail_path: bookmarkInfo.contentThumbnailPath,
			type: bookmarkInfo.contentType,
		} as Avo.Item.Item);
	};

	// Render functions
	const getDetailLink = (contentType: EventContentType, contentLinkId: string) =>
		buildLink(
			{
				item: APP_PATH.ITEM_DETAIL.route,
				collection: APP_PATH.COLLECTION_DETAIL.route,
				bundle: APP_PATH.BUNDLE_DETAIL.route,
				assignment: APP_PATH.ASSIGNMENT_DETAIL.route,
				quick_lane: APP_PATH.QUICK_LANE.route,
			}[contentType],
			{
				id: contentLinkId,
			}
		);

	const renderThumbnail = ({
		contentLinkId,
		contentType,
		contentTitle,
		contentThumbnailPath,
	}: BookmarkInfo) => (
		<Link
			to={getDetailLink(CONTENT_TYPE_TO_EVENT_CONTENT_TYPE[contentType], contentLinkId)}
			title={contentTitle}
		>
			<Thumbnail
				alt="thumbnail"
				category={contentType}
				className="m-collection-overview-thumbnail"
				src={contentThumbnailPath || undefined}
				showCategoryIcon
			/>
		</Link>
	);

	const renderTitle = ({
		contentLinkId,
		contentType,
		contentTitle,
		contentCreatedAt,
		contentViews,
	}: BookmarkInfo) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link
					to={getDetailLink(
						CONTENT_TYPE_TO_EVENT_CONTENT_TYPE[contentType],
						contentLinkId
					)}
					title={contentTitle}
				>
					{truncateTableValue(contentTitle)}
				</Link>
			</h3>
			<div className="c-content-header__meta u-text-muted">
				<MetaData category={contentType}>
					<MetaDataItem>
						{contentCreatedAt && (
							<span title={`Aangemaakt: ${formatDate(new Date(contentCreatedAt))}`}>
								{formatDate(new Date(contentCreatedAt))}
							</span>
						)}
					</MetaDataItem>
					<MetaDataItem icon={IconName.eye} label={String(contentViews || 0)} />
				</MetaData>
			</div>
		</div>
	);

	const renderActions = (bookmarkInfo: BookmarkInfo) => {
		const isItem = CONTENT_TYPE_TO_EVENT_CONTENT_TYPE[bookmarkInfo.contentType] === 'item';

		if (isSmartSchoolEmbedFlow) {
			if (isItem) {
				return (
					<Button
						className="c-button-smartschool"
						icon={IconName.smartschool}
						label={tText(
							'workspace/views/bookmarks-overview___gebruiken-in-smartschool'
						)}
						ariaLabel={tText(
							'workspace/views/bookmarks-overview___gebruiken-in-smartschool'
						)}
						title={tText(
							'workspace/views/bookmarks-overview___gebruiken-in-smartschool'
						)}
						onClick={() => handleEmbedCodeClicked(bookmarkInfo)}
					/>
				);
			}
			return <></>;
		}

		return (
			<>
				<Button
					title={tText('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
					ariaLabel={tText('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
					icon={IconName.delete}
					type="danger-hover"
					onClick={() => {
						setBookmarkToDelete(bookmarkInfo);
						setIsDeleteModalOpen(true);
					}}
				/>

				{isItem &&
					PermissionService.hasPerm(
						commonUser,
						PermissionName.EMBED_ITEMS_ON_OTHER_SITES
					) && (
						<Button
							title={tText('workspace/views/bookmarks-overview___fragment-insluiten')}
							ariaLabel={tText(
								'workspace/views/bookmarks-overview___fragment-insluiten'
							)}
							icon={IconName.code}
							className="u-spacer-left-s"
							type="secondary"
							onClick={() => handleEmbedCodeClicked(bookmarkInfo)}
						/>
					)}
			</>
		);
	};

	const renderCell = (bookmarkInfo: BookmarkInfo, colKey: string) => {
		switch (colKey as keyof BookmarkInfo | typeof ACTIONS_TABLE_COLUMN_ID) {
			case 'contentThumbnailPath':
				return renderThumbnail(bookmarkInfo);

			case 'contentTitle':
				return renderTitle(bookmarkInfo);

			case 'createdAt': {
				const cellData = bookmarkInfo.createdAt;
				return (
					<span title={new Date(cellData).toISOString()}>
						{fromNow(new Date(cellData))}
					</span>
				);
			}
			case ACTIONS_TABLE_COLUMN_ID:
				return renderActions(bookmarkInfo);

			default:
				return null;
		}
	};

	const renderTable = () => (
		<>
			<Table
				columns={BOOKMARK_COLUMNS}
				data={paginatedBookmarks}
				emptyStateMessage={tText(
					'collection/views/collection-overview___geen-resultaten-gevonden'
				)}
				renderCell={renderCell}
				rowKey="contentId"
				variant="styled"
				onColumnClick={onClickColumn as any}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
			/>
			<Spacer margin="top-large">
				<PaginationBar
					{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
					startItem={page * ITEMS_PER_PAGE}
					itemsPerPage={ITEMS_PER_PAGE}
					totalItems={numberOfItems}
					onPageChange={setPage}
				/>
			</Spacer>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView
			icon={IconName.bookmark}
			message={tHtml('workspace/views/bookmarks___je-hebt-nog-geen-bladwijzers-aangemaakt')}
		>
			<p>
				{tHtml(
					'workspace/views/bookmarks___een-bladwijzer-kan-je-gebruiken-om-eenvoudig-items-terug-te-vinden'
				)}
			</p>
			<Spacer margin="top">
				<Button
					type="primary"
					icon={IconName.search}
					label={tText('workspace/views/bookmarks___zoek-een-item')}
					title={tText(
						'workspace/views/bookmarks-overview___zoek-een-item-en-maak-er-een-bladwijzer-van'
					)}
					onClick={() => navigateFunc(APP_PATH.SEARCH.route)}
				/>
			</Spacer>
		</ErrorView>
	);

	const renderBookmarks = () => (
		<>
			{bookmarks && bookmarks.length ? renderTable() : renderEmptyFallback()}
			<FragmentShareModal
				isOpen={!!mediaItemForEmbedCodeModal}
				item={mediaItemForEmbedCodeModal}
				showOnlyEmbedTab={true}
				onClose={() => setMediaItemForEmbedCodeModal(null)}
			/>
			<ConfirmModal
				title={tHtml('workspace/views/bookmarks___verwijder-bladwijzer')}
				body={tHtml(
					'workspace/views/bookmarks-overview___ben-je-zeker-dat-je-deze-bladwijzer-wil-verwijderen-br-deze-actie-kan-niet-ongedaan-gemaakt-worden'
				)}
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				confirmCallback={onDeleteBookmark}
			/>
		</>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={bookmarks}
			render={renderBookmarks}
		/>
	);
};
