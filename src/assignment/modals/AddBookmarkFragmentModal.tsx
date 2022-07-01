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

// Column definitions
const GET_ADD_BOOKMARK_FRAGMENT_COLUMNS = (): TableColumn[] => [
	{
		id: 'contentTitle',
		label: i18n.t('Titel'),
		sortable: true,
		dataType: 'string',
	},
	{
		id: 'contentDuration',
		label: i18n.t('Speelduur'),
		sortable: true,
		dataType: 'string',
	},
	{
		id: 'contentCreatedAt',
		label: i18n.t('Laatst toegevoegd'),
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

interface AddBookmarkFragmentModal {
	user: Avo.User.User;
	isOpen: boolean;
	onClose?: () => void;
	addFragmentCallback: (fragmentId: string) => void;
}

const AddBookmarkFragmentModal: FunctionComponent<AddBookmarkFragmentModal> = ({
	user,
	isOpen,
	onClose,
	addFragmentCallback,
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
			console.error(new CustomError('Failed to get assignments', err));
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/modals/import-to-assignment-modal___het-ophalen-van-bestaande-opdrachten-is-mislukt'
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
			ToastService.danger(t('Gelieve een fragment te selecteren'));
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
							<Button type="secondary" label={t('Annuleer')} onClick={onClose} />
							<Button
								type="primary"
								label={t('Voeg toe')}
								onClick={handleImportToAssignment}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	// very similar to table in assignment overview, but with differences
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
				{renderFooterActions()}
			</>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t('Fragment toevoegen uit bladwijzers')}
			size="large"
			onClose={onClose}
			scrollable
			className="c-content"
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
