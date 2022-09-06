import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Column,
	Container,
	Dropdown,
	DropdownContent,
	EnglishContentType,
	Flex,
	Grid,
	Header,
	HeaderAvatar,
	HeaderButtons,
	HeaderContentType,
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
import { Avo } from '@viaa/avo2-types';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import classnames from 'classnames';
import { get, isNil } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { StringParam, useQueryParam } from 'use-query-params';

import { ItemsService } from '../../admin/items/items.service';
import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { AssignmentService } from '../../assignment/assignment.service';
import ConfirmImportToAssignmentWithResponsesModal from '../../assignment/modals/ConfirmImportToAssignmentWithResponsesModal';
import ImportToAssignmentModal from '../../assignment/modals/ImportToAssignmentModal';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import {
	ContentTypeNumber,
	ContentTypeString,
	toEnglishContentType,
} from '../../collection/collection.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ALL_SEARCH_FILTERS, SearchFilter } from '../../search/search.const';
import { FilterState } from '../../search/search.types';
import {
	LoadingErrorLoadedComponent,
	LoadingInfo,
	ShareThroughEmailModal,
} from '../../shared/components';
import QuickLaneModal from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { LANGUAGES, ROUTE_PARTS } from '../../shared/constants';
import {
	buildLink,
	CustomError,
	isMobileWidth,
	renderSearchLinks,
	reorderDate,
} from '../../shared/helpers';
import {
	defaultRenderBookmarkButton,
	renderBookmarkButtonProps,
} from '../../shared/helpers/default-render-bookmark-button';
import {
	defaultRenderBookmarkCount,
	renderBookmarkCountProps,
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
import { stringsToTagList } from '../../shared/helpers/strings-to-taglist';
import withUser from '../../shared/hocs/withUser';
import { useCutModal } from '../../shared/hooks/use-cut-modal';
import { BookmarksViewsPlaysService, ToastService } from '../../shared/services';
import { DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS } from '../../shared/services/bookmarks-views-plays-service';
import { BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import { AddToAssignmentModal, AddToCollectionModal, ItemVideoDescription } from '../components';
import ReportItemModal from '../components/modals/ReportItemModal';
import { RELATED_ITEMS_AMOUNT } from '../item.const';
import { ItemTrimInfo } from '../item.types';

import './ItemDetail.scss';

interface ItemDetailProps {
	id?: string; // Item id when component needs to be used inside another component and the id cannot come from the url (match.params.id)
	renderDetailLink: (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType,
		className?: string
	) => ReactNode;
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode;
	goToDetailLink: (id: string, type: Avo.Core.ContentType) => void;
	goToSearchLink: (newFilters: FilterState) => void;
	enabledMetaData: SearchFilter[];
	renderActionButtons?: (item: Avo.Item.Item) => ReactNode;
	renderBookmarkButton?: (props: renderBookmarkButtonProps) => ReactNode;
	renderBookmarkCount?: (props: renderBookmarkCountProps) => ReactNode;
	renderInteractiveTour?: () => ReactNode;
}

export const ITEM_ACTIONS = {
	createAssignment: 'createAssignment',
	importToAssignment: 'importToAssignment',
};

const ItemDetail: FunctionComponent<ItemDetailProps & DefaultSecureRouteProps<{ id: string }>> = ({
	history,
	match,
	location,
	user,
	id,
	renderDetailLink = defaultRenderDetailLink,
	renderSearchLink = defaultRenderSearchLink,
	goToDetailLink = defaultGoToDetailLink(history),
	goToSearchLink = defaultGoToSearchLink(history),
	enabledMetaData = ALL_SEARCH_FILTERS,
	renderActionButtons,
	renderBookmarkButton = defaultRenderBookmarkButton,
	renderBookmarkCount = defaultRenderBookmarkCount,
	renderInteractiveTour = defaultRenderInteractiveTour,
}) => {
	const [t] = useTranslation();

	const itemId = id || match.params.id;

	const [cuePoint] = useQueryParam('t', StringParam);
	const [cutButton, cutModal] = useCutModal();

	const [item, setItem] = useState<Avo.Item.Item | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false);
	const [isAddToFragmentModalOpen, setIsAddToFragmentModalOpen] = useState(false);
	const [isShareThroughEmailModalOpen, setIsShareThroughEmailModalOpen] = useState(false);
	const [isReportItemModalOpen, setIsReportItemModalOpen] = useState(false);
	const [isQuickLaneModalOpen, setIsQuickLaneModalOpen] = useState(false);
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

	const retrieveRelatedItems = (currentItemId: string, limit: number) => {
		getRelatedItems(currentItemId, 'items', limit)
			.then(setRelatedItems)
			.catch((err) => {
				console.error('Failed to get related items', err, {
					currentItemId,
					limit,
					index: 'items',
				});
				ToastService.danger(
					t('item/views/item___het-ophalen-van-de-gerelateerde-items-is-mislukt')
				);
			});
	};

	const checkPermissionsAndGetItem = useCallback(async () => {
		try {
			if (
				!(
					PermissionService.hasPerm(user, PermissionName.VIEW_ANY_PUBLISHED_ITEMS) ||
					(PermissionService.hasPerm(user, PermissionName.SEARCH_IN_ASSIGNMENT) &&
						location.pathname.includes(`/${ROUTE_PARTS.assignments}/`))
				)
			) {
				if (user.profile?.userGroupIds[0] === SpecialUserGroup.Pupil) {
					setLoadingInfo({
						state: 'error',
						message: t(
							'item/views/item___je-hebt-geen-rechten-om-dit-item-te-bekijken-leerling'
						),
						icon: 'lock',
					});
				} else {
					setLoadingInfo({
						state: 'error',
						message: t(
							'item/views/item___je-hebt-geen-rechten-om-dit-item-te-bekijken'
						),
						icon: 'lock',
					});
				}
				return;
			}

			const itemObj: (Avo.Item.Item & { replacement_for?: string }) | null = (
				await ItemsService.fetchItemsByExternalId([itemId])
			)[0];
			if (!itemObj) {
				setLoadingInfo({
					state: 'error',
					message: t('item/views/item___dit-item-werd-niet-gevonden'),
					icon: 'search',
				});
				return;
			}

			if (itemObj.depublish_reason) {
				setLoadingInfo({
					state: 'error',
					message:
						t(
							'item/views/item-detail___dit-item-werdt-gedepubliceerd-met-volgende-reden'
						) + itemObj.depublish_reason,
					icon: 'camera-off',
				});
				return;
			}

			if (itemObj.replacement_for) {
				// Item was replaced by another item
				// We should reload the page, to update the url
				goToDetailLink(itemObj.external_id, 'video');
				return;
			}

			trackEvents(
				{
					object: itemId,
					object_type: 'item',
					action: 'view',
				},
				user
			);

			BookmarksViewsPlaysService.action('view', 'item', itemObj.uid, user);

			retrieveRelatedItems(itemId, RELATED_ITEMS_AMOUNT);
			try {
				const counts = await BookmarksViewsPlaysService.getItemCounts(
					(itemObj as any).uid,
					user
				);
				setBookmarkViewPlayCounts(counts);
			} catch (err) {
				console.error(
					new CustomError('Failed to get getItemCounts', err, {
						uuid: (itemObj as any).uid,
					})
				);
				ToastService.danger(
					t(
						'item/views/item-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
					)
				);
			}

			setItem(itemObj);
		} catch (err) {
			console.error(
				new CustomError('Failed to check permissions or get item from graphql', err, {
					user,
					itemId,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('item/views/item-detail___het-ophalen-van-het-item-is-mislukt'),
			});
		}
	}, [itemId, setItem, t, history, user]);

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
		checkPermissionsAndGetItem();
	}, [checkPermissionsAndGetItem]);

	const toggleBookmark = async () => {
		try {
			await BookmarksViewsPlaysService.toggleBookmark(
				(item as any).uid,
				user,
				'item',
				bookmarkViewPlayCounts.isBookmarked
			);

			setBookmarkViewPlayCounts({
				...bookmarkViewPlayCounts,
				isBookmarked: !bookmarkViewPlayCounts.isBookmarked,
			});
			ToastService.success(
				bookmarkViewPlayCounts.isBookmarked
					? t('collection/views/collection-detail___de-bladwijzer-is-verwijderd')
					: t('collection/views/collection-detail___de-bladwijzer-is-aangemaakt')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					user,
					itemId: (item as any).uid,
					type: 'item',
					isBookmarked: bookmarkViewPlayCounts.isBookmarked,
				})
			);
			ToastService.danger(
				bookmarkViewPlayCounts.isBookmarked
					? t('item/views/item-detail___het-verwijderen-van-de-bladwijzer-is-mislukt')
					: t('item/views/item-detail___het-aanmaken-van-de-bladwijzer-is-mislukt')
			);
		}
	};

	const trackOnPlay = () => {
		trackEvents(
			{
				object: get(item, 'external_id', ''),
				object_type: 'item',
				action: 'play',
			},
			user
		);
	};

	const renderRelatedItem = (relatedItem: Avo.Search.ResultItem) => {
		const englishContentType: EnglishContentType =
			toEnglishContentType(relatedItem.administrative_type) || ContentTypeString.video;

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
		source: (ItemSchema & { start_oc?: number | null; end_oc?: number | null }) | null = item
	) => {
		if (!source) {
			return;
		}

		const assignmentId = await AssignmentService.createAssignmentFromFragment(user, source);

		history.push(buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignmentId }));
	};

	const onImportToAssignment = async (importToAssignmentId: string): Promise<void> => {
		setAssignmentId(importToAssignmentId);

		// check if assignment has responses. If so: show additional confirmation modal
		const responses = await AssignmentService.getAssignmentResponses(
			getProfileId(user),
			importToAssignmentId
		);
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
				t('item/views/item-detail___het-fragment-is-toegevoegd-aan-de-opdracht')
			);
		} else {
			ToastService.danger(
				t(
					'item/views/item-detail___het-fragment-kon-niet-worden-toegevoegd-aan-de-opdracht'
				)
			);
		}
	};

	const executeAction = async (item: ReactText) => {
		setIsCreateAssignmentDropdownOpen(false);
		switch (item) {
			case ITEM_ACTIONS.createAssignment:
				createNewAssignment();
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
				className={classnames('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{t('item/views/item___geschikt-voor')}</th>
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
				className={classnames('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{t('item/views/item-detail___onderwijsgraad')}</th>
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
				className={classnames('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{t('item/views/item___vakken')}</th>
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
				className={classnames('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{t('item/views/item-detail___themas')}</th>
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
				className={classnames('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<tbody>
					<tr>
						<th scope="row">{t('item/views/item___trefwoorden')}</th>
						<td>
							{stringsToTagList(
								item.lom_keywords || [],
								null,
								(tagId: string | number) =>
									goToSearchLink({
										filters: {
											keyword: [tagId as string],
										},
									})
							)}
						</td>
					</tr>
					{/*<tr>*/}
					{/*<th scope="row">{t('item/views/item___klascement')}</th>*/}
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
				className={classnames('c-meta-data__table', {
					'c-meta-data__table-mobile': isMobileWidth(),
				})}
			>
				<Grid tag="tbody">
					{!!item.issued && (
						<Column size="2-5" tag="tr">
							<th scope="row">{t('item/views/item___publicatiedatum')}</th>
							<td>{reorderDate(item.issued, '/')}</td>
						</Column>
					)}
					{!!item.published_at && (
						<Column size="2-5" tag="tr">
							<th scope="row">{t('item/views/item___toegevoegd-op')}</th>
							<td>{reorderDate(item.published_at, '/')}</td>
						</Column>
					)}
				</Grid>
				<Grid tag="tbody">
					{!!get(item, 'organisation.name') && (
						<Column size="2-5" tag="tr">
							<th scope="row">{t('item/views/item___aanbieder')}</th>
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
							<th scope="row">{t('item/views/item___speelduur')}</th>
							<td>{item.duration}</td>
						</Column>
					)}
				</Grid>
				<Grid tag="tbody">
					{!!item.series && (
						<Column size="2-5" tag="tr">
							<th scope="row">{t('item/views/item___reeks')}</th>
							<td>
								{renderSearchLink(item.series, {
									filters: { serie: [item.series] },
								})}
							</td>
						</Column>
					)}
					{!!item.lom_languages && !!item.lom_languages.length && (
						<Column size="2-5" tag="tr">
							<th scope="row">{t('item/views/item___taal')}</th>
							<td>
								{item.lom_languages
									.map((languageCode) => LANGUAGES.nl[languageCode])
									.join(', ')}
							</td>
						</Column>
					)}
				</Grid>
			</Table>
		);
	};

	const defaultRenderActionButtons = () => {
		return (
			<div className="c-item-detail__action-buttons">
				<div className="c-item-detail__action-buttons--left">
					{PermissionService.hasPerm(user, PermissionName.CREATE_COLLECTIONS) && (
						<Button
							type="tertiary"
							icon="scissors"
							label={t('item/views/item___voeg-fragment-toe-aan-collectie')}
							title={t(
								'item/views/item-detail___knip-fragment-bij-en-of-voeg-toe-aan-een-collectie'
							)}
							ariaLabel={t(
								'item/views/item-detail___knip-fragment-bij-en-of-voeg-toe-aan-een-collectie'
							)}
							onClick={() => {
								setIsAddToCollectionModalOpen(true);
							}}
						/>
					)}

					{PermissionService.hasPerm(user, PermissionName.CREATE_ASSIGNMENTS) && (
						<Dropdown
							buttonType="tertiary"
							icon="clipboard"
							label={t('item/views/item-detail___voeg-toe-aan-opdracht')}
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
										label: t('item/views/item-detail___nieuwe-opdracht'),
										type: 'borderless',
									})}
									<Button
										className="u-m-0"
										id={ITEM_ACTIONS.importToAssignment}
										label={t('item/views/item-detail___bestaande-opdracht')}
										onClick={() =>
											executeAction(ITEM_ACTIONS.importToAssignment)
										}
										type="borderless"
									/>
								</Flex>
							</DropdownContent>
						</Dropdown>
					)}

					{PermissionService.hasPerm(user, PermissionName.CREATE_QUICK_LANE) && (
						<Button
							type="tertiary"
							icon="link-2"
							label={t('item/views/item___delen-met-leerlingen')}
							ariaLabel={t('item/views/item-detail___deel-dit-met-alle-leerlingen')}
							title={t('item/views/item-detail___deel-dit-met-alle-leerlingen')}
							onClick={() => {
								setIsQuickLaneModalOpen(true);
							}}
						/>
					)}
				</div>

				<div className="c-item-detail__action-buttons--right">
					{PermissionService.hasPerm(user, PermissionName.CREATE_BOOKMARKS) &&
						renderBookmarkButton &&
						renderBookmarkButton({
							active: bookmarkViewPlayCounts.isBookmarked,
							ariaLabel: t('item/views/item___toggle-bladwijzer'),
							title: t('item/views/item___toggle-bladwijzer'),
							onClick: toggleBookmark,
						})}

					<Button
						type="tertiary"
						icon="share-2"
						ariaLabel={t('item/views/item___share-item')}
						title={t('item/views/item___share-item')}
						onClick={() => {
							setIsShareThroughEmailModalOpen(true);
						}}
					/>

					<Button
						type="tertiary"
						icon="flag"
						ariaLabel={t('item/views/item___rapporteer-item')}
						title={t('item/views/item___rapporteer-item')}
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
		const englishContentType: EnglishContentType =
			toEnglishContentType(get(item, 'type.label')) || ContentTypeString.video;

		return (
			<>
				<Header
					title={item.title}
					category={toEnglishContentType(item.type.label)}
					showMetaData={true}
					className={classnames('c-item-detail__header', {
						'c-item-detail__header-mobile': isMobileWidth(),
					})}
				>
					<HeaderContentType
						category={toEnglishContentType(item.type.label)}
						label={item.type.label}
					>
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
					<HeaderButtons>
						<ButtonToolbar>
							<MetaData category={englishContentType}>
								<MetaDataItem
									label={String(bookmarkViewPlayCounts.viewCount || 0)}
									icon="eye"
								/>
								{renderBookmarkCount &&
									renderBookmarkCount({
										label: String(bookmarkViewPlayCounts.bookmarkCount || 0),
									})}
							</MetaData>
							{renderInteractiveTour?.()}
						</ButtonToolbar>
					</HeaderButtons>
					<HeaderAvatar>
						<MetaData category={toEnglishContentType(item.type.label)}>
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
										{`${t(
											'item/views/item-detail___uitgezonden-op'
										)} ${reorderDate(item.issued || null, '/')}`}
									</p>
								</MetaDataItem>
							)}
							{!!item.series && (
								<MetaDataItem>
									<p className="c-body-2 u-text-muted">
										<span>{`${t('item/views/item-detail___reeks')} `}</span>
										{renderSearchLink(item.series, {
											filters: { serie: [item.series] },
										})}
									</p>
								</MetaDataItem>
							)}
						</MetaData>
					</HeaderAvatar>
				</Header>
				<Container className="c-item-view__main" mode="vertical">
					<Container mode="horizontal">
						<ItemVideoDescription
							itemMetaData={item}
							canPlay={
								!isAddToCollectionModalOpen &&
								!isShareThroughEmailModalOpen &&
								!isReportItemModalOpen
							}
							onPlay={trackOnPlay}
							verticalLayout={isMobileWidth()}
							cuePoints={{
								start: cuePoint ? parseInt(cuePoint.split(',')[0], 10) : null,
								end: cuePoint ? parseInt(cuePoint.split(',')[1], 10) : null,
							}}
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
										{t('item/views/item___metadata')}
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
										{t('item/views/item___bekijk-ook')}
									</BlockHeading>
									<ul className="c-media-card-list">{renderRelatedItems()}</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>
				{!isNil(match.params.id) && isAddToCollectionModalOpen && (
					<AddToCollectionModal
						history={history}
						location={location}
						match={match}
						user={user}
						itemMetaData={item}
						externalId={match.params.id as string}
						isOpen={isAddToCollectionModalOpen}
						onClose={() => {
							setIsAddToCollectionModalOpen(false);
						}}
					/>
				)}
				{!isNil(match.params.id) && isAddToFragmentModalOpen && (
					<AddToAssignmentModal
						itemMetaData={item}
						isOpen={isAddToFragmentModalOpen}
						onClose={() => {
							setIsAddToFragmentModalOpen(false);
						}}
						onAddToAssignmentCallback={doImportToAssignment}
					/>
				)}
				<ShareThroughEmailModal
					modalTitle={t('item/views/item-detail___deel-dit-item')}
					type="item"
					emailLinkHref={window.location.href}
					emailLinkTitle={item.title}
					isOpen={isShareThroughEmailModalOpen}
					onClose={() => {
						setIsShareThroughEmailModalOpen(false);
					}}
				/>
				<ReportItemModal
					externalId={match.params.id}
					isOpen={isReportItemModalOpen}
					onClose={() => {
						setIsReportItemModalOpen(false);
					}}
					user={user}
				/>
				<QuickLaneModal
					modalTitle={t('item/views/item___snel-delen-met-leerlingen')}
					isOpen={isQuickLaneModalOpen}
					content={item}
					content_label="ITEM"
					onClose={() => {
						setIsQuickLaneModalOpen(false);
					}}
				/>
				<ImportToAssignmentModal
					user={user}
					isOpen={isImportToAssignmentModalOpen}
					onClose={() => setIsImportToAssignmentModalOpen(false)}
					importToAssignmentCallback={onImportToAssignment}
					showToggle={false}
					translations={{
						title: t('item/views/item-detail___voeg-toe-aan-bestaande-opdracht'),
						primaryButton: t('item/views/item-detail___voeg-toe'),
						secondaryButton: t('item/views/item-detail___annuleer'),
					}}
				/>
				<ConfirmImportToAssignmentWithResponsesModal
					isOpen={isConfirmImportToAssignmentWithResponsesModalOpen}
					onClose={() => setIsConfirmImportToAssignmentWithResponsesModalOpen(false)}
					confirmCallback={onConfirmImportAssignment}
					translations={{
						title: t('item/views/item-detail___fragment-toevoegen'),
						warningCallout: t('item/views/item-detail___opgelet'),
						warningMessage: t(
							'item/views/item-detail___leerlingen-hebben-deze-opdracht-reeds-bekeken'
						),
						warningBody: t(
							'item/views/item-detail___ben-je-zeker-dat-je-het-fragment-wil-toevoegen-aan-deze-opdracht'
						),
						primaryButton: t('item/views/item-detail___voeg-toe'),
						secondaryButton: t('item/views/item-detail___annuleer'),
					}}
				/>
				{item &&
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
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(
							item,
							'title',
							t('item/views/item-detail___item-detail-pagina-titel-fallback')
						)
					)}
				</title>
				<meta name="description" content={get(item, 'description', '')} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={item}
				render={renderItem}
				notFoundError={t('item/views/item___dit-item-werd-niet-gevonden')}
			/>
		</>
	);
};

export default compose(withRouter, withUser)(ItemDetail) as FunctionComponent<ItemDetailProps>;
