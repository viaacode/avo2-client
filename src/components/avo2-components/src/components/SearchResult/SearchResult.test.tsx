import { mount, shallow } from 'enzyme';
import React from 'react';

import { BrowserRouter as Router, Link } from 'react-router-dom';
import { Thumbnail } from '../..';
import { SearchResult } from './SearchResult';
import {
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
} from './SearchResult.slots';
import { fakeSearchResult } from './SearchResult.stories';

const searchResult = (
	<Router>
		<SearchResult
			type={fakeSearchResult.administrative_type as 'collection' | 'video' | 'audio'}
			date={fakeSearchResult.dcterms_issued}
			id={fakeSearchResult.pid}
			description={fakeSearchResult.dcterms_abstract}
			duration={fakeSearchResult.fragment_duration_time}
			numberOfItems={25}
			tags={['Redactiekeuze', 'Partner']}
		>
			<SearchResultTitle>
				<Link to={`/detail/${fakeSearchResult.pid}`}>{fakeSearchResult.dc_title}</Link>
			</SearchResultTitle>
			<SearchResultSubtitle>
				<Link to={`/search?filters={'provider':['${fakeSearchResult.original_cp}']}`}>
					{fakeSearchResult.original_cp}
				</Link>
			</SearchResultSubtitle>
			<SearchResultThumbnail>
				<Link to={`detail/${fakeSearchResult.pid}`}>
					<Thumbnail
						category={fakeSearchResult.administrative_type as any}
						src={fakeSearchResult.thumbnail_path}
						label={fakeSearchResult.administrative_type}
					/>
				</Link>
			</SearchResultThumbnail>
		</SearchResult>
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
