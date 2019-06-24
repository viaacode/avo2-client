import { mount, shallow } from 'enzyme';
import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { SearchResult } from './SearchResult';
import { fakeSearchResult } from './SearchResult.stories';

const searchResult = (
	<Router>
		<SearchResult
			type={fakeSearchResult.administrative_type as 'collection' | 'video' | 'audio'}
			originalCp={fakeSearchResult.original_cp}
			date={fakeSearchResult.dcterms_issued}
			pid={fakeSearchResult.pid}
			title={fakeSearchResult.dc_title}
			link={`/detail/${fakeSearchResult.pid}`}
			description={fakeSearchResult.dcterms_abstract}
			duration={fakeSearchResult.fragment_duration_time || 0}
			numberOfItems={25}
			tags={['Redactiekeuze', 'Partner']}
			thumbnailPath={fakeSearchResult.thumbnail_path}
			originalCpLink={`/search?filters={"provider":["${fakeSearchResult.original_cp}"]}`}
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
});
