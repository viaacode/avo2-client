import { debounce } from 'lodash-es';
import queryString from 'query-string';
import React, {
	createRef,
	CSSProperties,
	Fragment,
	FunctionComponent,
	ReactNode,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Scrollbar } from 'react-scrollbars-custom';

import {
	Button,
	Column,
	Container,
	convertToHtml,
	ExpandableContainer,
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

import {
	ContentTypeNumber,
	ContentTypeString,
	dutchContentLabelToEnglishLabel,
} from '../../collection/types';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { FlowPlayer } from '../../shared/components/FlowPlayer/FlowPlayer';
import { reorderDate } from '../../shared/helpers/formatters/date';
import {
	generateAssignmentCreateLink,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
} from '../../shared/helpers/generateLink';
import { LANGUAGES } from '../../shared/helpers/languages';
import { parseDuration } from '../../shared/helpers/parsers/duration';
import { fetchPlayerTicket } from '../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { GET_ITEM_BY_ID } from '../item.gql';
import { AddFragmentToCollection } from './modals/AddFragmentToCollection';

import { ContentType } from '@viaa/avo2-components/dist/types';
import './Item.scss';

interface ItemProps extends RouteComponentProps {}

const Item: FunctionComponent<ItemProps> = ({ history, match }) => {
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [itemId] = useState<string | undefined>((match.params as any)['id']);
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [time, setTime] = useState<number>(0);
	const [videoHeight, setVideoHeight] = useState<number>(387); // correct height for desktop screens
	const [isOpenAddFragmentToCollectionModal, setIsOpenAddFragmentToCollectionModal] = useState(
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
	}, [time, history, videoRef, itemId]);

	useEffect(() => {
		// Register window listener when the component mounts
		const onResizeHandler = debounce(
			() => {
				if (videoRef.current) {
					const vidHeight = videoRef.current.getBoundingClientRect().height;
					setVideoHeight(vidHeight);
				} else {
					setVideoHeight(387);
				}
			},
			300,
			{ leading: false, trailing: true }
		);
		window.addEventListener('resize', onResizeHandler);
		onResizeHandler();

		return () => {
			window.removeEventListener('resize', onResizeHandler);
		};
	}, [videoRef]);

	/**
	 * Set video current time from the query params once the video has loaded its meta data
	 * If this happens sooner, the time will be ignored by the video player
	 */
	// TODO trigger this function when flowplayer is loaded
	// const getSeekerTimeFromQueryParams = () => {
	// 	const queryParams = queryString.parse(location.search);
	// 	setTime(parseInt((queryParams.time as string) || '0', 10));
	// };

	const handleTimeLinkClicked = async (timestamp: string) => {
		const seconds = parseDuration(timestamp);
		setTime(seconds);
	};

	/**
	 * Split string by time markers and adds links to those times into the output jsx code
	 */
	const formatTimestamps = (description: string = ''): ReactNode => {
		const timestampRegex = /([0-9]{2}:[0-9]{2}:[0-9]{2}|\n)/g;
		const parts: string[] = description.split(timestampRegex);
		return parts.map((part: string, index: number) => {
			if (part === '\n') {
				return <br key={`description-new-line-${index}`} />;
			}

			if (timestampRegex.test(part)) {
				return (
					<a
						key={`description-link-${index}`}
						className="u-clickable"
						onClick={() => handleTimeLinkClicked(part)}
					>
						{part}
					</a>
				);
			}

			return <span key={`description-part-${index}`} dangerouslySetInnerHTML={{ __html: part }} />;
		});
	};

	const goToSearchPage = (prop: Avo.Search.FilterProp, value: string) => {
		history.push(generateSearchLinkString(prop, value));
	};

	const relatedItemStyle: CSSProperties = { width: '100%', float: 'left', marginRight: '2%' };

	const renderItem = (itemMetaData: Avo.Item.Response) => {
		const initFlowPlayer = () =>
			!playerTicket &&
			fetchPlayerTicket(itemMetaData.external_id)
				.then(data => setPlayerTicket(data))
				.catch((err: any) => {
					console.error(err);
					toastService('Het ophalen van de mediaplayer ticket is mislukt', TOAST_TYPE.DANGER);
				});
		const englishContentType: ContentType =
			dutchContentLabelToEnglishLabel(itemMetaData.type.label) || ContentTypeString.video;

		return (
			<Fragment>
				<Container mode="vertical" size="small" background={'alt'}>
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<Spacer margin="bottom">
										<div className="c-content-type c-content-type--video">
											{itemMetaData.type && (
												<Icon
													name={
														itemMetaData.type.id === ContentTypeNumber.audio
															? 'headphone'
															: itemMetaData.type.label
													}
												/>
											)}
											<p>{itemMetaData.type.label}</p>
										</div>
									</Spacer>
									<h1 className="c-h2 u-m-b-0">{itemMetaData.title}</h1>
									<MetaData
										spaced={true}
										category={dutchContentLabelToEnglishLabel(itemMetaData.type.label)}
									>
										{itemMetaData.org_name && (
											<MetaDataItem>
												{generateSearchLink('provider', itemMetaData.org_name || '')}
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
											Uit reeks: {generateSearchLink('serie', itemMetaData.series)}
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
						<Grid>
							<Column size="2-7">
								<Container mode="vertical" size="small">
									<div className="c-video-player t-player-skin--dark">
										{itemMetaData.thumbnail_path && ( // TODO: Replace publisher, published_at by real publisher
											<FlowPlayer
												src={playerTicket ? playerTicket.toString() : null}
												poster={itemMetaData.thumbnail_path}
												title={itemMetaData.title}
												onInit={initFlowPlayer}
												subtitles={['Publicatiedatum', 'Aanbieder']}
											/>
										)}
									</div>
									<Spacer margin="top-large">
										<Flex justify="between" wrap>
											<div className="c-button-toolbar">
												<Flex justify="between" wrap>
													<Button
														type="tertiary"
														icon="add"
														label="Voeg fragment toe aan collectie"
														onClick={() => setIsOpenAddFragmentToCollectionModal(true)}
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
											</div>
										</Flex>
										<div className="c-button-toolbar">
											<ToggleButton
												type="tertiary"
												icon="bookmark"
												active={false}
												ariaLabel="toggle bladwijzer"
											/>
											<Button type="tertiary" icon="share-2" ariaLabel="share item" />
											<Button type="tertiary" icon="flag" ariaLabel="rapporteer item" />
										</div>
									</Spacer>
								</Container>
							</Column>
							<Column size="2-5">
								<Container mode="vertical">
									<Scrollbar
										style={{
											width: '100%',
											height: `${84 + videoHeight}px`, // Height of button
											overflowY: 'auto',
										}}
									>
										<h4 className="c-h4">Beschrijving</h4>
										{/* "description" label height (20) + padding (14) */}
										<ExpandableContainer collapsedHeight={videoHeight - 20 - 14}>
											<p style={{ paddingRight: '1rem' }}>
												{formatTimestamps(convertToHtml(itemMetaData.description))}
											</p>
										</ExpandableContainer>
									</Scrollbar>
								</Container>
							</Column>
						</Grid>
						<Grid>
							<Column size="2-7">
								<Container mode="vertical" size="small">
									{/* TODO: make columns, data and rowKey props optional */}
									<Table columns={[]} data={[]} rowKey="">
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
									{/* TODO: make columns, data and rowKey props optional */}
									<Table columns={[]} data={[]} rowKey="">
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
									{/* TODO: make columns, data and rowKey props optional */}
									<Table columns={[]} data={[]} rowKey="">
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
					<AddFragmentToCollection
						itemMetaData={itemMetaData}
						externalId={itemId as string}
						isOpen={isOpenAddFragmentToCollectionModal}
						onClose={() => setIsOpenAddFragmentToCollectionModal(false)}
					/>
				)}
			</Fragment>
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
