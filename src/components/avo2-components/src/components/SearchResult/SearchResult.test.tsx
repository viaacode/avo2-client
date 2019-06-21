import { mount, shallow } from 'enzyme';
import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { SearchResult } from './SearchResult';
import { fakeSearchResult } from './SearchResult.stories';

const searchResult = (
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
);

describe('<SearchResult />', () => {
	it('Should be able to render', () => {
		shallow(searchResult);
	});

	it('Should set the correct className', () => {
		const searchResultComponent = mount(searchResult);

		const searchResultElement = searchResultComponent.childAt(0);

		// expect(searchResultElement.hasClass('c-search-result')).toBe(true); // Doesn't work
		expect(searchResultElement.html()).toMatch(/^<div class="c-search-result">.*/);
	});

	it('Should render Thumbnail component', () => {
		const searchResultComponent = mount(searchResult);

		const thumbnailElement = searchResultComponent.find('.c-thumbnail');

		expect(thumbnailElement).toHaveLength(1);
	});

	it('Should correctly set the title link', () => {
		const searchResultComponent = mount(searchResult);

		const titleElement = searchResultComponent.find('.c-search-result__title');

		expect(titleElement.html()).toContain(
			`<a href="/detail/${fakeSearchResult.pid}">${fakeSearchResult.dc_title}</a>`
		);
	});
});
