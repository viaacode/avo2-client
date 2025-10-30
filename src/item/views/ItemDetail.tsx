import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Dropdown,
	DropdownContent,
	Flex,
	Grid,
	Header,
	HeaderBottomRowLeft,
	HeaderBottomRowRight,
	HeaderContentType,
	HeaderMiddleRowRight,
	Icon,
	IconName,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Spacer,
	Table,
	Thumbnail,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import { get, isNil, noop } from 'lodash-es';
import React, {
	type FC,
	type ReactNode,
	type ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useMatch, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { JsonParam, StringParam, useQueryParam, useQueryParams } from 'use-query-params';

import { ITEMS_PATH } from '../../admin/items/items.const';
import { ItemsService } from '../../admin/items/items.service';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { AssignmentService } from '../../assignment/assignment.service';
import { ConfirmImportToAssignmentWithResponsesModal } from '../../assignment/modals/ConfirmImportToAssignmentWithResponsesModal';
import { ImportToAssignmentModal } from '../../assignment/modals/ImportToAssignmentModal';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { CONTENT_TYPE_TRANSLATIONS, ContentTypeNumber } from '../../collection/collection.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ALL_SEARCH_FILTERS, SearchFilter } from '../../search/search.const';
import { type FilterState } from '../../search/search.types';
import { FragmentShareModal } from '../../shared/components/FragmentShareModal/FragmentShareModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { LANGUAGES, ROUTE_PARTS } from '../../shared/constants';
import { buildLink } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error';
import {
	defaultRenderBookmarkButton,
	type renderBookmarkButtonProps,
} from '../../shared/helpers/default-render-bookmark-button';
import {
	defaultRenderBookmarkCount,
	type renderBookmarkCountProps,
} from '../../shared/helpers/default-render-bookmark-count';
import {
	defaultGoToDetailLink,
	defaultRenderDetailLink,
} from '../../shared/helpers/default-render-detail-link';
import { defaultRenderInteractiveTour } from '../../shared/helpers/default-render-interactive-tour';
import {
	defaultGoToSearchLink,
	defaultRenderSearchLink,
} from '../../shared/helpers/default-render-search-link';
import { reorderDate } from '../../shared/helpers/formatters';
import { renderSearchLinks } from '../../shared/helpers/link';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { stringsToTagList } from '../../shared/helpers/strings-to-taglist';
import { stripRichTextParagraph } from '../../shared/helpers/strip-rich-text-paragraph';
import { useCutModal } from '../../shared/hooks/use-cut-modal';
import { useTranslation } from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import { embedFlowAtom } from '../../shared/store/ui.store';
import { type UnpublishableItem } from '../../shared/types';
import { ItemVideoDescription } from '../components/ItemVideoDescription';
import { AddToCollectionModal } from '../components/modals/AddToCollectionModal';
import { CutFragmentForAssignmentModal } from '../components/modals/CutFragmentForAssignmentModal';
import { ReportItemModal } from '../components/modals/ReportItemModal';
import { RELATED_ITEMS_AMOUNT } from '../item.const';
import { type ItemTrimInfo } from '../item.types';

import './ItemDetail.scss';

interface ItemDetailProps {
	id?: string; // Item id when component needs to be used inside another component and the id cannot come from the url (itemId)
	renderDetailLink?: (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType,
		className?: string
	) => ReactNode;
	renderSearchLink?: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode;
	goToDetailLink?: (id: string, type: Avo.Core.ContentType) => void;
	goToSearchLink?: (newFilters: FilterState) => void;
	enabledMetaData?: SearchFilter[];
	/**
	 * Render related objects: only items (video/audio) or all types: video/audio/collections/bundels
	 * Pupils can only see items
	 */
	relatedObjectTypes?: ObjectTypesAll;
	renderActionButtons?: (item: Avo.Item.Item) => ReactNode;
	renderBookmarkButton?: (props: renderBookmarkButtonProps) => ReactNode;
	renderBookmarkCount?: (props: renderBookmarkCountProps) => ReactNode;
	renderInteractiveTour?: () => ReactNode;
}

const ITEM_ACTIONS = {
	createAssignment: 'createAssignment',
	importToAssignment: 'importToAssignment',
};

export const ItemDetail: FC<ItemDetailProps> = ({
	id,
	renderDetailLink = defaultRenderDetailLink,
	renderSearchLink = defaultRenderSearchLink,
	goToDetailLink,
	goToSearchLink,
	enabledMetaData = ALL_SEARCH_FILTERS,
	relatedObjectTypes = ObjectTypesAll.items,
	renderActionButtons,
	renderBookmarkButton = defaultRenderBookmarkButton,
	renderBookmarkCount = defaultRenderBookmarkCount,
	renderInteractiveTour = defaultRenderInteractiveTour,
}) => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(ITEMS_PATH.ITEM_DETAIL);
	const itemId = id || match?.params.id;
	const commonUser = useAtomValue(commonUserAtom);
	const isSmartSchoolEmbedFlow = useAtomValue(embedFlowAtom);

	goToDetailLink = goToDetailLink || defaultGoToDetailLink(navigateFunc);
	goToSearchLink = goToSearchLink || defaultGoToSearchLink(navigateFunc);

	const [cuePoint] = useQueryParam('t', StringParam);
	const [cutButton, cutModal] = useCutModal();

	const [item, setItem] = useState<Avo.Item.Item | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false);
	const [isAddToFragmentModalOpen, setIsAddToFragmentModalOpen] = useState(false);
	const [isReportItemModalOpen, setIsReportItemModalOpen] = useState(false);
	const [isShareFragmentModalOpen, setIsShareFragmentModalOpen] = useState(false);
	const [relatedItems, setRelatedItems] = useState<Avo.Search.ResultItem[] | null>(null);
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const [isCreateAssignmentDropdownOpen, setIsCreateAssignmentDropdownOpen] =
		useState<boolean>(false);
	const [isImportToAssignmentModalOpen, setIsImportToAssignmentModalOpen] =
		useState<boolean>(false);
	const [
		isConfirmImportToAssignmentWithResponsesModalOpen,
		setIsConfirmImportToAssignmentWithResponsesModalOpen,
	] = useState<boolean>(false);
	const [assignmentId, setAssignmentId] = useState<string>();
	const [filterState] = useQueryParams({
		filters: JsonParam,
	});

	const retrieveRelatedItems = useCallback(
		(currentItemId: string, limit: number) => {
			getRelatedItems(
				currentItemId,
				ObjectTypes.items,
				relatedObjectTypes,
				limit,
				(filterState as FilterState).filters || {}
			)
				.then(setRelatedItems)
				.catch((err) => {
					console.error('Failed to get related items', err, {
						currentItemId,
						limit,
						index: 'items',
					});
					ToastService.danger(
						tHtml('item/views/item___het-ophalen-van-de-gerelateerde-items-is-mislukt')
					);
				});
		},
		[filterState, relatedObjectTypes, tHtml]
	);

	const checkPermissionsAndGetItem = useCallback(async () => {
		try {
			if (!itemId) {
				return;
			}
			if (
				!(
					PermissionService.hasPerm(
						commonUser,
						PermissionName.VIEW_ANY_PUBLISHED_ITEMS
					) ||
					(PermissionService.hasPerm(commonUser, PermissionName.SEARCH_IN_ASSIGNMENT) &&
						location.pathname.includes(`/${ROUTE_PARTS.assignments}/`))
				)
			) {
				const isPupil = [
					SpecialUserGroupId.PupilSecondary,
					SpecialUserGroupId.PupilElementary,
				]
					.map(String)
					.includes(String(commonUser?.userGroup?.id));

				if (isPupil) {
					setLoadingInfo({
						state: 'error',
						message: tHtml(
							'item/views/item___je-hebt-geen-rechten-om-dit-item-te-bekijken-leerling'
						),
						icon: IconName.lock,
					});
				} else {
					setLoadingInfo({
						state: 'error',
						message: tHtml(
							'item/views/item___je-hebt-geen-rechten-om-dit-item-te-bekijken'
						),
						icon: IconName.lock,
					});
				}
				return;
			}

			const itemObj: UnpublishableItem = await ItemsService.fetchItemByExternalId(itemId);
			if (!itemObj) {
				setLoadingInfo({
					state: 'error',
					message: tHtml('item/views/item___dit-item-werd-niet-gevonden'),
					icon: IconName.search,
				});
				return;
			}

			if (itemObj.depublish_reason) {
				const depublishReason = stripRichTextParagraph(itemObj.depublish_reason);
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'item/views/item-detail___dit-item-werdt-gedepubliceerd-met-volgende-reden',
						{ depublishReason }
					),
					icon: IconName.cameraOff,
				});
				return;
			}

			if (itemObj.replacement_for) {
				// Item was replaced by another item
				// We should reload the page, to update the url
				goToDetailLink?.(itemObj.external_id, 'video');
				return;
			}

			BookmarksViewsPlaysService.action('view', 'item', itemObj.uid, commonUser).then(noop);
			trackEvents(
				{
					object: itemId,
					object_type: 'item',
					action: 'view',
				},
				commonUser
			);

			retrieveRelatedItems(itemId, RELATED_ITEMS_AMOUNT);

			try {
				const counts = await BookmarksViewsPlaysService.getItemCounts(
					(itemObj as any).uid,
					commonUser
				);
				setBookmarkViewPlayCounts(counts);
			} catch (err) {
				console.error(
					new CustomError('Failed to get getItemCounts', err, {
						uuid: (itemObj as any).uid,
					})
				);
				ToastService.danger(
					tHtml(
						'item/views/item-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
					)
				);
			}

			setItem(itemObj);
		} catch (err) {
			console.error(
				new CustomError('Failed to check permissions or get item from graphql', err, {
					commonUser,
					itemId,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml('item/views/item-detail___het-ophalen-van-het-item-is-mislukt'),
			});
		}
		// Avoid calling this function too many times
		// TODO switch fetching to react-query so these called are cached
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemId, setItem, tText, history, commonUser]);

	useEffect(() => {
		if (item) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [item, setLoadingInfo]);

	/**
	 * Load item from database
	 */
	useEffect(() => {
		checkPermissionsAndGetItem().then(noop);
	}, [checkPermissionsAndGetItem]);

	const toggleBookmark = async () => {
		try {
			await BookmarksViewsPlaysService.toggleBookmark(
				(item as any).uid,
				commonUser,
				'item',
				bookmarkViewPlayCounts.isBookmarked
			);

			setBookmarkViewPlayCounts({
				...bookmarkViewPlayCounts,
				isBookmarked: !bookmarkViewPlayCounts.isBookmarked,
			});
			ToastService.success(
				bookmarkViewPlayCounts.isBookmarked
					? tHtml('collection/views/collection-detail___de-bladwijzer-is-verwijderd')
					: tHtml('collection/views/collection-detail___de-bladwijzer-is-aangemaakt')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					commonUser,
					itemId: (item as any).uid,
					type: 'item',
					isBookmarked: bookmarkViewPlayCounts.isBookmarked,
				})
			);
			ToastService.danger(
				bookmarkViewPlayCounts.isBookmarked
					? tHtml('item/views/item-detail___het-verwijderen-van-de-bladwijzer-is-mislukt')
					: tHtml('item/views/item-detail___het-aanmaken-van-de-bladwijzer-is-mislukt')
			);
		}
	};

	const renderRelatedItem = (relatedItem: Avo.Search.ResultItem) => {
		const englishContentType: Avo.ContentType.English =
			CONTENT_TYPE_TRANSLATIONS[relatedItem.administrative_type || 'video'];

		return (
			<MediaCard
				category={englishContentType}
				orientation="horizontal"
				title={relatedItem.dc_title}
			>
				<MediaCardThumbnail>
					<Thumbnail
						category={englishContentType}
						src={relatedItem.thumbnail_path}
						showCategoryIcon
					/>
				</MediaCardThumbnail>
				<MediaCardMetaData>
					<MetaData category={englishContentType}>
						<MetaDataItem label={relatedItem.original_cp || ''} />
					</MetaData>
				</MediaCardMetaData>
			</MediaCard>
		);
	};

	const renderRelatedItems = () => {
		if (relatedItems && relatedItems.length) {
			return relatedItems.map((relatedItem) => {
				return (
					<li key={`related-item-${relatedItem.id}`}>
						{renderDetailLink(
							renderRelatedItem(relatedItem),
							relatedItem.id,
							relatedItem.administrative_type,
							'a-link__no-styles'
						)}
					</li>
				);
			});
		}
		return null;
	};

	const createNewAssignment = async (
		source: (Avo.Item.Item & { start_oc?: number | null; end_oc?: number | null }) | null = item
	) => {
		if (!source || !commonUser) {
			return;
		}

		const assignmentId = await AssignmentService.createAssignmentFromFragment(
			commonUser,
			source
		);

		navigateFunc(buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }));
	};

	const onImportToAssignment = async (importToAssignmentId: string): Promise<void> => {
		if (!commonUser) {
			console.error('User is not logged in');
			return;
		}
		setAssignmentId(importToAssignmentId);

		// check if assignment has responses. If so: show additional confirmation modal
		const responses = await AssignmentService.getAssignmentResponses(importToAssignmentId);
		if (responses.length > 0) {
			setIsConfirmImportToAssignmentWithResponsesModalOpen(true);
		} else {
			setIsAddToFragmentModalOpen(true);
		}
	};

	const onConfirmImportAssignment = () => {
		if (!assignmentId) {
			return;
		}
		setIsConfirmImportToAssignmentWithResponsesModalOpen(false);
		setIsAddToFragmentModalOpen(true);
	};

	const doImportToAssignment = async (itemTrimInfo?: ItemTrimInfo): Promise<void> => {
		setIsAddToFragmentModalOpen(false);
		if (item && assignmentId) {
			await AssignmentService.importFragmentToAssignment(item, assignmentId, itemTrimInfo);
			ToastService.success(
				tHtml('item/views/item-detail___het-fragment-is-toegevoegd-aan-de-opdracht')
			);
		} else {
			ToastService.danger(
				tHtml(
					'item/views/item-detail___het-fragment-kon-niet-worden-toegevoegd-aan-de-opdracht'
				)
			);
		}
	};

	const executeAction = async (item: ReactText) => {
		setIsCreateAssignmentDropdownOpen(false);
		switch (item) {
			case ITEM_ACTIONS.createAssignment:
				await createNewAssignment();
				break;

			case ITEM_ACTIONS.importToAssignment:
				setIsImportToAssignmentModalOpen(true);
				break;

			default:
				console.warn(`An unhandled action "${item}" was executed without a binding.`);
				return null;
		}
	};

	const renderEducationLevels = (item: Avo.Item.Item) => {
		if (
			!item.external_id ||
			!item.lom_context ||
			!enabledMetaData.includes(SearchFilter.educationLevel)
		) {
			return null;
		}
		return (
			<Table
				horizontal
				untable
				className={clsx('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{tText('item/views/item___geschikt-voor')}</th>
						<td>
							{renderSearchLinks(
								renderSearchLink,
								item.external_id,
								SearchFilter.educationLevel,
								item.lom_context
							)}
						</td>
					</tr>
				</tbody>
			</Table>
		);
	};

	const renderEducationDegrees = (item: Avo.Item.Item) => {
		if (
			!item.external_id ||
			!item.lom_typical_age_range ||
			!enabledMetaData.includes(SearchFilter.educationDegree)
		) {
			return null;
		}
		return (
			<Table
				horizontal
				untable
				className={clsx('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{tText('item/views/item-detail___onderwijsgraad')}</th>
						<td>
							{renderSearchLinks(
								renderSearchLink,
								item.external_id,
								SearchFilter.educationDegree,
								item.lom_typical_age_range
							)}
						</td>
					</tr>
				</tbody>
			</Table>
		);
	};

	const renderSubjects = (item: Avo.Item.Item) => {
		if (
			!item.external_id ||
			!item.lom_classification ||
			!enabledMetaData.includes(SearchFilter.subject)
		) {
			return null;
		}
		return (
			<Table
				horizontal
				untable
				className={clsx('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{tText('item/views/item___vakken')}</th>
						<td>
							{renderSearchLinks(
								renderSearchLink,
								item.external_id,
								SearchFilter.subject,
								item.lom_classification
							)}
						</td>
					</tr>
				</tbody>
			</Table>
		);
	};

	const renderThemas = (item: Avo.Item.Item) => {
		if (!item.external_id || !item.lom_thema || !enabledMetaData.includes(SearchFilter.thema)) {
			return null;
		}
		return (
			<Table
				horizontal
				untable
				className={clsx('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{tText('item/views/item-detail___themas')}</th>
						<td>
							{renderSearchLinks(
								renderSearchLink,
								item.external_id,
								SearchFilter.thema,
								item.lom_thema
							)}
						</td>
					</tr>
				</tbody>
			</Table>
		);
	};

	const renderKeywords = (item: Avo.Item.Item) => {
		if (!item.lom_keywords?.length || !enabledMetaData.includes(SearchFilter.keyword)) {
			return null;
		}
		return (
			<Table
				horizontal
				untable
				className={clsx('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{tText('item/views/item___trefwoorden')}</th>
						<td>
							{stringsToTagList(
								item.lom_keywords || [],
								null,
								(tagId: string | number) =>
									goToSearchLink?.({
										filters: {
											keyword: [tagId as string],
										},
									})
							)}
						</td>
					</tr>
					{/*<tr>*/}
					{/*<th scope="row">{tText('item/views/item___klascement')}</th>*/}
					{/*<td>*/}
					{/*<a href={'http://www.klascement.be/link_item'}>*/}
					{/*www.klascement.be/link_item*/}
					{/*</a>*/}
					{/*</td>*/}
					{/*</tr>*/}
				</tbody>
			</Table>
		);
	};

	const renderGeneralMetaData = (item: Avo.Item.Item) => {
		return (
			<Table
				horizontal
				untable
				className={clsx('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<Grid tag="tbody">
					{!!item.issued && (
						<Column size="2-5" tag="tr">
							<th scope="row">{tText('item/views/item___publicatiedatum')}</th>
							<td>{reorderDate(item.issued, '/')}</td>
						</Column>
					)}
					{!!item.published_at && (
						<Column size="2-5" tag="tr">
							<th scope="row">{tText('item/views/item___toegevoegd-op')}</th>
							<td>{reorderDate(item.published_at, '/')}</td>
						</Column>
					)}
				</Grid>
				<Grid tag="tbody">
					{!!get(item, 'organisation.name') && (
						<Column size="2-5" tag="tr">
							<th scope="row">{tText('item/views/item___aanbieder')}</th>
							<td>
								{renderSearchLink(item.organisation.name, {
									filters: {
										provider: [item.organisation.name],
									},
								})}
							</td>
						</Column>
					)}
					{!!item.duration && (
						<Column size="2-5" tag="tr">
							<th scope="row">{tText('item/views/item___speelduur')}</th>
							<td>{item.duration}</td>
						</Column>
					)}
				</Grid>
				<Grid tag="tbody">
					{!!item.series && (
						<Column size="2-5" tag="tr">
							<th scope="row">{tText('item/views/item___reeks')}</th>
							<td>
								{renderSearchLink(item.series, {
									filters: { serie: [item.series] },
								})}
							</td>
						</Column>
					)}
					{!!item.lom_languages && !!item.lom_languages.length && (
						<Column size="2-5" tag="tr">
							<th scope="row">{tText('item/views/item___taal')}</th>
							<td>
								{item.lom_languages
									.map((languageCode: string) => LANGUAGES.nl[languageCode])
									.join(', ')}
							</td>
						</Column>
					)}
				</Grid>
			</Table>
		);
	};

	const renderShareButtons = () => {
		if (isSmartSchoolEmbedFlow) {
			return (
				<Button
					className="c-button-smartschool"
					icon={IconName.smartschool}
					label={tText('item/views/item-detail___gebruiken-in-smartschool')}
					ariaLabel={tText('item/views/item-detail___gebruiken-in-smartschool')}
					title={tText('item/views/item-detail___gebruiken-in-smartschool')}
					onClick={() => {
						setIsShareFragmentModalOpen(true);
					}}
				/>
			);
		}

		return (
			<Button
				type="tertiary"
				icon={IconName.share2}
				label={tText('item/views/item-detail___fragment-delen')}
				ariaLabel={tText('item/views/item-detail___fragment-delen')}
				title={tText('item/views/item-detail___fragment-delen')}
				onClick={() => {
					setIsShareFragmentModalOpen(true);
				}}
			/>
		);
	};

	const defaultRenderActionButtons = () => {
		return (
			<div className="c-item-detail__action-buttons">
				<div className="c-item-detail__action-buttons--left">
					{PermissionService.hasPerm(commonUser, PermissionName.CREATE_COLLECTIONS) && (
						<Button
							type="tertiary"
							icon={IconName.scissors}
							label={tText('item/views/item___voeg-fragment-toe-aan-collectie')}
							title={tText(
								'item/views/item-detail___knip-fragment-bij-en-of-voeg-toe-aan-een-collectie'
							)}
							ariaLabel={tText(
								'item/views/item-detail___knip-fragment-bij-en-of-voeg-toe-aan-een-collectie'
							)}
							onClick={() => {
								setIsAddToCollectionModalOpen(true);
							}}
						/>
					)}

					{PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS) && (
						<Dropdown
							buttonType="tertiary"
							icon={IconName.clipboard}
							label={tText('item/views/item-detail___voeg-toe-aan-opdracht')}
							isOpen={isCreateAssignmentDropdownOpen}
							onClose={() => setIsCreateAssignmentDropdownOpen(false)}
							onOpen={() => setIsCreateAssignmentDropdownOpen(true)}
						>
							<DropdownContent>
								<Flex orientation="vertical">
									{cutButton({
										className: 'u-m-0',
										icon: undefined,
										id: ITEM_ACTIONS.createAssignment,
										label: tText('item/views/item-detail___nieuwe-opdracht'),
										type: 'borderless',
									})}
									<Button
										className="u-m-0"
										id={ITEM_ACTIONS.importToAssignment}
										label={tText('item/views/item-detail___bestaande-opdracht')}
										onClick={() =>
											executeAction(ITEM_ACTIONS.importToAssignment)
										}
										type="borderless"
									/>
								</Flex>
							</DropdownContent>
						</Dropdown>
					)}
					{renderShareButtons()}
					{PermissionService.hasPerm(commonUser, PermissionName.VIEW_ITEMS_OVERVIEW) && (
						<Link to={buildLink(ITEMS_PATH.ITEM_DETAIL, { id: item?.uid })}>
							<Button
								className="c-button-link"
								type="tertiary"
								icon={IconName.settings}
								label={tText('item/views/item-detail___media-item-beheren')}
								ariaLabel={tText('item/views/item-detail___media-item-beheren')}
								title={tText('item/views/item-detail___media-item-beheren')}
							/>
						</Link>
					)}
				</div>

				<div className="c-item-detail__action-buttons--right">
					{PermissionService.hasPerm(commonUser, PermissionName.CREATE_BOOKMARKS) &&
						renderBookmarkButton &&
						renderBookmarkButton({
							active: bookmarkViewPlayCounts.isBookmarked,
							ariaLabel: tText('item/views/item___toggle-bladwijzer'),
							title: tText('item/views/item___toggle-bladwijzer'),
							onClick: toggleBookmark,
						})}
					<Button
						type="tertiary"
						icon={IconName.flag}
						ariaLabel={tText('item/views/item___rapporteer-item')}
						title={tText('item/views/item___rapporteer-item')}
						onClick={() => {
							setIsReportItemModalOpen(true);
						}}
					/>
				</div>
			</div>
		);
	};

	const renderItem = () => {
		if (!item) {
			return null;
		}
		const englishContentType: Avo.ContentType.English =
			CONTENT_TYPE_TRANSLATIONS[item?.type?.label || 'video'];

		return (
			<>
				<Header
					title={item.title}
					category={englishContentType}
					showMetaData={true}
					className={clsx('c-item-detail__header', {
						'c-item-detail__header-mobile': isMobileWidth(),
					})}
				>
					<HeaderContentType category={englishContentType} label={item.type.label}>
						<Spacer margin="bottom">
							<div className="c-content-type c-content-type--video">
								<Icon
									name={
										(get(item, 'type.id') === ContentTypeNumber.audio
											? 'headphone'
											: get(item, 'type.label')) as IconName
									}
								/>
								<p>{get(item, 'type.label')}</p>
							</div>
						</Spacer>
					</HeaderContentType>
					<HeaderMiddleRowRight>
						<ButtonToolbar>
							<MetaData category={englishContentType}>
								<MetaDataItem
									label={String(bookmarkViewPlayCounts.viewCount || 0)}
									icon={IconName.eye}
								/>
								{renderBookmarkCount &&
									renderBookmarkCount({
										label: String(bookmarkViewPlayCounts.bookmarkCount || 0),
									})}
							</MetaData>
						</ButtonToolbar>
					</HeaderMiddleRowRight>
					<HeaderBottomRowLeft>
						<MetaData category={englishContentType}>
							{!!get(item, 'organisation.name') && (
								<MetaDataItem>
									<p className="c-body-2 u-text-muted">
										{renderSearchLink(item.organisation.name, {
											filters: { provider: [item.organisation.name] },
										})}
									</p>
								</MetaDataItem>
							)}
							{!!item.issued && (
								<MetaDataItem>
									<p className="c-body-2 u-text-muted">
										{`${tText(
											'item/views/item-detail___uitgezonden-op'
										)} ${reorderDate(item.issued || null, '/')}`}
									</p>
								</MetaDataItem>
							)}
							{!!item.series && (
								<MetaDataItem>
									<p className="c-body-2 u-text-muted">
										<span>{`${tText('item/views/item-detail___reeks')} `}</span>
										{renderSearchLink(item.series, {
											filters: { serie: [item.series] },
										})}
									</p>
								</MetaDataItem>
							)}
						</MetaData>
					</HeaderBottomRowLeft>
					<HeaderBottomRowRight>{renderInteractiveTour?.()}</HeaderBottomRowRight>
				</Header>
				<Container className="c-item-view__main" mode="vertical">
					<Container mode="horizontal">
						<ItemVideoDescription
							itemMetaData={item}
							showMetadata={false}
							enableMetadataLink={false}
							canPlay={!isAddToCollectionModalOpen && !isReportItemModalOpen}
							verticalLayout={isMobileWidth()}
							cuePointsVideo={{
								start: cuePoint ? parseInt(cuePoint.split(',')[0], 10) : null,
								end: cuePoint ? parseInt(cuePoint.split(',')[1], 10) : null,
							}}
							cuePointsLabel={{
								start: cuePoint ? parseInt(cuePoint.split(',')[0], 10) : null,
								end: cuePoint ? parseInt(cuePoint.split(',')[1], 10) : null,
							}}
							trackPlayEvent={true}
						/>
						<Grid>
							<Column size="2-7">
								<Spacer margin="top-small">
									{(renderActionButtons || defaultRenderActionButtons)(item)}
								</Spacer>
							</Column>
							<Column size="2-5">
								<></>
							</Column>
						</Grid>
						<Grid>
							<Column size="2-7">
								<Container mode="vertical" size="small">
									<BlockHeading type="h3">
										{tText('item/views/item___metadata')}
									</BlockHeading>
									{renderGeneralMetaData(item)}
									{(!!renderEducationLevels(item) ||
										renderEducationDegrees(item) ||
										renderSubjects(item)) && <div className="c-hr" />}
									{renderEducationLevels(item)}
									{renderEducationDegrees(item)}
									{renderSubjects(item)}
									{renderThemas(item)}
									{!!renderKeywords(item) && <div className="c-hr" />}
									{renderKeywords(item)}
								</Container>
							</Column>
							<Column size="2-5">
								<Container size="small" mode="vertical">
									<BlockHeading type="h3">
										{tText('item/views/item___bekijk-ook')}
									</BlockHeading>
									<ul className="c-media-card-list">{renderRelatedItems()}</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>
				{!isNil(itemId) &&
					isAddToCollectionModalOpen &&
					PermissionService.hasPerm(commonUser, PermissionName.CREATE_COLLECTIONS) && (
						<AddToCollectionModal
							itemMetaData={item}
							externalId={itemId as string}
							isOpen={isAddToCollectionModalOpen}
							onClose={() => {
								setIsAddToCollectionModalOpen(false);
							}}
						/>
					)}
				{!isNil(itemId) &&
					isAddToFragmentModalOpen &&
					PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS) && (
						<CutFragmentForAssignmentModal
							itemMetaData={item}
							isOpen={isAddToFragmentModalOpen}
							onClose={() => {
								setIsAddToFragmentModalOpen(false);
							}}
							afterCutCallback={doImportToAssignment}
						/>
					)}
				{!renderActionButtons && !!itemId && (
					<ReportItemModal
						externalId={itemId}
						isOpen={isReportItemModalOpen}
						onClose={() => {
							setIsReportItemModalOpen(false);
						}}
					/>
				)}
				<FragmentShareModal
					isOpen={isShareFragmentModalOpen}
					item={item}
					onClose={() => {
						setIsShareFragmentModalOpen(false);
					}}
				/>
				{PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS) && (
					<ImportToAssignmentModal
						isOpen={isImportToAssignmentModalOpen}
						onClose={() => setIsImportToAssignmentModalOpen(false)}
						importToAssignmentCallback={onImportToAssignment}
						showToggle={false}
						translations={{
							title: tHtml(
								'item/views/item-detail___voeg-toe-aan-bestaande-opdracht'
							),
							primaryButton: tText('item/views/item-detail___voeg-toe'),
							secondaryButton: tText('item/views/item-detail___annuleer'),
						}}
					/>
				)}
				{PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS) && (
					<ConfirmImportToAssignmentWithResponsesModal
						isOpen={isConfirmImportToAssignmentWithResponsesModalOpen}
						onClose={() => setIsConfirmImportToAssignmentWithResponsesModalOpen(false)}
						confirmCallback={onConfirmImportAssignment}
						translations={{
							title: tHtml('item/views/item-detail___fragment-toevoegen'),
							warningCallout: tText('item/views/item-detail___opgelet'),
							warningMessage: tText(
								'item/views/item-detail___leerlingen-hebben-deze-opdracht-reeds-bekeken'
							),
							warningBody: tText(
								'item/views/item-detail___ben-je-zeker-dat-je-het-fragment-wil-toevoegen-aan-deze-opdracht'
							),
							primaryButton: tText('item/views/item-detail___voeg-toe'),
							secondaryButton: tText('item/views/item-detail___annuleer'),
						}}
					/>
				)}
				{PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS) &&
					item &&
					cutModal({
						itemMetaData: item,
						fragment: {
							...item,
							start_oc: null,
							end_oc: null,
						},
						onConfirm: (update) => createNewAssignment({ ...item, ...update }),
					})}
			</>
		);
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						item?.title ||
							tText('item/views/item-detail___item-detail-pagina-titel-fallback')
					)}
				</title>
				<meta name="description" content={get(item, 'description', '')} />
			</Helmet>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={item}
				render={renderItem}
				notFoundError={tText('item/views/item___dit-item-werd-niet-gevonden')}
			/>
		</>
	);
};
