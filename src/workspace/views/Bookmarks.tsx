import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Button,
	MetaData,
	MetaDataItem,
	Pagination,
	Spacer,
	Table,
	TableColumn,
	Thumbnail,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import { buildLink, CustomError, formatDate, formatTimestamp, fromNow } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service';
import {
	BookmarkInfo,
	EventContentType,
} from '../../shared/services/bookmarks-views-plays-service.const';

const ITEMS_PER_PAGE = 5;

interface BookmarksOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
}

const BookmarksOverview: FunctionComponent<BookmarksOverviewProps> = ({
	numberOfItems,
	history,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [bookmarks, setBookmarks] = useState<BookmarkInfo[]>([]);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkInfo | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [sortColumn, setSortColumn] = useState<keyof BookmarkInfo>('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [paginatedBookmarks, setPaginatedBookmarks] = useState<BookmarkInfo[]>([]);

	const BOOKMARK_COLUMNS: TableColumn[] = [
		{ id: 'contentThumbnailPath', label: '', col: '2' },
		{
			id: 'contentTitle',
			label: t('collection/views/collection-overview___titel'),
			col: '6',
			sortable: true,
		},
		{
			id: 'createdAt',
			label: t('workspace/views/bookmarks___aangemaakt-op'),
			col: '3',
			sortable: true,
		},
		{ id: 'actions', label: '', col: '1' },
	];

	const fetchBookmarks = useCallback(async () => {
		try {
			const bookmarkInfos = await BookmarksViewsPlaysService.getAllBookmarksForUser(user);
			setBookmarks(bookmarkInfos);
			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(new CustomError('Failed to get all bookmarks for user', err, { user }));
			setLoadingInfo({
				state: 'error',
				message: t('workspace/views/bookmarks___het-ophalen-van-je-bladwijzers-is-mislukt'),
			});
		}
	}, [user, setBookmarks, setLoadingInfo, t]);

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
			if (!bookmarkToDelete) {
				ToastService.danger(
					t('workspace/views/bookmarks___het-verwijderen-van-de-bladwijzer-is-mislukt')
				);
				return;
			}
			await BookmarksViewsPlaysService.toggleBookmark(
				bookmarkToDelete.contentId,
				user,
				bookmarkToDelete.contentType,
				true
			);

			await fetchBookmarks();
			ToastService.success(t('workspace/views/bookmarks___de-bladwijzer-is-verwijderd'));
		} catch (err) {
			console.error(
				new CustomError('Failed t delete bookmark', err, { bookmarkToDelete, user })
			);
			ToastService.danger(
				t('workspace/views/bookmarks___het-verwijderen-van-de-bladwijzer-is-mislukt')
			);
		}

		setBookmarkToDelete(null);
	};

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof BookmarkInfo) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder('asc');
		}
		setPage(0);
	};

	// Render functions
	const getDetailLink = (contentType: EventContentType, contentId: string) => {
		return buildLink(
			contentType === 'item' ? APP_PATH.ITEM_DETAIL.route : APP_PATH.COLLECTION_DETAIL.route,
			{
				id: contentId,
			}
		);
	};

	const renderThumbnail = ({
		contentId,
		contentType,
		contentTitle,
		contentThumbnailPath,
	}: BookmarkInfo) => (
		<Link to={getDetailLink(contentType, contentId)} title={contentTitle}>
			<Thumbnail
				alt="thumbnail"
				category={contentType}
				className="m-collection-overview-thumbnail"
				src={contentThumbnailPath || undefined}
			/>
		</Link>
	);

	const renderTitle = ({
		contentId,
		contentType,
		contentTitle,
		contentCreatedAt,
	}: BookmarkInfo) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link to={getDetailLink(contentType, contentId)} title={contentTitle}>
					{contentTitle}
				</Link>
			</h3>
			<div className="c-content-header__meta u-text-muted">
				<MetaData category={contentType}>
					<MetaDataItem>
						<span title={`Aangemaakt: ${formatDate(contentCreatedAt)}`}>
							{fromNow(contentCreatedAt)}
						</span>
					</MetaDataItem>
					{/* TODO: Views from GQL */}
					<MetaDataItem icon="eye" label="0" />
				</MetaData>
			</div>
		</div>
	);

	const renderDeleteAction = (bookmarkInfo: BookmarkInfo) => {
		return (
			<Button
				label={t('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
				icon="bookmark"
				type="borderless"
				onClick={() => {
					setBookmarkToDelete(bookmarkInfo);
					setIsDeleteModalOpen(true);
				}}
			/>
		);
	};

	const renderCell = (bookmarkInfo: BookmarkInfo, colKey: string) => {
		switch (colKey as keyof BookmarkInfo | 'actions') {
			case 'contentThumbnailPath':
				return renderThumbnail(bookmarkInfo);
			case 'contentTitle':
				return renderTitle(bookmarkInfo);
			case 'createdAt':
				const cellData = bookmarkInfo.createdAt;
				return <span title={formatTimestamp(cellData)}>{fromNow(cellData)}</span>;
			case 'actions':
				return renderDeleteAction(bookmarkInfo);
			default:
				return null;
		}
	};

	const renderTable = () => (
		<>
			<Table
				columns={BOOKMARK_COLUMNS}
				data={paginatedBookmarks}
				emptyStateMessage={t(
					'collection/views/collection-overview___geen-resultaten-gevonden'
				)}
				renderCell={renderCell}
				rowKey="contentId"
				variant="styled"
				onColumnClick={onClickColumn as any}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
			/>
			<Pagination
				pageCount={Math.ceil(numberOfItems / ITEMS_PER_PAGE)}
				currentPage={page}
				onPageChange={setPage}
			/>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView
			icon="bookmark"
			message={t('workspace/views/bookmarks___je-hebt-nog-geen-bladwijzers-aangemaakt')}
		>
			<p>
				<Trans i18nKey="workspace/views/bookmarks___een-bladwijzer-kan-je-gebruiken-om-eenvoudig-items-terug-te-vinden">
					Een bladwijzer kan je gebruiken om eenvoudig items terug te vinden.
				</Trans>
			</p>
			<Spacer margin="top">
				<Button
					type="primary"
					icon="search"
					label={t('workspace/views/bookmarks___zoek-een-item')}
					onClick={() => history.push(APP_PATH.SEARCH.route)}
				/>
			</Spacer>
		</ErrorView>
	);

	const renderBookmarks = () => (
		<>
			{bookmarks.length ? renderTable() : renderEmptyFallback()}
			<DeleteObjectModal
				title={t('workspace/views/bookmarks___verwijder-bladwijzer')}
				body={t(
					'collection/views/collection-overview___bent-u-zeker-deze-actie-kan-niet-worden-ongedaan-gemaakt'
				)}
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				deleteObjectCallback={onDeleteBookmark}
			/>
		</>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={bookmarks[0]}
			render={renderBookmarks}
		/>
	);
};

export default BookmarksOverview;
