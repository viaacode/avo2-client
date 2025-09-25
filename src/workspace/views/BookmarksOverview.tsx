import { cleanupFilterTableState, toggleSortOrder } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { OrderDirection, PaginationBar } from '@meemoo/react-components';
import {
	Button,
	ButtonToolbar,
	Flex,
	Form,
	FormGroup,
	IconName,
	MetaData,
	MetaDataItem,
	Spacer,
	Spinner,
	Table,
	type TableColumn,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	useKeyPress,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { cloneDeep } from 'lodash-es';
import React, { type FC, type KeyboardEvent, useCallback, useMemo, useState } from 'react';
import { Link, type RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { DelimitedArrayParam, NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import type { AssignmentTableColumns } from '../../assignment/assignment.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import FragmentShareModal from '../../shared/components/FragmentShareModal/FragmentShareModal';
import LabelsClassesDropdownFilter from '../../shared/components/ManageLabelsClasses/LabelsClassesDropdownFilter';
import { buildLink } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error';
import { formatDate, fromNow } from '../../shared/helpers/formatters';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withEmbedFlow, { type EmbedFlowProps } from '../../shared/hocs/withEmbedFlow';
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
import { KeyCode } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { useGetBookmarksForUser } from '../hooks/useGetBookmarksForUser';

const ITEMS_PER_PAGE = 5;

interface BookmarksOverviewProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

const DEFAULT_SORT_COLUMN = 'created_at';
const DEFAULT_SORT_ORDER = OrderDirection.desc;

const BookmarksOverview: FC<
	BookmarksOverviewProps & UserProps & RouteComponentProps & EmbedFlowProps
> = ({ numberOfItems, onUpdate, history, commonUser, isSmartSchoolEmbedFlow }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkInfo | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [mediaItemForEmbedCodeModal, setMediaItemForEmbedCodeModal] =
		useState<Avo.Item.Item | null>(null);

	const [filterString, setFilterString] = useState<string | undefined>(undefined);
	const [query, setQuery] = useQueryParams({
		selectedBookmarkLabelIds: DelimitedArrayParam,
		selectedClassLabelIds: DelimitedArrayParam,
		filter: StringParam,
		page: NumberParam,
		sortColumn: StringParam,
		sortOrder: StringParam,
	});

	const handleQueryChanged = (value: string | string[] | number | undefined, id: string) => {
		let newQuery: any = cloneDeep(query);

		newQuery = {
			...newQuery,
			[id]: value,
			...(id !== 'page' ? { page: 0 } : {}), // Reset the page to 0, when any filter or sort order change is made
		};

		setQuery(newQuery, 'pushIn');
	};

	const handleSearchFieldKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
		if (evt.keyCode === KeyCode.Enter) {
			copySearchTermsToQueryState();
		}
	};

	const copySearchTermsToQueryState = () => {
		handleQueryChanged(filterString, 'filter');
	};

	useKeyPress('Enter', copySearchTermsToQueryState);

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

	const getColumnDataType = useCallback((): TableColumnDataType => {
		const column = BOOKMARK_COLUMNS.find(
			(tableColumn: any) => (tableColumn.id || '') === query.sortColumn
		);
		return (column?.dataType || TableColumnDataType.string) as TableColumnDataType;
	}, [query.sortColumn, BOOKMARK_COLUMNS]);

	const {
		data: bookmarkResponse,
		isLoading,
		refetch: reloadBookmarks,
	} = useGetBookmarksForUser(
		query.page || 0,
		ITEMS_PER_PAGE,
		(query.sortColumn || DEFAULT_SORT_COLUMN) as keyof BookmarkInfo,
		(query.sortOrder || DEFAULT_SORT_ORDER) as Avo.Search.OrderDirection,
		getColumnDataType(),
		query.filter || '',
		(query.selectedBookmarkLabelIds as string[]) || [],
		(query.selectedClassLabelIds as string[]) || []
	);
	const bookmarks = useMemo(() => bookmarkResponse || [], [bookmarkResponse]);

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

			await reloadBookmarks();
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

	const onClickColumn = (columnId: keyof BookmarkInfo) => {
		let newQuery: any = cloneDeep(query);

		newQuery = cleanupFilterTableState({
			...newQuery,
			sortColumn: columnId,
			sortOrder: toggleSortOrder(query.sortOrder),
		});

		setQuery(newQuery, 'pushIn');
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
				data={bookmarks}
				emptyStateMessage={tText(
					'collection/views/collection-overview___geen-resultaten-gevonden'
				)}
				renderCell={renderCell}
				rowKey="contentId"
				variant="styled"
				onColumnClick={onClickColumn as any}
				sortColumn={query.sortColumn as AssignmentTableColumns}
				sortOrder={query.sortOrder as OrderDirection}
			/>
			<Spacer margin="top-large">
				<PaginationBar
					{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
					startItem={(query.page || 0) * ITEMS_PER_PAGE}
					itemsPerPage={ITEMS_PER_PAGE}
					totalItems={numberOfItems}
					onPageChange={(newPage: number) => handleQueryChanged(newPage, 'page')}
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

	const renderHeader = () => {
		return (
			<Toolbar>
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							<LabelsClassesDropdownFilter
								type={'CLASS'}
								selectedLabelIds={query.selectedBookmarkLabelIds ?? []}
								selectedClassLabelIds={query.selectedClassLabelIds ?? []}
								onChange={(selectedClasses) =>
									handleQueryChanged(selectedClasses, 'selectedClassLabelIds')
								}
							/>
							<LabelsClassesDropdownFilter
								type={'LABEL'}
								selectedLabelIds={query.selectedBookmarkLabelIds ?? []}
								selectedClassLabelIds={query.selectedClassLabelIds ?? []}
								onChange={(selectedLabels) =>
									handleQueryChanged(selectedLabels, 'selectedBookmarkLabelIds')
								}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarRight>
					<ToolbarItem>
						<Form type="inline">
							<FormGroup inlineMode="grow">
								<TextInput
									className="m-assignment-overview__search-input"
									icon={IconName.filter}
									value={filterString}
									onChange={setFilterString}
									onKeyUp={handleSearchFieldKeyUp}
									disabled={!bookmarks}
								/>
							</FormGroup>
						</Form>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const renderBookmarks = () => {
		if (isLoading) {
			return (
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			);
		}

		return (
			<>
				{renderHeader()}
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
	};

	return renderBookmarks();
};

export default compose(
	withRouter,
	withUser,
	withEmbedFlow
)(BookmarksOverview) as FC<BookmarksOverviewProps>;
