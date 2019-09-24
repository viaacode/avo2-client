import React, { Fragment } from 'react';

import { Blankslate, Container, Flex, Pagination, Spacer, Spinner } from '@viaa/avo2-components';

import SearchResultItem from './SearchResultItem';
import { SearchResultsProps } from './types';

const SearchResults = ({
	currentPage,
	loading,
	data,
	pageCount,
	setPage,
	...resultProps
}: SearchResultsProps) => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				{loading ? (
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				) : data && data.count !== 0 ? (
					<Fragment>
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
					</Fragment>
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
