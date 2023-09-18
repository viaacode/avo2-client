import { BlockHeading, Color, sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui';
import { RichEditorState } from '@meemoo/react-components';
import {
	Button,
	ButtonToolbar,
	Container,
	Icon,
	IconName,
	Spacer,
	Table,
	Toolbar,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { get, orderBy } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { CollectionService } from '../../../collection/collection.service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import AssociatedQuickLaneTable, {
	AssociatedQuickLaneTableOrderBy,
} from '../../../quick-lane/components/AssociatedQuickLaneTable';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { RICH_TEXT_EDITOR_OPTIONS_FULL } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import RichTextEditorWrapper from '../../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { QUICK_LANE_DEFAULTS, QuickLaneColumn } from '../../../shared/constants/quick-lane';
import { Lookup_Enum_Relation_Types_Enum } from '../../../shared/generated/graphql-db-types';
import { buildLink, CustomError, navigate } from '../../../shared/helpers';
import { getSubtitles } from '../../../shared/helpers/get-subtitles';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import useTranslation from '../../../shared/hooks/useTranslation';
import { QuickLaneContainingService } from '../../../shared/services/quick-lane-containing.service';
import { RelationService } from '../../../shared/services/relation-service/relation.service';
import { ToastService } from '../../../shared/services/toast-service';
import { QuickLaneUrlObject } from '../../../shared/types';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import DepublishItemModal from '../components/DepublishItemModal/DepublishItemModal';
import { ItemsService } from '../items.service';

type CollectionColumnId = 'title' | 'author' | 'is_public' | 'organization' | 'actions';

/* eslint-disable @typescript-eslint/no-unused-vars */
const columnIdToCollectionPath: { [columnId in CollectionColumnId]: string } = {
	/* eslint-enable @typescript-eslint/no-unused-vars */
	title: 'title',
	author: 'profile.user.last_name',
	is_public: 'is_public',
	organization: 'profile.profile_organizations[0].organization_id',
	actions: '',
};

type ItemDetailProps = RouteComponentProps<{ id: string }>;

const ItemDetail: FunctionComponent<ItemDetailProps> = ({ history, match }) => {
	// Hooks
	const [item, setItem] = useState<Avo.Item.Item | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState<boolean>(false);
	const [isDepublishItemModalOpen, setDepublishItemModalOpen] = useState<boolean>(false);

	const [collectionsContainingItem, setCollectionsContainingItem] = useState<
		Avo.Collection.Collection[]
	>([]);
	const [collectionSortColumn, setCollectionSortColumn] = useState<string>('title');
	const [collectionSortOrder, setCollectionSortOrder] =
		useState<Avo.Search.OrderDirection>('asc');

	const [associatedQuickLanes, setAssociatedQuickLanes] = useState<QuickLaneUrlObject[]>([]);
	const [quickLaneSortColumn, setQuickLaneSortColumn] = useState<string>(
		QUICK_LANE_DEFAULTS.sort_column
	);
	const [quickLaneSortOrder, setQuickLaneSortOrder] = useState<Avo.Search.OrderDirection>('asc');

	const [noteEditorState, setNoteEditorState] = useState<RichEditorState>();

	const { tText, tHtml } = useTranslation();

	const fetchItemById = useCallback(async () => {
		try {
			const itemObj = await ItemsService.fetchItemByUuid(match.params.id);

			const replacedByUuid: string | undefined = get(itemObj, 'relations[0].object');
			if (replacedByUuid && itemObj.relations) {
				itemObj.relations[0].object_meta = await ItemsService.fetchItemByUuid(
					replacedByUuid
				);
			}

			setItem(itemObj);
		} catch (err) {
			console.error(new CustomError('Failed to get item by uuid', err));
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'admin/items/views/item-detail___het-ophalen-van-de-item-info-is-mislukt'
				),
			});
		}
	}, [setItem, setLoadingInfo, tText, match.params.id]);

	const fetchCollectionsByItemExternalId = useCallback(async () => {
		try {
			if (!item) {
				return;
			}
			const colls = await CollectionService.fetchCollectionsByFragmentId(item.external_id);
			setCollectionsContainingItem(colls);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collections containing item', err, {
					item,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/items/views/item-detail___het-ophalen-van-de-collecties-die-dit-item-bevatten-is-mislukt'
				)
			);
		}
	}, [setCollectionsContainingItem, tText, item]);

	const fetchAssociatedQuickLanes = useCallback(async () => {
		try {
			if (!item) {
				return;
			}

			const quickLanes = await QuickLaneContainingService.fetchQuickLanesByContentId(
				item.uid
			);
			setAssociatedQuickLanes(quickLanes);
		} catch (err) {
			console.error(
				new CustomError('Failed to get quick lane urls containing item', err, {
					item,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/items/views/item-detail___het-ophalen-van-de-gedeelde-links-die-naar-dit-fragment-wijzen-is-mislukt'
				)
			);
		}
	}, [setAssociatedQuickLanes, tText, item]);

	useEffect(() => {
		fetchItemById();
	}, [fetchItemById]);

	useEffect(() => {
		if (item) {
			fetchCollectionsByItemExternalId();
			fetchAssociatedQuickLanes();

			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [item, setLoadingInfo, fetchCollectionsByItemExternalId, fetchAssociatedQuickLanes]);

	const toggleItemPublishedState = async () => {
		try {
			setIsConfirmPublishModalOpen(false);
			if (!item) {
				throw new CustomError('The item has not been loaded yet', null, { item });
			}
			if (!item.is_published) {
				await ItemsService.setItemPublishedState(item.uid, !item.is_published);
				await RelationService.deleteRelationsBySubject(
					'item',
					item.uid,
					Lookup_Enum_Relation_Types_Enum.IsReplacedBy
				);
				await ItemsService.setItemDepublishReason(item.uid, null);

				await fetchItemById();
				ToastService.success(
					tHtml('admin/items/views/item-detail___het-item-is-gepubliceerd')
				);
			} else {
				setDepublishItemModalOpen(true);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle is_published state for item', err, { item })
			);
			ToastService.danger(
				tHtml('admin/items/views/item-detail___het-de-publiceren-van-het-item-is-mislukt')
			);
		}
	};

	const navigateToItemDetail = () => {
		if (!item) {
			ToastService.danger(
				tHtml('admin/items/views/item-detail___dit-item-heeft-geen-geldig-pid')
			);
			return;
		}
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, { id: item.external_id });
		redirectToClientPage(link, history);
	};

	const navigateToCollectionDetail = (id: string) => {
		const link = buildLink(APP_PATH.COLLECTION_DETAIL.route, { id });
		redirectToClientPage(link, history);
	};

	const handleCollectionColumnClick = (columnId: CollectionColumnId) => {
		const sortOrder = collectionSortOrder === 'asc' ? 'desc' : 'asc'; // toggle

		setCollectionSortColumn(columnId);
		setCollectionSortOrder(sortOrder);

		setCollectionsContainingItem(
			orderBy(
				collectionsContainingItem,
				[(coll) => get(coll, columnIdToCollectionPath[columnId])],
				[sortOrder]
			)
		);
	};

	const handleQuickLaneColumnClick = (id: QuickLaneColumn) => {
		const sortOrder = quickLaneSortOrder === 'asc' ? 'desc' : 'asc'; // toggle

		setQuickLaneSortColumn(id);
		setQuickLaneSortOrder(sortOrder);

		setAssociatedQuickLanes(
			orderBy(
				associatedQuickLanes,
				[(col) => get(col, AssociatedQuickLaneTableOrderBy[id] || id)],
				[sortOrder]
			)
		);
	};

	const saveNotes = async () => {
		try {
			if (!item) {
				return;
			}
			await ItemsService.setItemNotes(
				item.uid,
				sanitizeHtml(
					(noteEditorState ? noteEditorState.toHTML() : (item as any).note) || '',
					SanitizePreset.link
				) || null
			);
			ToastService.success(tHtml('admin/items/views/item-detail___opmerkingen-opgeslagen'));
		} catch (err) {
			console.error(new CustomError('Failed to save item notes', err, { item }));
			ToastService.danger(
				tHtml('admin/items/views/item-detail___het-opslaan-van-de-opmerkingen-is-mislukt')
			);
		}
	};

	const renderCollectionCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: CollectionColumnId
	): ReactNode => {
		switch (columnId) {
			case 'author': {
				const user = rowData.profile?.user;
				if (!user) {
					return '-';
				}
				return truncateTableValue(`${user.first_name} ${user.last_name}`);
			}

			case 'organization':
				return get(rowData, 'profile.organisation.name', '-');

			case 'is_public':
				return (
					<div
						title={
							rowData.is_public
								? tText(
										'collection/components/collection-or-bundle-overview___publiek'
								  )
								: tText(
										'collection/components/collection-or-bundle-overview___niet-publiek'
								  )
						}
					>
						<Icon name={rowData.is_public ? IconName.unlock3 : IconName.lock} />
					</div>
				);

			case 'actions':
				return (
					<Button
						type="borderless"
						icon={IconName.eye}
						title={tText(
							'admin/items/views/item-detail___ga-naar-de-collectie-detail-pagina'
						)}
						ariaLabel={tText(
							'admin/items/views/item-detail___ga-naar-de-collectie-detail-pagina'
						)}
						onClick={(evt) => {
							evt.stopPropagation();
							navigateToCollectionDetail(rowData.id as string);
						}}
					/>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderContainingCollectionTable = () => (
		<>
			<Spacer margin={['top-extra-large', 'bottom-small']}>
				<BlockHeading type="h2">
					{tText('admin/items/views/item-detail___collecties-die-dit-item-bevatten')}
				</BlockHeading>
			</Spacer>
			{!!collectionsContainingItem && !!collectionsContainingItem.length ? (
				<Table
					columns={[
						{
							label: tText('admin/items/views/item-detail___titel'),
							id: 'title',
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						{
							label: tText('admin/items/views/item-detail___auteur'),
							id: 'author',
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						{
							label: 'Organisatie',
							id: 'organization',
							sortable: false,
						},
						{
							label: tText('admin/items/items___publiek'),
							id: 'is_public',
							sortable: true,
							dataType: TableColumnDataType.boolean,
						},
						{
							tooltip: tText('admin/items/views/item-detail___acties'),
							id: 'actions',
							sortable: false,
						},
					]}
					data={collectionsContainingItem}
					emptyStateMessage={tText(
						'admin/items/views/item-detail___dit-item-is-in-geen-enkele-collectie-opgenomen'
					)}
					onColumnClick={handleCollectionColumnClick as any}
					onRowClick={(coll) => navigateToCollectionDetail(coll.id)}
					renderCell={renderCollectionCell as any}
					sortColumn={collectionSortColumn}
					sortOrder={collectionSortOrder}
					variant="bordered"
					rowKey="id"
				/>
			) : (
				tText(
					'admin/items/views/item-detail___dit-item-is-in-geen-enkele-collectie-opgenomen'
				)
			)}
		</>
	);

	const renderAssociatedQuickLaneTable = () => (
		<>
			<Spacer margin={['top-extra-large', 'bottom-small']}>
				<BlockHeading type="h2">
					{tText('admin/items/views/item-detail___gedeelde-links-naar-dit-fragment')}
				</BlockHeading>
			</Spacer>
			{!!associatedQuickLanes && !!associatedQuickLanes.length ? (
				<AssociatedQuickLaneTable
					data={associatedQuickLanes}
					emptyStateMessage={tText(
						'admin/items/views/item-detail___dit-fragment-is-nog-niet-gedeeld'
					)}
					onColumnClick={handleQuickLaneColumnClick as any}
					sortColumn={quickLaneSortColumn}
					sortOrder={quickLaneSortOrder}
				/>
			) : (
				tText('admin/items/views/item-detail___dit-fragment-is-nog-niet-gedeeld')
			)}
		</>
	);

	const renderItemDetail = () => {
		if (!item) {
			console.error(
				new CustomError(
					'Failed to load item because render function is called before item was fetched'
				)
			);
			return;
		}

		const replacementTitle = get(item, 'relations[0].object_meta.title');
		const replacementExternalId = get(item, 'relations[0].object_meta.external_id');
		const replacementUuid = get(item, 'relations[0].object_meta.uid');

		const subtitles = getSubtitles(item);

		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Table horizontal variant="invisible" className="c-table_detail-page">
						<tbody>
							{renderSimpleDetailRows(item, [
								['uid', tText('admin/items/views/item-detail___av-o-uuid')],
								['external_id', tText('admin/items/views/item-detail___pid')],
								['is_published', tText('admin/items/views/item-detail___pubiek')],
								['is_deleted', tText('admin/items/views/item-detail___verwijderd')],
							])}
							{renderDateDetailRows(item, [
								[
									'created_at',
									tText('admin/items/views/item-detail___aangemaakt-op'),
								],
								[
									'updated_at',
									tText('admin/items/views/item-detail___aangepast-op'),
								],
								['issued', tText('admin/items/views/item-detail___uitgegeven-op')],
								[
									'published_at',
									tText('admin/items/views/item-detail___gepubliceert-op'),
								],
								[
									'publish_at',
									tText('admin/items/views/item-detail___te-publiceren-op'),
								],
								[
									'depublish_at',
									tText('admin/items/views/item-detail___te-depubliceren-op'),
								],
							])}
							{renderSimpleDetailRows(item, [
								[
									'depublish_reason',
									tText('admin/items/views/item-detail___reden-tot-depubliceren'),
								],
							])}
							{renderDetailRow(
								replacementUuid ? (
									<Link
										to={buildLink(ADMIN_PATH.ITEM_DETAIL, {
											id: replacementUuid,
										})}
									>{`${replacementTitle} (${replacementExternalId})`}</Link>
								) : (
									'-'
								),
								tText('admin/items/views/item-detail___vervangen-door')
							)}
							{renderSimpleDetailRows(item, [
								[
									'view_counts_aggregate.aggregate.sum.count',
									tText('admin/items/views/item-detail___views'),
								],
							])}
							{renderDetailRow(
								subtitles
									? subtitles.map((subtitle) => (
											<a key={subtitle.id} href={subtitle.src}>
												{subtitle.label}
											</a>
									  ))
									: '-',
								tText('admin/items/views/item-detail___ondertitels')
							)}
							{renderDetailRow(
								<>
									<Spacer margin="right-small">
										<Spacer margin={['top']}>
											<div style={{ backgroundColor: Color.White }}>
												<RichTextEditorWrapper
													id="note"
													controls={RICH_TEXT_EDITOR_OPTIONS_FULL}
													fileType="ITEM_NOTE_IMAGE"
													initialHtml={item.note || undefined}
													state={noteEditorState}
													onChange={setNoteEditorState}
												/>
											</div>
										</Spacer>
										<Toolbar>
											<ToolbarRight>
												<Button
													label={tText(
														'admin/items/views/item-detail___opmerkingen-opslaan'
													)}
													onClick={saveNotes}
												/>
											</ToolbarRight>
										</Toolbar>
									</Spacer>
								</>,
								tText('admin/items/views/item-detail___opmerkingen')
							)}
						</tbody>
					</Table>
					{renderContainingCollectionTable()}
					{renderAssociatedQuickLaneTable()}
					<DeleteObjectModal
						title={
							item.is_published
								? tText('admin/items/views/item-detail___depubliceren')
								: tText('admin/items/views/item-detail___publiceren')
						}
						body={
							item.is_published
								? tText(
										'admin/items/views/item-detail___weet-je-zeker-dat-je-dit-item-wil-depubliceren'
								  )
								: tText(
										'admin/items/views/item-detail___weet-je-zeker-dat-je-dit-item-wil-publiceren'
								  )
						}
						confirmLabel={
							item.is_published
								? tText('admin/items/views/item-detail___depubliceren')
								: 'Publiceren'
						}
						isOpen={isConfirmPublishModalOpen}
						onClose={() => setIsConfirmPublishModalOpen(false)}
						confirmCallback={toggleItemPublishedState}
					/>
					<DepublishItemModal
						item={item}
						isOpen={isDepublishItemModalOpen}
						onClose={() => {
							setDepublishItemModalOpen(false);
							fetchItemById();
						}}
					/>
				</Container>
			</Container>
		);
	};

	const renderItemDetailPage = () => {
		if (!item) {
			return null;
		}
		return (
			<AdminLayout
				onClickBackButton={() => navigate(history, ADMIN_PATH.ITEMS_OVERVIEW)}
				pageTitle={`${tText('admin/items/views/item-detail___item-details')}: ${
					item.title
				}`}
				size="large"
			>
				<AdminLayoutTopBarRight>
					{!!item && (
						<ButtonToolbar>
							<Button
								type={item.is_published ? 'danger' : 'primary'}
								label={
									item.is_published
										? tText('admin/items/views/item-detail___depubliceren')
										: tText('admin/items/views/item-detail___publiceren')
								}
								ariaLabel={
									item.is_published
										? tText(
												'admin/items/views/item-detail___depubliceer-dit-item'
										  )
										: tText(
												'admin/items/views/item-detail___publiceer-dit-item'
										  )
								}
								title={
									item.is_published
										? tText(
												'admin/items/views/item-detail___depubliceer-dit-item'
										  )
										: tText(
												'admin/items/views/item-detail___publiceer-dit-item'
										  )
								}
								onClick={() => {
									if (item.is_published) {
										setIsConfirmPublishModalOpen(true);
									} else {
										toggleItemPublishedState();
									}
								}}
							/>
							<Button
								label={tText(
									'admin/items/views/item-detail___bekijk-item-in-de-website'
								)}
								onClick={navigateToItemDetail}
							/>
						</ButtonToolbar>
					)}
				</AdminLayoutTopBarRight>
				<AdminLayoutBody>{renderItemDetail()}</AdminLayoutBody>
			</AdminLayout>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(item, 'title'),
						tText('admin/items/views/item-detail___item-beheer-detail-pagina-titel')
					)}
				</title>
				<meta name="description" content={get(item, 'description') || ''} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={item}
				render={renderItemDetailPage}
			/>
		</>
	);
};

export default ItemDetail;
