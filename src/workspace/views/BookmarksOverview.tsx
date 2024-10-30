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
import { type Avo } from '@viaa/avo2-types';
import { orderBy } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Link, type RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components';
import { buildLink, CustomError, formatDate, fromNow, isMobileWidth } from '../../shared/helpers';
import { toggleSortOrder } from '../../shared/helpers/toggle-sort-order';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	CONTENT_TYPE_TO_EVENT_CONTENT_TYPE,
} from '../../shared/services/bookmarks-views-plays-service';
import {
	type BookmarkInfo,
	type EventContentType,
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { ToastService } from '../../shared/services/toast-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

const ITEMS_PER_PAGE = 5;

interface BookmarksOverviewProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

const BookmarksOverview: FC<BookmarksOverviewProps & UserProps & RouteComponentProps> = ({
	numberOfItems,
	onUpdate,
	history,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [bookmarks, setBookmarks] = useState<BookmarkInfo[] | null>(null);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkInfo | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
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
		{ id: 'actions', tooltip: tText('workspace/views/bookmarks-overview___acties'), col: '1' },
	] as TableColumn[];

	const fetchBookmarks = useCallback(async () => {
		try {
			const bookmarkInfos = await BookmarksViewsPlaysService.getAllBookmarksForUser(
				commonUser as Avo.User.CommonUser
			);
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

	const renderDeleteAction = (bookmarkInfo: BookmarkInfo) => (
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
	);

	const renderCell = (bookmarkInfo: BookmarkInfo, colKey: string) => {
		switch (colKey as keyof BookmarkInfo | 'actions') {
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
					onScrollToTop={() => window.scrollTo(0, 0)}
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
					onClick={() => history.push(APP_PATH.SEARCH.route)}
				/>
			</Spacer>
		</ErrorView>
	);

	const renderBookmarks = () => (
		<>
			{bookmarks && bookmarks.length ? renderTable() : renderEmptyFallback()}
			<DeleteObjectModal
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

export default compose(withRouter, withUser)(BookmarksOverview) as FC<BookmarksOverviewProps>;
