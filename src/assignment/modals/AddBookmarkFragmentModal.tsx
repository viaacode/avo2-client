import {
	Button,
	ButtonToolbar,
	Flex,
	Form,
	FormGroup,
	Modal,
	ModalBody,
	Spacer,
	Table,
	TableColumn,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollBar from 'react-perfect-scrollbar';

import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { CustomError, formatDate, isMobileWidth } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import { BookmarksViewsPlaysService, ToastService } from '../../shared/services';
import { BookmarkInfo } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import i18n from '../../shared/translations/i18n';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { AssignmentOverviewTableColumns } from '../assignment.types';

import './AddItemsModals.scss';

// Column definitions
const GET_ADD_BOOKMARK_FRAGMENT_COLUMNS = (): TableColumn[] => [
	{
		id: 'contentTitle',
		label: i18n.t('assignment/modals/add-bookmark-fragment-modal___titel'),
		sortable: true,
		dataType: 'string',
	},
	{
		id: 'contentDuration',
		label: i18n.t('assignment/modals/add-bookmark-fragment-modal___speelduur'),
		sortable: true,
		dataType: 'string',
	},
	{
		id: 'contentCreatedAt',
		label: i18n.t('assignment/modals/add-bookmark-fragment-modal___laatst-toegevoegd'),
		sortable: true,
		dataType: 'dateTime',
	},
];

const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in keyof BookmarkInfo]: (order: Avo.Search.OrderDirection) => any;
}> = {
	contentTitle: (order: Avo.Search.OrderDirection) => ({
		bookmarkedItem: {
			title: order,
		},
	}),
	contentDuration: (order: Avo.Search.OrderDirection) => ({
		bookmarkedItem: {
			duration: order,
		},
	}),
	contentCreatedAt: (order: Avo.Search.OrderDirection) => ({
		bookmarkedItem: {
			created_at: order,
		},
	}),
};

export interface AddBookmarkFragmentModalProps {
	user?: Avo.User.User;
	isOpen: boolean;
	onClose?: () => void;
	addFragmentCallback?: (fragmentId: string) => void;
}

const AddBookmarkFragmentModal: FunctionComponent<AddBookmarkFragmentModalProps> = ({
	user,
	isOpen,
	onClose,
	addFragmentCallback = () => {
		return;
	},
}) => {
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [bookmarks, setBookmarks] = useState<BookmarkInfo[] | null>(null);
	const [selectedBookmarkId, setSelectedBookmarkId] = useState<string>();
	const [sortColumn, sortOrder, handleColumnClick] =
		useTableSort<AssignmentOverviewTableColumns>('updated_at');
	const [filterString, setFilterString] = useState<string>('');

	const tableColumns = useMemo(() => GET_ADD_BOOKMARK_FRAGMENT_COLUMNS(), []);

	const fetchBookmarks = useCallback(async () => {
		try {
			if (!user) {
				throw new CustomError('Could not determine authenticated user.');
			}

			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType: TableColumnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;

			const bookmarkInfos = await BookmarksViewsPlaysService.getItemBookmarksForUser(
				user,
				filterString,
				getOrderObject(
					sortColumn,
					sortOrder,
					columnDataType,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				)
			);
			setBookmarks(bookmarkInfos);
		} catch (err) {
			console.error(new CustomError('Failed to get bookmarks', err));
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/modals/add-bookmark-fragment-modal___het-ophalen-van-bladwijzers-is-mislukt'
				),
			});
		}
	}, [tableColumns, user, filterString, sortColumn, sortOrder, t]);

	useEffect(() => {
		if (bookmarks) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [bookmarks, setLoadingInfo]);

	useEffect(() => {
		if (isOpen) {
			fetchBookmarks();
		}
	}, [isOpen, fetchBookmarks]);

	const handleImportToAssignment = () => {
		if (!selectedBookmarkId) {
			ToastService.danger(
				t(
					'assignment/modals/add-bookmark-fragment-modal___gelieve-een-fragment-te-selecteren'
				)
			);
			return;
		}
		addFragmentCallback(selectedBookmarkId);
		(onClose || noop)();
	};

	const handleSelectedBookmarkItemChanged = (selectedIds: (string | number)[]) => {
		setSelectedBookmarkId((selectedIds[0] as string) || undefined);
	};

	const renderFooterActions = () => {
		return (
			<Toolbar spaced>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={t(
									'assignment/modals/add-bookmark-fragment-modal___annuleer'
								)}
								onClick={onClose}
							/>
							<Button
								type="primary"
								label={t(
									'assignment/modals/add-bookmark-fragment-modal___voeg-toe'
								)}
								onClick={handleImportToAssignment}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const renderCell = (bookmark: BookmarkInfo, colKey: keyof BookmarkInfo) => {
		const cellData: any = (bookmark as any)[colKey];

		switch (colKey) {
			case 'contentTitle': {
				const renderTitle = () => (
					<div className="c-content-header c-content-header--small">
						<Flex orientation="horizontal">
							<Thumbnail
								alt="thumbnail"
								category={bookmark.contentType}
								className="m-collection-overview-thumbnail"
								src={bookmark.contentThumbnailPath || undefined}
								showCategoryIcon
							/>
							<Flex center>
								<h3 className="c-content-header__header u-m-0">
									{truncateTableValue(bookmark.contentTitle)}
								</h3>
							</Flex>
						</Flex>
					</div>
				);

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderTitle()}</Spacer>
				) : (
					renderTitle()
				);
			}

			case 'contentCreatedAt':
				return formatDate(cellData);

			// duration does not require specific rendering

			default:
				return cellData;
		}
	};

	const renderModalBody = () => {
		return (
			<>
				<Form type="inline">
					<FormGroup inlineMode="grow">
						<TextInput
							className="c-assignment-overview__search-input"
							icon="filter"
							value={filterString}
							onChange={setFilterString}
							disabled={!bookmarks}
						/>
					</FormGroup>
				</Form>

				<ScrollBar>
					<Table
						columns={tableColumns}
						data={bookmarks || undefined}
						emptyStateMessage={
							filterString
								? t(
										'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
								  )
								: t(
										'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
								  )
						}
						renderCell={(rowData: BookmarkInfo, colKey: string) =>
							renderCell(rowData, colKey as keyof BookmarkInfo)
						}
						rowKey="contentLinkId"
						variant="styled"
						onColumnClick={handleColumnClick as any}
						sortColumn={sortColumn}
						sortOrder={sortOrder}
						useCards={isMobileWidth()}
						showRadioButtons
						selectedItemIds={selectedBookmarkId ? [selectedBookmarkId] : []}
						onSelectionChanged={handleSelectedBookmarkItemChanged}
					/>
				</ScrollBar>

				{renderFooterActions()}
			</>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'assignment/modals/add-bookmark-fragment-modal___fragment-toevoegen-uit-bladwijzers'
			)}
			size="large"
			onClose={onClose}
			scrollable
			className="c-content c-add-fragment-modal"
		>
			<ModalBody>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={bookmarks}
					render={renderModalBody}
				/>
			</ModalBody>
		</Modal>
	);
};

export default AddBookmarkFragmentModal;
