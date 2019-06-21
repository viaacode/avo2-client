import React from 'react';

import { storiesOf } from '@storybook/react';

import { BrowserRouter as Router } from 'react-router-dom';
import { SearchResult } from './SearchResult';

export const fakeSearchResult = {
	pid: 'bg2h71p77x',
	table_name: 'shared.items',
	dc_title: 'Pano: wie verdient er aan uw schulden?',
	dc_titles_serie: 'Pano',
	thumbnail_path:
		'https://archief-media.viaa.be/viaa/TESTBEELD/0ea36207fefb4754aaf953c89785ac596d8b4ccfe6004689a8e7c969228b55a5/keyframes/keyframes_1_1/keyframe59.jpg',
	original_cp: 'VRT',
	original_cp_id: 'OR-rf5kf25',
	lom_context: ['Secundair onderwijs'],
	lom_keywords: [
		'afbetaling',
		'armoede',
		'economie',
		'factuur',
		'geld',
		'gerechtsdeurwaarder',
		'rekening',
		'schulden',
		'veiling',
	],
	lom_languages: ['nl'],
	dcterms_issued: '2018-02-28',
	dcterms_abstract:
		"Pano is een duidingsmagazine met indringende reportages over de grote thema's van deze tijd.\n\nVier kinderen en meer dan 40 000 euro aan schulden. Dat is waar Barbara mee achterblijft op het moment dat haar man verdwijnt met de noorderzon. Ook al heeft hij de financiële put gegraven, getrouwd is getrouwd. \n\nEn dus komt de hele puinhoop terecht op haar tengere schouders. Met haar fabrieksloon probeert ze de rekeningen te betalen. Ook die van de school. Tot de gerechtsdeurwaarder toch aanbelt. En daar komen nog eens zoveel kosten bovenop ... Dat ervaart ook Jan, een verarmde zelfstandige en zelfverklaard deurwaarder-ervaringsdeskundige, die op amper twaalf jaar tijd 22 000 euro extra heeft moeten betalen.\n\nHet systeem van schulden innen is helemaal dolgedraaid. Dat vindt Patrick Van Buggenhout, zelf een gerechtsdeurwaarder nota bene. Hij heeft een probleem met de overmatige kosten die al heel snel bovenop een schuldbedrag komen. Van Buggenhout heeft zijn twijfels of al zijn collega deurwaarders bereid zijn om al te veel te sleutelen aan de huidige lucratieve manier van schulden innen.",
	lom_classification: [
		'economie - SEI - boekhouding - bedrijfsbeheer',
		'gedrags- en cultuurwetenschappen',
		'handel - kantoor - verkoop',
		'levensbeschouwing',
		'PAV - MAVO - GASV - ASPV',
		'politieke en sociale wetenschappen - maatschappijleer',
		'recht',
	],
	lom_typical_age_range: ['Secundair 2de graad', 'Secundair 3de graad'],
	lom_intended_enduser_role: ['Docent', 'Student'],
	algemeen_briefing_id: ['9da4cc22-331c-41a6-8c42-781581148f56'],
	fragment_duration_time: null,
	fragment_duration_seconds: 0,
	administrative_type: 'video',
	administrative_external_id: 'bg2h71p77x',
};

storiesOf('SearchResult', module)
	.addParameters({ jest: ['SearchResult'] })
	.add('SearchResult', () => (
		<Router>
			<SearchResult
				link={`detail/${fakeSearchResult.pid}`}
				type={fakeSearchResult.administrative_type as 'collection' | 'video' | 'audio'}
				creator={fakeSearchResult.original_cp}
				creatorSearchLink={`search?filters={"provider":["${fakeSearchResult.original_cp}"]}`}
				date={fakeSearchResult.dcterms_issued}
				pid={fakeSearchResult.pid}
				title={fakeSearchResult.dc_title}
				description={fakeSearchResult.dcterms_abstract}
				duration={fakeSearchResult.fragment_duration_time || 0}
				numberOfItems={25}
				tags={['Redactiekeuze', 'Partner']}
				thumbnailPath={fakeSearchResult.thumbnail_path}
			/>
		</Router>
	));
