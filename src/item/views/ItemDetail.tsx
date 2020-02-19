import { get } from 'lodash-es';
import queryString from 'query-string';
import React, { createRef, FunctionComponent, RefObject, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Column,
	Container,
	EnglishContentType,
	Flex,
	Grid,
	Icon,
	IconName,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Spacer,
	Table,
	TagList,
	Thumbnail,
	ToggleButton,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import {
	ContentTypeNumber,
	ContentTypeString,
	toEnglishContentType,
} from '../../collection/collection.types';
import { LoadingErrorLoadedComponent, ShareThroughEmailModal } from '../../shared/components';
import { LANGUAGES } from '../../shared/constants';
import {
	buildLink,
	CustomError,
	generateAssignmentCreateLink,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
	reorderDate,
} from '../../shared/helpers';
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import toastService from '../../shared/services/toast-service';

import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { dataService } from '../../shared/services/data-service';
import { AddToCollectionModal, ItemVideoDescription } from '../components';
import { ITEM_PATH, RELATED_ITEMS_AMOUNT } from '../item.const';
import { GET_ITEM_BY_ID } from '../item.gql';
import './ItemDetail.scss';

interface ItemDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const ItemDetail: FunctionComponent<ItemDetailProps> = ({
	history,
	match,
	location,
	user,
	...rest
}) => {
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [t] = useTranslation();

	const [item, setItem] = useState<Avo.Item.Item | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	// TODO: use setTime when adding logic for enabling timestamps in the URL
	const [time] = useState<number>(0);
	const [isOpenAddToCollectionModal, setIsOpenAddToCollectionModal] = useState(false);
	const [isShareThroughEmailModalOpen, setIsShareThroughEmailModalOpen] = useState(false);
	const [relatedItems, setRelatedItems] = useState<Avo.Search.ResultItem[] | null>(null);

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
		const retrieveRelatedItems = (currentItemId: string, limit: number) => {
			getRelatedItems(currentItemId, 'items', limit)
				.then(setRelatedItems)
				.catch(err => {
					console.error('Failed to get related items', err, {
						currentItemId,
						limit,
						index: 'items',
					});
					toastService.danger(
						t('item/views/item___het-ophalen-van-de-gerelateerde-items-is-mislukt')
					);
				});
		};

		const checkPermissionsAndGetItem = async () => {
			try {
				const hasPermission: boolean = await PermissionService.hasPermissions(
					[
						PermissionNames.VIEW_ITEMS,
						{ name: PermissionNames.VIEW_ITEMS_LINKED_TO_ASSIGNMENT, obj: match.params.id },
					],
					user
				);
				if (!hasPermission) {
					setLoadingInfo({
						state: 'error',
						message: t('item/views/item___je-hebt-geen-rechten-om-dit-item-te-bekijken'),
						icon: 'lock',
					});
					return;
				}
				const response = await dataService.query({
					query: GET_ITEM_BY_ID,
					variables: {
						id: match.params.id,
					},
				});

				const itemObj = get(response, 'data.app_item_meta[0]');
				if (!itemObj) {
					setLoadingInfo({
						state: 'error',
						message: t('item/views/item___dit-item-werd-niet-gevonden'),
						icon: 'search',
					});
					return;
				}

				trackEvents(
					{
						object: match.params.id,
						object_type: 'avo_item_pid',
						message: `Gebruiker ${getProfileName(user)} heeft de pagina van fragment ${
							match.params.id
						} bezocht`,
						action: 'view',
					},
					user
				);

				retrieveRelatedItems(match.params.id, RELATED_ITEMS_AMOUNT);

				setItem(itemObj);
			} catch (err) {
				console.error(
					new CustomError('Failed to check permissions or get item from graphql', err, {
						user,
						itemId: match.params.id,
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t('item/views/item-detail___het-ophalen-van-het-item-is-mislukt'),
				});
			}
		};

		checkPermissionsAndGetItem();
	}, [match.params.id, setItem, t, user]);

	/**
	 * Update video and query param time when time changes in the state
	 */
	useEffect(() => {
		const setSeekerTimeInQueryParams = (): void => {
			history.push({
				pathname: `/item/${match.params.id}`,
				search: time ? `?${queryString.stringify({ time })}` : '',
			});
		};

		const setSeekerTime = () => {
			if (videoRef.current) {
				videoRef.current.currentTime = time;
			}
		};

		if (time) {
			setSeekerTimeInQueryParams();
			setSeekerTime();
		}

		if (match.params.id) {
			// Log event of item page view
			trackEvents(
				{
					object: match.params.id,
					object_type: 'avo_item_pid',
					message: `Gebruiker ${getProfileName(user)} heeft de pagina van fragment ${
						match.params.id
					} bezocht`,
					action: 'view',
				},
				user
			);
		}
	}, [time, history, videoRef, match.params.id, relatedItems, user]);

	/**
	 * Set video current time from the query params once the video has loaded its meta data
	 * If this happens sooner, the time will be ignored by the video player
	 */
	// TODO: trigger this function when flowplayer is loaded
	// const getSeekerTimeFromQueryParams = () => {
	// 	const queryParams = queryString.parse(location.search);
	// 	setTime(parseInt((queryParams.time as string) || '0', 10));
	// };

	const goToSearchPage = (prop: Avo.Search.FilterProp, value: string) => {
		history.push(generateSearchLinkString(prop, value));
	};

	const renderRelatedItems = () => {
		if (relatedItems && relatedItems.length) {
			return relatedItems.map(relatedItem => {
				const englishContentType: EnglishContentType =
					toEnglishContentType(relatedItem.administrative_type) || ContentTypeString.video;

				return (
					<li key={`related-item-${relatedItem.id}`}>
						<MediaCard
							category={englishContentType}
							onClick={() =>
								redirectToClientPage(buildLink(ITEM_PATH.ITEM, { id: relatedItem.id }), history)
							}
							orientation="horizontal"
							title={relatedItem.dc_title}
						>
							<MediaCardThumbnail>
								<Thumbnail category={englishContentType} src={relatedItem.thumbnail_path} />
							</MediaCardThumbnail>
							<MediaCardMetaData>
								<MetaData category={englishContentType}>
									<MetaDataItem label={relatedItem.original_cp || ''} />
								</MetaData>
							</MediaCardMetaData>
						</MediaCard>
					</li>
				);
			});
		}
		return null;
	};

	const renderItem = () => {
		if (!item) {
			return null;
		}
		const englishContentType: EnglishContentType =
			toEnglishContentType(get(item, 'type.label')) || ContentTypeString.video;

		return (
			<>
				<Container className="c-item-view__header" mode="vertical" size="small" background="alt">
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarLeft>
								<ToolbarItem>
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
									<h1 className="c-h2 u-m-0">{item.title}</h1>
									<MetaData category={toEnglishContentType(get(item, 'type.label'))} spaced>
										{!!get(item, 'organisation.name') && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													{generateSearchLink('provider', item.organisation.name)}
												</p>
											</MetaDataItem>
										)}
										{!!item.issued && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													Gepubliceerd op {reorderDate(item.issued || null, '/')}
												</p>
											</MetaDataItem>
										)}
										{!!item.series && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													Uit reeks: {generateSearchLink('serie', item.series)}
												</p>
											</MetaDataItem>
										)}
									</MetaData>
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="u-mq-switch-main-nav-authentication">
										<MetaData category={englishContentType}>
											{/* TODO link meta data to actual data */}
											<MetaDataItem label="0" icon="eye" />
											<MetaDataItem label="0" icon="bookmark" />
											{get(item, 'type.id') === ContentTypeNumber.collection && (
												<MetaDataItem label="0" icon="collection" />
											)}
										</MetaData>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Container className="c-item-view__main" mode="vertical">
					<Container mode="horizontal">
						<ItemVideoDescription
							itemMetaData={item}
							history={history}
							location={location}
							match={match}
							user={user}
							{...rest}
						/>
						<Grid>
							<Column size="2-7">
								<Spacer margin="top-large">
									<Flex justify="between" wrap>
										<Spacer margin="right-small">
											<ButtonToolbar>
												<Flex justify="between" wrap>
													<Button
														type="tertiary"
														icon="add"
														label={t('item/views/item___voeg-fragment-toe-aan-collectie')}
														onClick={() => setIsOpenAddToCollectionModal(true)}
													/>
													<Button
														type="tertiary"
														icon="clipboard"
														label={t('item/views/item___maak-opdracht')}
														onClick={() =>
															history.push(
																generateAssignmentCreateLink('KIJK', item.external_id, 'ITEM')
															)
														}
													/>
												</Flex>
											</ButtonToolbar>
										</Spacer>
										<ButtonToolbar>
											<ToggleButton
												type="tertiary"
												icon="bookmark"
												active={false}
												ariaLabel={t('item/views/item___toggle-bladwijzer')}
											/>
											<Button
												type="tertiary"
												icon="share-2"
												ariaLabel={t('item/views/item___share-item')}
												onClick={() => setIsShareThroughEmailModalOpen(true)}
											/>
											<Button
												type="tertiary"
												icon="flag"
												ariaLabel={t('item/views/item___rapporteer-item')}
											/>
										</ButtonToolbar>
									</Flex>
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
										<Trans i18nKey="item/views/item___metadata">Metadata</Trans>
									</BlockHeading>
									<Table horizontal untable>
										<Grid tag="tbody">
											{!!item.issued && (
												<Column size="2-5" tag="tr">
													<th scope="row">
														<Trans i18nKey="item/views/item___publicatiedatum">
															Publicatiedatum
														</Trans>
													</th>
													<td>{reorderDate(item.issued, '/')}</td>
												</Column>
											)}
											{!!item.published_at && (
												<Column size="2-5" tag="tr">
													<th scope="row">
														<Trans i18nKey="item/views/item___toegevoegd-op">Toegevoegd op</Trans>
													</th>
													<td>{reorderDate(item.published_at, '/')}</td>
												</Column>
											)}
										</Grid>
										<Grid tag="tbody">
											{!!get(item, 'organisation.name') && (
												<Column size="2-5" tag="tr">
													<th scope="row">
														<Trans i18nKey="item/views/item___aanbieder">Aanbieder</Trans>
													</th>
													<td>{generateSearchLink('provider', item.organisation.name)}</td>
												</Column>
											)}
											{!!item.duration && (
												<Column size="2-5" tag="tr">
													<th scope="row">
														<Trans i18nKey="item/views/item___speelduur">Speelduur</Trans>
													</th>
													<td>{item.duration}</td>
												</Column>
											)}
										</Grid>
										<Grid tag="tbody">
											{!!item.series && (
												<Column size="2-5" tag="tr">
													<th scope="row">
														<Trans i18nKey="item/views/item___reeks">Reeks</Trans>
													</th>
													<td>{generateSearchLink('serie', item.series)}</td>
												</Column>
											)}
											{!!item.lom_languages && !!item.lom_languages.length && (
												<Column size="2-5" tag="tr">
													<th scope="row">
														<Trans i18nKey="item/views/item___taal">Taal</Trans>
													</th>
													<td>
														{item.lom_languages
															.map(languageCode => LANGUAGES.nl[languageCode])
															.join(', ')}
													</td>
												</Column>
											)}
										</Grid>
									</Table>
									<div className="c-hr" />
									<Table horizontal untable>
										<tbody>
											{!!item.external_id && !!item.lom_context && (
												<tr>
													<th scope="row">
														<Trans i18nKey="item/views/item___geschikt-voor">Geschikt voor</Trans>
													</th>
													<td>
														{generateSearchLinks(
															item.external_id,
															'educationLevel',
															item.lom_context
														)}
													</td>
												</tr>
											)}
											{!!item.external_id && !!item.lom_classification && (
												<tr>
													<th scope="row">
														<Trans i18nKey="item/views/item___vakken">Vakken</Trans>
													</th>
													<td>
														{generateSearchLinks(
															item.external_id,
															'subject',
															item.lom_classification
														)}
													</td>
												</tr>
											)}
										</tbody>
									</Table>
									<div className="c-hr" />
									<Table horizontal untable>
										<tbody>
											{!!item.lom_keywords && !!item.lom_keywords.length && (
												<tr>
													<th scope="row">
														<Trans i18nKey="item/views/item___trefwoorden">Trefwoorden</Trans>
													</th>
													<td>
														<TagList
															tags={item.lom_keywords.map(keyword => ({
																label: keyword,
																id: keyword,
															}))}
															swatches={false}
															onTagClicked={(tagId: string | number) =>
																goToSearchPage('keyword', tagId as string)
															}
														/>
													</td>
												</tr>
											)}
											{/*<tr>*/}
											{/*<th scope="row"><Trans i18nKey="item/views/item___klascement">Klascement</Trans></th>*/}
											{/*<td>*/}
											{/*<a href={'http://www.klascement.be/link_item'}>*/}
											{/*www.klascement.be/link_item*/}
											{/*</a>*/}
											{/*</td>*/}
											{/*</tr>*/}
										</tbody>
									</Table>
								</Container>
							</Column>
							<Column size="2-5">
								<Container size="small" mode="vertical">
									<BlockHeading type="h3">
										<Trans i18nKey="item/views/item___bekijk-ook">Bekijk ook</Trans>
									</BlockHeading>
									<ul className="c-media-card-list">{renderRelatedItems()}</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>
				{typeof match.params.id !== undefined && (
					<AddToCollectionModal
						history={history}
						location={location}
						match={match}
						user={user}
						itemMetaData={item}
						externalId={match.params.id as string}
						isOpen={isOpenAddToCollectionModal}
						onClose={() => setIsOpenAddToCollectionModal(false)}
					/>
				)}
				<ShareThroughEmailModal
					modalTitle={t('item/views/item-detail___deel-dit-item')}
					type="item"
					emailLinkHref={window.location.href}
					emailLinkTitle={item.title}
					isOpen={isShareThroughEmailModalOpen}
					onClose={() => setIsShareThroughEmailModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={item}
			render={renderItem}
			notFoundError={t('item/views/item___dit-item-werd-niet-gevonden')}
		/>
	);
};

export default ItemDetail;
