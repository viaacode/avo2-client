import queryString from 'query-string';
import React, {
	createRef,
	CSSProperties,
	FunctionComponent,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Flex,
	Grid,
	Icon,
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

import { ContentType } from '@viaa/avo2-components/dist/types';
import {
	ContentTypeNumber,
	ContentTypeString,
	dutchContentLabelToEnglishLabel,
} from '../../collection/types';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { reorderDate } from '../../shared/helpers/formatters/date';
import {
	generateAssignmentCreateLink,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
} from '../../shared/helpers/generateLink';
import { LANGUAGES } from '../../shared/helpers/languages';
import { trackEvents } from '../../shared/services/event-logging-service';
import { IconName } from '../../shared/types/types';
import ItemVideoDescription from '../components/ItemVideoDescription';
import FragmentAddToCollection from '../components/modals/FragmentAddToCollection';
import { GET_ITEM_BY_ID } from '../item.gql';

import { getProfileName } from '../../authentication/helpers/get-profile-info';
import './Item.scss';

interface ItemProps extends RouteComponentProps {}

const Item: FunctionComponent<ItemProps> = ({ history, match }) => {
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [itemId] = useState<string | undefined>((match.params as any)['id']);
	const [time] = useState<number>(0);
	const [isOpenFragmentAddToCollectionModal, setIsOpenFragmentAddToCollectionModal] = useState(
		false
	);

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

		// Log event of item page view
		if (itemId) {
			trackEvents({
				event_object: {
					type: 'item',
					identifier: itemId,
				},
				event_message: `Gebruiker ${getProfileName()} heeft de pagina van fragment ${itemId} bezocht`,
				name: 'view',
				category: 'item',
			});
		}
	}, [time, history, videoRef, itemId]);

	/**
	 * Set video current time from the query params once the video has loaded its meta data
	 * If this happens sooner, the time will be ignored by the video player
	 */
	// TODO trigger this function when flowplayer is loaded
	// const getSeekerTimeFromQueryParams = () => {
	// 	const queryParams = queryString.parse(location.search);
	// 	setTime(parseInt((queryParams.time as string) || '0', 10));
	// };

	const goToSearchPage = (prop: Avo.Search.FilterProp, value: string) => {
		history.push(generateSearchLinkString(prop, value));
	};

	const relatedItemStyle: CSSProperties = { width: '100%', float: 'left', marginRight: '2%' };

	const renderItem = (itemMetaData: Avo.Item.Item) => {
		const englishContentType: ContentType =
			dutchContentLabelToEnglishLabel(itemMetaData.type.label) || ContentTypeString.video;

		return (
			<>
				<Container mode="vertical" size="small" background="alt">
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<Spacer margin="bottom">
										<div className="c-content-type c-content-type--video">
											{itemMetaData.type && (
												<Icon
													name={
														(itemMetaData.type.id === ContentTypeNumber.audio
															? 'headphone'
															: itemMetaData.type.label) as IconName
													}
												/>
											)}
											<p>{itemMetaData.type.label}</p>
										</div>
									</Spacer>
									<h1 className="c-h2 u-m-0">{itemMetaData.title}</h1>
									<MetaData
										spaced={true}
										category={dutchContentLabelToEnglishLabel(itemMetaData.type.label)}
									>
										{itemMetaData.org_name && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													{generateSearchLink('provider', itemMetaData.org_name || '')}
												</p>
											</MetaDataItem>
										)}
										{itemMetaData.publish_at && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													Gepubliceerd op {reorderDate(itemMetaData.issued || null, '/')}
												</p>
											</MetaDataItem>
										)}
										<MetaDataItem>
											<p className="c-body-2 u-text-muted">
												Uit reeks: {generateSearchLink('serie', itemMetaData.series)}
											</p>
										</MetaDataItem>
									</MetaData>
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="u-mq-switch-main-nav-authentication">
										<MetaData category={englishContentType}>
											{/* TODO link meta data to actual data */}
											<MetaDataItem label={String(188)} icon="eye" />
											<MetaDataItem label={String(370)} icon="bookmark" />
											{itemMetaData.type.id === ContentTypeNumber.collection && (
												<MetaDataItem label={String(12)} icon="collection" />
											)}
										</MetaData>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Container mode="vertical">
					<Container mode="horizontal">
						<ItemVideoDescription itemMetaData={itemMetaData} />
						<Grid>
							<Column size="2-7">
								<Spacer margin="top-large">
									<Flex justify="between" wrap>
										<ButtonToolbar>
											<Flex justify="between" wrap>
												<Button
													type="tertiary"
													icon="add"
													label="Voeg fragment toe aan collectie"
													onClick={() => setIsOpenFragmentAddToCollectionModal(true)}
												/>
												<Button
													type="tertiary"
													icon="clipboard"
													label="Maak opdracht"
													onClick={() =>
														history.push(
															generateAssignmentCreateLink('KIJK', itemMetaData.external_id, 'ITEM')
														)
													}
												/>
											</Flex>
										</ButtonToolbar>
									</Flex>
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
								</Spacer>
							</Column>
							<Column size="2-5">
								<></>
							</Column>
						</Grid>
						<Grid>
							<Column size="2-7">
								<Container mode="vertical" size="small">
									{/* TODO: make rowKey prop optional */}
									<Table rowKey="">
										<Grid tag="tbody">
											<Column size="2-5" tag="tr">
												<th scope="row">Publicatiedatum</th>
												<td>{reorderDate(itemMetaData.publish_at || null, '/')}</td>
											</Column>
											<Column size="2-5" tag="tr">
												<th scope="row">Toegevoegd op</th>
												{/* TODO replace meta data with actual data from api (more fields than SearchResultItem */}
												<td>{reorderDate(itemMetaData.issued || null, '/')}</td>
											</Column>
										</Grid>
										<Grid tag="tbody">
											<Column size="2-5" tag="tr">
												<th scope="row">Aanbieder</th>
												{itemMetaData.org_name && (
													<td>{generateSearchLink('provider', itemMetaData.org_name || '')}</td>
												)}
											</Column>
											<Column size="2-5" tag="tr">
												<th scope="row">Speelduur</th>
												<td>{itemMetaData.duration}</td>
											</Column>
										</Grid>
										<Grid tag="tbody">
											<Column size="2-5" tag="tr">
												<th scope="row">Reeks</th>
												<td>{generateSearchLink('serie', itemMetaData.series)}</td>
											</Column>
											<Column size="2-5" tag="tr">
												<th scope="row">Taal</th>
												<td>
													{(itemMetaData.lom_languages || [])
														.map(languageCode => LANGUAGES.nl[languageCode])
														.join(', ')}
												</td>
											</Column>
										</Grid>
									</Table>
									<div className="c-hr" />
									{/* TODO: make rowKey prop optional */}
									<Table rowKey="">
										<tbody>
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
										</tbody>
									</Table>
									<div className="c-hr" />
									{/* TODO: make rowKey prop optional */}
									<Table rowKey="">
										<tbody>
											<tr>
												<th scope="row">Trefwoorden</th>
												<td>
													<TagList
														tags={(itemMetaData.lom_keywords || []).map(keyword => ({
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
									<h3 className="c-h3">Bekijk ook</h3>
									<ul className="c-media-card-list">
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${itemMetaData.id}`}
												category={englishContentType}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={englishContentType}
														src={itemMetaData.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={englishContentType}>
														<MetaDataItem label={itemMetaData.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${itemMetaData.id}`}
												category={englishContentType}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={englishContentType}
														src={itemMetaData.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={englishContentType}>
														<MetaDataItem label={itemMetaData.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${itemMetaData.id}`}
												category={englishContentType}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={englishContentType}
														src={itemMetaData.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={englishContentType}>
														<MetaDataItem label={itemMetaData.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${itemMetaData.id}`}
												category={englishContentType}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={englishContentType}
														src={itemMetaData.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={englishContentType}>
														<MetaDataItem label={itemMetaData.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${itemMetaData.id}`}
												category={englishContentType}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={englishContentType}
														src={itemMetaData.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={englishContentType}>
														<MetaDataItem label={itemMetaData.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
									</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>
				{typeof itemId !== undefined && (
					<FragmentAddToCollection
						itemMetaData={itemMetaData}
						externalId={itemId as string}
						isOpen={isOpenFragmentAddToCollectionModal}
						onClose={() => setIsOpenFragmentAddToCollectionModal(false)}
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

export default withRouter(Item);
