import React, {
	createRef,
	Fragment,
	FunctionComponent,
	ReactNode,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { debounce } from 'lodash-es';
import marked from 'marked';
import queryString from 'query-string';
import { Scrollbar } from 'react-scrollbars-custom';

import {
	Button,
	Column,
	Container,
	ExpandableContainer,
	Grid,
	Icon,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Spacer,
	TagList,
	Thumbnail,
	ToggleButton,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { reorderDate } from '../../shared/helpers/formatters/date';
import {
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
} from '../../shared/helpers/generateLink';
import { LANGUAGES } from '../../shared/helpers/languages';
import { parseDuration } from '../../shared/helpers/parsers/duration';
import './Item.scss';
import { AddFragmentToCollection } from './modals/AddFragmentToCollection';

import { GET_ITEM_BY_ID } from '../item.gql';

interface ItemProps extends RouteComponentProps {}

const Item: FunctionComponent<ItemProps> = ({ history, location, match }) => {
	const videoRef: RefObject<HTMLVideoElement> = createRef();

	const [itemId] = useState((match.params as any)['id'] as string);
	const [time, setTime] = useState(0);
	const [videoHeight, setVideoHeight] = useState(387); // correct height for desktop screens
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
	const getSeekerTimeFromQueryParams = () => {
		const queryParams = queryString.parse(location.search);
		setTime(parseInt((queryParams.time as string) || '0', 10));
	};

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

	const relatedItemStyle: any = { width: '100%', float: 'left', marginRight: '2%' };

	const renderItem = (item: Avo.Item.Response) => {
		return (
			<Fragment>
				<Container mode="vertical" size="small" background="alt">
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<Spacer margin="bottom">
										<div className="c-content-type c-content-type--video">
											{item.type && (
												<Icon name={item.type.label === 'audio' ? 'headphone' : item.type.label} />
											)}
											<p>Video</p>
										</div>
									</Spacer>
									<h1 className="c-h2 u-m-b-0">{item.title}</h1>
									<MetaData spaced={true} category={item.type.label || 'video'}>
										<MetaDataItem>
											{generateSearchLink('provider', item.org_name || '')}
										</MetaDataItem>
										{item.publish_at && (
											<MetaDataItem>
												<p className="c-body-2 u-text-muted">
													Gepubliceerd op {reorderDate(item.issued || null, '/')}
												</p>
											</MetaDataItem>
										)}
										<MetaDataItem>
											Uit reeks: {generateSearchLink('serie', item.series)}
										</MetaDataItem>
									</MetaData>
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="u-mq-switch-main-nav-authentication">
										<MetaData category={item.type.label || 'video'}>
											{/* TODO link meta data to actual data */}
											<MetaDataItem label={String(188)} icon="eye" />
											<MetaDataItem label={String(370)} icon="bookmark" />
											{item.type.label === 'collection' && (
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
								<div className="o-container-vertical-list">
									<div className="o-container-vertical o-container-vertical--padding-small">
										<div className="c-video-player t-player-skin--dark">
											{/*{item.thumbnail_path && <Image src={item.thumbnail_path} />}*/}
											{item.thumbnail_path && (
												// TODO replace with flow player
												<video
													src={`${item.thumbnail_path.split('/keyframes')[0]}/browse.mp4`}
													placeholder={item.thumbnail_path}
													style={{ width: '100%', display: 'block' }}
													controls={true}
													ref={videoRef}
													onLoadedMetadata={getSeekerTimeFromQueryParams}
												/>
											)}
										</div>
										<Spacer margin="top-large">
											<div className="o-flex o-flex--justify-between o-flex--wrap">
												<div className="c-button-toolbar">
													<div className="o-flex o-flex--justify-between o-flex--wrap">
														<Button
															type="tertiary"
															icon="add"
															label="Voeg fragment toe aan collectie"
															onClick={() => setIsOpenAddFragmentToCollectionModal(true)}
														/>
														<Button type="tertiary" icon="clipboard" label="Maak opdracht" />
													</div>
												</div>
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
											</div>
										</Spacer>
									</div>
								</div>
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
												{formatTimestamps(marked(item.description || ''))}
											</p>
										</ExpandableContainer>
									</Scrollbar>
								</Container>
							</Column>
						</Grid>
						<Grid>
							<Column size="2-7">
								<div className="o-container-vertical o-container-vertical--padding-small">
									<table className="c-table c-table--horizontal c-table--untable">
										<tbody className="o-grid">
											<tr className="o-grid-col-bp2-5">
												<th scope="row">Publicatiedatum</th>
												<td>{reorderDate(item.publish_at || null, '/')}</td>
											</tr>
											<tr className="o-grid-col-bp2-5">
												<th scope="row">Toegevoegd op</th>
												{/* TODO replace meta data with actual data from api (more fields than SearchResultItem */}
												<td>{reorderDate(item.issued || null, '/')}</td>
											</tr>
										</tbody>
										<tbody className="o-grid">
											<tr className="o-grid-col-bp2-5">
												<th scope="row">Aanbieder</th>
												{item.org_name && (
													<td>{generateSearchLink('provider', item.org_name || '')}</td>
												)}
											</tr>
											<tr className="o-grid-col-bp2-5">
												<th scope="row">Speelduur</th>
												<td>{item.duration}</td>
											</tr>
										</tbody>
										<tbody className="o-grid">
											<tr className="o-grid-col-bp2-5">
												<th scope="row">Reeks</th>
												<td>{generateSearchLink('serie', item.series)}</td>
											</tr>
											<tr className="o-grid-col-bp2-5">
												<th scope="row">Taal</th>
												<td>
													{(item.lom_languages || [])
														.map(languageCode => LANGUAGES.nl[languageCode])
														.join(', ')}
												</td>
											</tr>
										</tbody>
									</table>
									<div className="c-hr" />
									<table className="c-table c-table--horizontal c-table--untable">
										<tbody>
											<tr>
												<th scope="row">Geschikt voor</th>
												<td>
													{generateSearchLinks(
														item.external_id,
														'educationLevel',
														item.lom_context
													)}
												</td>
											</tr>
											<tr>
												<th scope="row">Vakken</th>
												<td>
													{generateSearchLinks(
														item.external_id,
														'subject',
														item.lom_classification
													)}
												</td>
											</tr>
										</tbody>
									</table>
									<div className="c-hr" />
									<table className="c-table c-table--horizontal c-table--untable">
										<tbody>
											<tr>
												<th scope="row">Trefwoorden</th>
												<td>
													<TagList
														tags={(item.lom_keywords || []).map(keyword => ({
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
									</table>
								</div>
							</Column>
							<Column size="2-5">
								<Container size="small" mode="vertical">
									<h3 className="c-h3">Bekijk ook</h3>
									<ul className="c-media-card-list">
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${item.id}`}
												category={item.type.label || 'video'}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={item.type.label || 'video'}
														src={item.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={item.type.label || 'video'}>
														<MetaDataItem label={item.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${item.id}`}
												category={item.type.label || 'video'}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={item.type.label || 'video'}
														src={item.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={item.type.label || 'video'}>
														<MetaDataItem label={item.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${item.id}`}
												category={item.type.label || 'video'}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={item.type.label || 'video'}
														src={item.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={item.type.label || 'video'}>
														<MetaDataItem label={item.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${item.id}`}
												category={item.type.label || 'video'}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={item.type.label || 'video'}
														src={item.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={item.type.label || 'video'}>
														<MetaDataItem label={item.org_name || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/item/${item.id}`}
												category={item.type.label || 'video'}
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category={item.type.label || 'video'}
														src={item.thumbnail_path}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category={item.type.label || 'video'}>
														<MetaDataItem label={item.org_name || ''} />
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
				<AddFragmentToCollection
					itemInfo={item}
					externalId={itemId}
					isOpen={isOpenAddFragmentToCollectionModal}
					onClose={() => setIsOpenAddFragmentToCollectionModal(false)}
				/>
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
