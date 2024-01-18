import { BlockHeading, Color, sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui';
import { RichEditorState } from '@meemoo/react-components';
import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Icon,
	IconName,
	Spacer,
	Spinner,
	Table,
	Toolbar,
	ToolbarRight,
} from '@viaa/avo2-components';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { DeleteObjectModal } from '../../../shared/components';
import { RICH_TEXT_EDITOR_OPTIONS_FULL } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import RichTextEditorWrapper from '../../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { Lookup_Enum_Relation_Types_Enum } from '../../../shared/generated/graphql-db-types';
import { buildLink, CustomError, navigate } from '../../../shared/helpers';
import { getSubtitles } from '../../../shared/helpers/get-subtitles';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import useTranslation from '../../../shared/hooks/useTranslation';
import { RelationService } from '../../../shared/services/relation-service/relation.service';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import DepublishItemModal from '../components/DepublishItemModal/DepublishItemModal';
import { useGetItemUsedBy } from '../hooks/useGetItemUsedBy';
import { useGetItemWithRelations } from '../hooks/useGetItemWithRelations';
import {
	GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS,
	GET_ITEM_USED_BY_QUICK_LANES,
} from '../items.const';
import { ItemsService } from '../items.service';
import { ItemUsedByColumnId, ItemUsedByEntry } from '../items.types';

type ItemDetailProps = RouteComponentProps<{ id: string }>;

const ItemDetail: FunctionComponent<ItemDetailProps> = ({ history, match }) => {
	const itemUuid = match.params.id;
	// Hooks
	const [queryParams, setQueryParams] = useQueryParams({
		sortProp: StringParam,
		sortDirection: StringParam,
	});
	const {
		data: item,
		isLoading: itemIsLoading,
		refetch: refetchItem,
	} = useGetItemWithRelations(itemUuid);
	const { data: itemUsedBy, isError: itemUsedByIsError } = useGetItemUsedBy(
		{
			itemUuid: itemUuid as string,
			sortProp: queryParams.sortProp || undefined,
			sortDirection: queryParams.sortDirection || undefined,
		},
		{ enabled: !!itemUuid }
	);

	const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState<boolean>(false);
	const [isDepublishItemModalOpen, setDepublishItemModalOpen] = useState<boolean>(false);

	const [noteEditorState, setNoteEditorState] = useState<RichEditorState>();

	const { tText, tHtml } = useTranslation();

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

				await refetchItem();
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

	const navigateToAssignmentDetail = (id: string) => {
		const link = buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id });
		redirectToClientPage(link, history);
	};

	const handleColumnClick = (columnId: string) => {
		const sortDirection = queryParams.sortDirection === 'asc' ? 'desc' : 'asc'; // toggle

		setQueryParams({
			sortProp: columnId,
			sortDirection,
		});
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

	const renderCell = (
		rowData: ItemUsedByEntry,
		columnId: ItemUsedByColumnId & 'actions'
	): ReactNode => {
		switch (columnId) {
			case 'owner': {
				return truncateTableValue(rowData.owner || '-');
			}

			case 'organisation':
				return rowData.organisation || '-';

			case 'isPublic':
				return (
					<div
						title={
							rowData.isPublic
								? tText(
										'collection/components/collection-or-bundle-overview___publiek'
								  )
								: tText(
										'collection/components/collection-or-bundle-overview___niet-publiek'
								  )
						}
					>
						<Icon name={rowData.isPublic ? IconName.unlock3 : IconName.lock} />
					</div>
				);

			case 'actions': {
				if (rowData.type === 'QUICK_LANE') {
					return null; // quick lanes do not have a detail page
				}
				const label =
					rowData.type === 'COLLECTION'
						? tText(
								'admin/items/views/item-detail___ga-naar-de-collectie-detail-pagina'
						  )
						: tText(
								'admin/items/views/item-detail___ga-naar-de-opdracht-detail-pagina'
						  );
				return (
					<Button
						type="borderless"
						icon={IconName.eye}
						title={label}
						ariaLabel={label}
						onClick={(evt) => {
							evt.stopPropagation();
							if (rowData.type === 'COLLECTION') {
								navigateToCollectionDetail(rowData.id as string);
							} else {
								navigateToAssignmentDetail(rowData.id as string);
							}
						}}
					/>
				);
			}

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
			{itemUsedBy?.collections?.length ? (
				<Table
					columns={GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS()}
					data={itemUsedBy.collections}
					onColumnClick={handleColumnClick as any}
					onRowClick={(coll) => navigateToCollectionDetail(coll.id)}
					renderCell={renderCell as any}
					sortColumn={queryParams.sortProp || undefined}
					sortOrder={queryParams.sortDirection as SearchOrderDirection | undefined}
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

	const renderContainingAssignmentTable = () => (
		<>
			<Spacer margin={['top-extra-large', 'bottom-small']}>
				<BlockHeading type="h2">
					{tText('admin/items/views/item-detail___opdrachten-die-dit-item-bevatten')}
				</BlockHeading>
			</Spacer>
			{itemUsedBy?.assignments?.length ? (
				<Table
					columns={GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS()}
					data={itemUsedBy.assignments}
					onColumnClick={handleColumnClick as any}
					onRowClick={(coll) => navigateToAssignmentDetail(coll.id)}
					renderCell={renderCell as any}
					sortColumn={queryParams.sortProp || undefined}
					sortOrder={queryParams.sortDirection as SearchOrderDirection | undefined}
					variant="bordered"
					rowKey="id"
				/>
			) : (
				tText(
					'admin/items/views/item-detail___dit-item-is-in-geen-enkele-opdracht-opgenomen'
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
			{itemUsedBy?.quickLanes?.length ? (
				<>
					<Table
						columns={GET_ITEM_USED_BY_QUICK_LANES()}
						data={itemUsedBy.quickLanes}
						onColumnClick={handleColumnClick}
						renderCell={renderCell as any}
						sortColumn={queryParams.sortProp || undefined}
						sortOrder={queryParams.sortDirection as SearchOrderDirection | undefined}
						variant="bordered"
						rowKey="id"
					/>
				</>
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

		const itemMeta = item?.relations?.[0]?.object_meta;
		const replacementTitle = itemMeta?.title;
		const replacementExternalId = itemMeta?.external_id;
		const replacementUuid = itemMeta?.uid;

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
					{itemUsedByIsError &&
						tText(
							'admin/items/views/item-detail___het-ophalen-van-de-collecties-opdrachten-en-sneldeel-links-die-dit-item-gebruiken-is-mislukt'
						)}
					{renderContainingCollectionTable()}
					{renderContainingAssignmentTable()}
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
						onClose={async () => {
							setDepublishItemModalOpen(false);
							await refetchItem();
						}}
					/>
				</Container>
			</Container>
		);
	};

	const renderItemDetailPage = () => {
		if (itemIsLoading) {
			return (
				<Container mode="vertical">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Container>
			);
		}
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
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						item?.title,
						tText('admin/items/views/item-detail___item-beheer-detail-pagina-titel')
					)}
				</title>
				<meta name="description" content={item?.description || ''} />
			</Helmet>
			{renderItemDetailPage()}
		</>
	);
};

export default ItemDetail;
