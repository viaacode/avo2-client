import { get, isNull } from 'lodash-es';
import queryString from 'query-string';
import React, { createRef, FunctionComponent, RefObject, useEffect, useState } from 'react';

import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	EnglishContentType,
	Flex,
	Grid,
	Heading,
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
	ContentTypeNumber,
	ContentTypeString,
	toEnglishContentType,
} from '../../collection/collection.types';
import { DataQueryComponent } from '../../shared/components';
import { LANGUAGES } from '../../shared/constants';
import {
	buildLink,
	generateAssignmentCreateLink,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
	reorderDate,
} from '../../shared/helpers';
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import toastService from '../../shared/services/toast-service';

import { AddToCollectionModal, ItemVideoDescription } from '../components';
import { RELATED_ITEMS_AMOUNT } from '../item.const';
import { GET_ITEM_BY_ID } from '../item.gql';
import './Item.scss';
import { APP_PATH } from '../../constants';

interface ItemProps extends DefaultSecureRouteProps {}

const Item: FunctionComponent<ItemProps> = ({ history, match, location, user, ...rest }) => {
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [itemId] = useState<string | undefined>((match.params as any)['id']);
	// TODO: use setTime when adding logic for enabling timestamps in the URL
	const [time] = useState<number>(0);
	const [isOpenAddToCollectionModal, setIsOpenAddToCollectionModal] = useState(false);
	const [relatedItems, setRelatedItems] = useState<Avo.Search.ResultItem[] | null>(null);

	/**
	 * Update video and query param time when time changes in the state
	 */
	useEffect(() => {
		const setSeekerTimeInQueryParams = (): void => {
			history.push({
				pathname: `/item/${itemId}`,
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

		if (itemId) {
			if (isNull(relatedItems)) {
				retrieveRelatedItems(itemId, RELATED_ITEMS_AMOUNT);
			}

			// Log event of item page view
			trackEvents(
				{
					object: itemId,
					object_type: 'avo_item_pid',
					message: `Gebruiker ${getProfileName(
						user
					)} heeft de pagina van fragment ${itemId} bezocht`,
					action: 'view',
				},
				user
			);
		}
	}, [time, history, videoRef, itemId, relatedItems, user]);

	const retrieveRelatedItems = (currentItemId: string, limit: number) => {
		getRelatedItems(currentItemId, 'items', limit)
			.then(setRelatedItems)
			.catch(err => {
				console.error('Failed to get related items', err, {
					currentItemId,
					limit,
					index: 'items',
				});
				toastService.danger('Het ophalen van de gerelateerde items is mislukt');
			});
	};

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
							title={relatedItem.dc_title}
							href={buildLink(APP_PATH.ITEM, { id: relatedItem.id })}
							category={englishContentType}
							orientation="horizontal"
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

	const renderItem = (itemMetaData: Avo.Item.Item) => {
		const englishContentType: EnglishContentType =
			toEnglishContentType(get(itemMetaData, 'type.label')) || ContentTypeString.video;

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
													(get(itemMetaData, 'type.id') === ContentTypeNumber.audio
														? 'headphone'
														: get(itemMetaData, 'type.label')) as IconName
												}
											/>
											<p>{get(itemMetaData, 'type.label')}</p>
										</div>
									</Spacer>
									<h1 className="c-h2 u-m-0">{itemMetaData.title}</h1>
									<MetaData category={toEnglishContentType(get(itemMetaData, 'type.label'))} spaced>
										{!!itemMetaData.organisation && !!itemMetaData.organisation.name && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													{generateSearchLink('provider', itemMetaData.organisation.name)}
												</p>
											</MetaDataItem>
										)}
										{!!itemMetaData.issued && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													Gepubliceerd op {reorderDate(itemMetaData.issued || null, '/')}
												</p>
											</MetaDataItem>
										)}
										{!!itemMetaData.series && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													Uit reeks: {generateSearchLink('serie', itemMetaData.series)}
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
											{get(itemMetaData, 'type.id') === ContentTypeNumber.collection && (
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
							itemMetaData={itemMetaData}
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
														label="Voeg fragment toe aan collectie"
														onClick={() => setIsOpenAddToCollectionModal(true)}
													/>
													<Button
														type="tertiary"
														icon="clipboard"
														label="Maak opdracht"
														onClick={() =>
															history.push(
																generateAssignmentCreateLink(
																	'KIJK',
																	itemMetaData.external_id,
																	'ITEM'
																)
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
												ariaLabel="toggle bladwijzer"
											/>
											<Button type="tertiary" icon="share-2" ariaLabel="share item" />
											<Button type="tertiary" icon="flag" ariaLabel="rapporteer item" />
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
									<Heading type="h3">Metadata</Heading>
									<Table horizontal untable>
										<Grid tag="tbody">
											{!!itemMetaData.issued && (
												<Column size="2-5" tag="tr">
													<th scope="row">Publicatiedatum</th>
													<td>{reorderDate(itemMetaData.issued, '/')}</td>
												</Column>
											)}
											{!!itemMetaData.published_at && (
												<Column size="2-5" tag="tr">
													<th scope="row">Toegevoegd op</th>
													<td>{reorderDate(itemMetaData.published_at, '/')}</td>
												</Column>
											)}
										</Grid>
										<Grid tag="tbody">
											{!!itemMetaData.organisation && !!itemMetaData.organisation.name && (
												<Column size="2-5" tag="tr">
													<th scope="row">Aanbieder</th>
													<td>{generateSearchLink('provider', itemMetaData.organisation.name)}</td>
												</Column>
											)}
											{!!itemMetaData.duration && (
												<Column size="2-5" tag="tr">
													<th scope="row">Speelduur</th>
													<td>{itemMetaData.duration}</td>
												</Column>
											)}
										</Grid>
										<Grid tag="tbody">
											{!!itemMetaData.series && (
												<Column size="2-5" tag="tr">
													<th scope="row">Reeks</th>
													<td>{generateSearchLink('serie', itemMetaData.series)}</td>
												</Column>
											)}
											{!!itemMetaData.lom_languages && !!itemMetaData.lom_languages.length && (
												<Column size="2-5" tag="tr">
													<th scope="row">Taal</th>
													<td>
														{itemMetaData.lom_languages
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
											{!!itemMetaData.external_id && !!itemMetaData.lom_context && (
												<tr>
													<th scope="row">Geschikt voor</th>
													<td>
														{generateSearchLinks(
															itemMetaData.external_id,
															'educationLevel',
															itemMetaData.lom_context
														)}
													</td>
												</tr>
											)}
											{!!itemMetaData.external_id && !!itemMetaData.lom_classification && (
												<tr>
													<th scope="row">Vakken</th>
													<td>
														{generateSearchLinks(
															itemMetaData.external_id,
															'subject',
															itemMetaData.lom_classification
														)}
													</td>
												</tr>
											)}
										</tbody>
									</Table>
									<div className="c-hr" />
									<Table horizontal untable>
										<tbody>
											{!!itemMetaData.lom_keywords && !!itemMetaData.lom_keywords.length && (
												<tr>
													<th scope="row">Trefwoorden</th>
													<td>
														<TagList
															tags={itemMetaData.lom_keywords.map(keyword => ({
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
											{/*<th scope="row">Klascement</th>*/}
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
									<Heading type="h3">Bekijk ook</Heading>
									<ul className="c-media-card-list">{renderRelatedItems()}</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>
				{typeof itemId !== undefined && (
					<AddToCollectionModal
						history={history}
						location={location}
						match={match}
						user={user}
						itemMetaData={itemMetaData}
						externalId={itemId as string}
						isOpen={isOpenAddToCollectionModal}
						onClose={() => setIsOpenAddToCollectionModal(false)}
					/>
				)}
			</>
		);
	};

	return (
		<DataQueryComponent
			query={GET_ITEM_BY_ID}
			variables={{ id: itemId }}
			resultPath="app_item_meta[0]"
			renderData={renderItem}
			notFoundMessage="Dit item werd niet gevonden"
		/>
	);
};

export default Item;
