import React, { Component, Fragment } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import {
	Button,
	Column,
	Container,
	Grid,
	Icon,
	Image,
	MediaCard,
	MetaData,
	MetaDataItem,
	TagList,
	ToggleButton,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '../../components/avo2-components/src';
import {
	generateSearchLink,
	generateSearchLinks,
} from '../../components/avo2-components/src/helpers/generateLink';
import { formatDate, formatDuration } from '../../helpers/formatting';
import { SearchResultItem } from '../../types';

type DetailProps = {};

interface DetailState extends StaticContext {
	item: Partial<SearchResultItem>;
}

export class Detail extends Component<RouteComponentProps<DetailProps>, DetailState> {
	constructor(props: RouteComponentProps) {
		super(props);
		this.state = {
			item: {
				pid: '8911n96442',
				table_name: 'shared.items',
				dc_title: 'De Canvasconnectie: Jean-Hervé Peron',
				dc_titles_serie: 'De Canvasconnectie',
				thumbnail_path:
					'https://archief-media.viaa.be/viaa/TESTBEELD/292aa9ef099f47da9062542f5fa73c361fb8734976f246689b58eeca78d6eba1/keyframes/keyframes_1_1/keyframe15.jpg',
				original_cp: 'VRT',
				original_cp_id: 'OR-rf5kf25',
				lom_context: ['DKO', 'Secundair onderwijs'],
				lom_keywords: [
					'beeldende kunst',
					'Duitsland',
					'Faust',
					'Frank Zappa',
					'Henri de Toulouse-Lautrec',
					'Louis Armstrong',
					'Miles Davis',
					'muziek',
				],
				lom_languages: ['de', 'en', 'fr', 'nl'],
				dcterms_issued: '2015-11-10',
				dcterms_abstract:
					"Elke week gaat de Canvasconnectie op bezoek bij één kunstenaar. We zien hem of haar in volle voorbereiding van nieuw werk. Tegelijk maakt de kunstenaar een keuze uit een album met werk van collega's en geeft daar commentaar bij. \n\nDeze aflevering: Jean-Hervé Peron\n\nJean-Hervé Peron is de frontman van de legendarische Duitse groep Faust. \u2028Samen met andere krautrockbands als Kraftwerk, Can en Neu! verlegden ze in de jaren 1970 de grenzen van de rockmuziek. \u2028Met hun inventieve en onconventionele albums effenden ze het pad voor groepen als Radiohead, Sonic Youth en The Flaming Lips, die het pionierswerk van Faust een inspiratie noemen. \u2028Onlangs verscheen hun album 'jUSt' waarmee ze op 19 november in Utrecht optraden. \u2028De Canvasconnectie zoekt Jean-Hervé Peron op in het Duitse Schiphorst, waar hij teruggetrokken op zijn hoeve leeft.\n\n00:00:00 Generiek.\n\n00:01:22 Beelden van Jean-Hervé Peron thuis in Schiphorst\n\n00:01:50 Peron vertelt over hoe hij opgevoed werd met muziek. Hij moest verplicht naar de muziekschool.\n\n00:02:24 Hij vertelt over zijn eerste instrument: de kornet. Zijn idool was Louis Armstrong.\n\n00:02:48 Archiefbeeld van Louis Armstrong die ‘C'est si bon’ speelt.\n\n00:03:56 Beelden van Miles Davis die ‘Bitches Brew’ speelt. \n\n00:04:30 Peron speelt een deuntje op zijn eerste trompet.\n\n00:05:40 Peron spreekt over waarom hij Frank Zappa zo goed vindt.\n\n00:06:03 Clip van Frank Zappa & The Mothers of Invention die ‘Call Any Vegetable’ speelt.\n\n00:06:29 Peron verteld dat Zappa de eerste band uit de VS was die anders was en taboes doorbrak.\n\n00:06:36 Clip van Frank Zappa die ‘Bobby Brown’ speelt.\n\n00:07:39 Peron vertelt dat hij één jaar in de VS gewoond heeft en terug naar Europa is getrokken na mei '68.\n\n00:08:37 Archiefbeelden tonen de betogingen van mei '68.\n\n00:09:55 Peron praat over de Duitse expressionistische regisseur F.W. Murnau. Er worden beelden getoond van de film 'Sunrise'.\n\n00:10:31 Fragment uit de film ‘Nosferatu’ van Murnau.\n\n00:12:11 Peron vertelt over Toulouse-Lautrec.\n\n00:13:17 Er worden diverse schilderijen van Toulouse-Lautrec getoond.\n\n00:14:45 Archiefbeelden tonen het Toulouse-Lautrec Institut in Hamburg.\n\n00:14:52 Peron verteld over Uwe Nettelbeck, Duitse schlagers en over het dorpje Wümme waar zijn groep voor het eerst muziek maakte. \n\n00:18:43 Archiefbeelden van Rudolf Sosna.\n\n00:19:20 Beelden van Faust die ‘Flashback Caruso’ spelen.\n\n00:20:36 Peron praat over de Amerikaanse fotograaf George S. Zimbel.\n\n00:21:38 Er worden diverse foto's van Zimbel getoond.\n\n00:22:39 Peron heeft het over de Japanse muzikant Keiji Haino.\n\n00:22:49 Er wordt een fragment getoond van een performance van Keiji Haino.\n\n00:23:18 Peron vertelt over Haino die wacht tot het publiek volledig stil is alvorens te beginnen.\n\n00:27:03 Peron zegt dat \"alles kunst is en kunst overal is\". Hij praat ook over Fluxus.\n\n00:28:02 Peron praat over de avant-garde kunstenaar Tony Conrad.\n\n00:28:54 Peron vertelt over hoe Faust in het voorprogramma van Conrad mocht spelen.\n\n00:29:41 Er wordt een fragment getoond van Tony Conrad die samen met Faust optrad in Berlijn.",
				lom_classification: [
					'beeldende kunsten - schilderkunst, beeldhouwkunst, bouwkunst',
					'fotografie - video - film',
					'gedrags- en cultuurwetenschappen',
					'muzikale opvoeding - muziek',
					'PAV - MAVO - GASV - ASPV',
				],
				lom_typical_age_range: ['Secundair 2de graad', 'Secundair 3de graad'],
				lom_intended_enduser_role: ['Docent', 'Student'],
				algemeen_briefing_id: ['a29aa718-91b7-4a43-9813-a598b83799c7'],
				fragment_duration_time: null,
				fragment_duration_seconds: 0,
				administrative_type: 'video',
				administrative_external_id: '8911n96442',
			},
		};
		// TODO: get item from store by id
		const itemId: string = (props.match.params as any)['id'];
	}

	async componentDidMount() {}

	render() {
		const item = this.state.item;

		return (
			<Fragment>
				<Container mode="vertical" size="small" background="alt">
					<Container>
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<div className="u-spacer-bottom">
										<div className="c-content-type c-content-type--video">
											{item.administrative_type && <Icon name={item.administrative_type} />}
											<p>Video</p>
										</div>
										<h1 className="c-h2 u-m-b-0">{item.dc_title}</h1>
										<MetaData spaced={true}>
											<MetaDataItem>
												{generateSearchLinks('provider', item.original_cp)}
											</MetaDataItem>
											{item.dcterms_issued && (
												<MetaDataItem>
													<p className="c-body-2 u-text-muted">
														Gepubliceerd op {formatDate(item.dcterms_issued, '/')}
													</p>
												</MetaDataItem>
											)}
											<MetaDataItem>
												Uit reeks: {generateSearchLinks('serie', item.dc_titles_serie)}
											</MetaDataItem>
										</MetaData>
									</div>
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<MetaData category={item.administrative_type}>
										{/* TODO link meta data to actual data */}
										<MetaDataItem label={String(188)} icon="eye" />
										<MetaDataItem label={String(370)} icon="heart" />
										{item.administrative_type === 'collection' && (
											<MetaDataItem label={String(12)} icon="collection" />
										)}
									</MetaData>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Container mode="vertical">
					<Container>
						<Grid>
							<Column size="2-8">
								<div className="o-container-vertical-list">
									<div className="o-container-vertical o-container-vertical--padding-small">
										<div className="c-video-player t-player-skin--dark">
											{item.thumbnail_path && <Image src={item.thumbnail_path} />}
										</div>
										<div className="u-spacer-top-l">
											<div className="o-flex o-flex--justify-between o-flex--wrap">
												<div className="c-button-toolbar u-spacer-right">
													<Button
														type="tertiary"
														icon="add"
														label="Voeg fragment toe aan collectie"
													/>
													<Button type="tertiary" icon="clipboard" label="Maak opdracht" />
												</div>
												<div className="c-button-toolbar">
													<ToggleButton type="tertiary" icon="heart" active={false} />
													<Button type="tertiary" icon="share-2" />
													<Button type="tertiary" icon="flag" />
												</div>
											</div>
										</div>
									</div>
									<div className="o-container-vertical o-container-vertical--padding-small">
										<h4 className="c-h4">Omschrijving</h4>
										<p>{item.dcterms_abstract}</p>
										<div className="u-spacer-top-s">
											<div className="u-text-center">
												<Button type="secondary">Meer lezen</Button>
											</div>
										</div>
										<div className="c-hr" />
										<table className="c-table c-table--horizontal c-table--untable">
											<tbody>
												<tr>
													<th scope="row">Publicatiedatum</th>
													<td>{item.dcterms_issued && formatDate(item.dcterms_issued, '/')}</td>
													<th scope="row">Toegevoegd op</th>
													{/* TODO replace meta data with actual data from api (more fields than SearchResultItem */}
													<td>{item.dcterms_issued && formatDate(item.dcterms_issued, '/')}</td>
												</tr>
												<tr>
													<th scope="row">Aanbieder</th>
													<td>{generateSearchLink('provider', item.original_cp)}</td>
													<th scope="row">Speelduur</th>
													<td>{formatDuration(item.fragment_duration_time)}</td>
												</tr>
												<tr>
													<th scope="row">Reeks</th>
													<td>
														<td>{generateSearchLink('serie', item.dc_titles_serie)}</td>
													</td>
													<th scope="row">Taal</th>
													<td>{(item.lom_languages || []).join(', ')}</td>
												</tr>
											</tbody>
										</table>
										<div className="c-hr" />
										<table className="c-table c-table--horizontal c-table--untable">
											<tbody>
												<tr>
													<th scope="row">Geschikt voor</th>
													<td>
														{generateSearchLinks('educationLevel', item.lom_typical_age_range)}
													</td>
												</tr>
												<tr>
													<th scope="row">Vakken</th>
													<td>
														<td>{generateSearchLinks('subject', item.lom_classification)}</td>
													</td>
												</tr>
											</tbody>
										</table>
										<div className="c-hr" />
										<table className="c-table c-table--horizontal c-table--untable">
											<tbody>
												<tr>
													<th scope="row">Onderwerpen</th>
													<td>
														<TagList tags={item.lom_keywords || []} swatches={false} />
													</td>
												</tr>
												<tr>
													<th scope="row">Klascement</th>
													<td>
														<a href={'http://www.klascement.be/link_item'}>
															www.klascement.be/link_item
														</a>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</Column>
							<Column size="2-4">
								<Container mode="vertical">
									<h3 className="c-h3">Bekijk ook</h3>
									<ul className="c-media-card-list">
										<li>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												metaData={[{ label: item.original_cp || '' }]}
												href={`detail/${item.pid}`}
												category={item.administrative_type || 'video'}
												orientation="horizontal"
											/>
										</li>
										<li>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												metaData={[{ label: item.original_cp || '' }]}
												href={`detail/${item.pid}`}
												category={item.administrative_type || 'video'}
												orientation="horizontal"
											/>
										</li>
										<li>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												metaData={[{ label: item.original_cp || '' }]}
												href={`detail/${item.pid}`}
												category={item.administrative_type || 'video'}
												orientation="horizontal"
											/>
										</li>
										<li>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												metaData={[{ label: item.original_cp || '' }]}
												href={`detail/${item.pid}`}
												category={item.administrative_type || 'video'}
												orientation="horizontal"
											/>
										</li>
									</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>
			</Fragment>
		);
	}
}
