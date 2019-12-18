import React, { FunctionComponent } from 'react';

import { Blankslate, Container, Flex, Pagination, Spacer, Spinner } from '@viaa/avo2-components';

import { SearchResultsProps } from '../search.types';
import SearchResultItem from './SearchResultItem';

const SearchResults: FunctionComponent<SearchResultsProps> = ({
	currentPage,
	loading,
	data,
	pageCount,
	setPage,
	...resultProps
}) => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				{loading ? (
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				) : data && data.results && data.count !== 0 ? (
					<>
						<ul className="c-search-result-list">
							{data.results.map((result, index) => (
								<SearchResultItem
									{...resultProps}
									key={`search-result-item-${index}`}
									result={result}
								/>
							))}
						</ul>
						<Spacer margin="large">
							<Pagination pageCount={pageCount} currentPage={currentPage} onPageChange={setPage} />
						</Spacer>
					</>
				) : (
					<Blankslate
						body=""
						icon="search"
						title="Er zijn geen zoekresultaten die voldoen aan uw filters."
					/>
				)}
			</Container>
		</Container>
	);
};

export default SearchResults;
