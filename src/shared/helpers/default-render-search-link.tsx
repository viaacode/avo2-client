import React, { type ReactNode } from 'react';
import { type NavigateFunction } from 'react-router';
import { Link } from 'react-router-dom';

import { type SearchFilter } from '../../search/search.const';
import { type FilterState } from '../../search/search.types';

import { generateSearchLinkString } from './link';

export const defaultGoToSearchLink =
	(navigate: NavigateFunction) =>
	(newFilters: FilterState): void => {
		// Get the first filter prop and value (there should only be one)
		const filterProp = Object.keys(newFilters.filters || {})[0] as SearchFilter | undefined;
		const filterValue = (newFilters.filters || {})[filterProp as SearchFilter] as
			| string
			| undefined;
		navigate(
			generateSearchLinkString(
				filterProp,
				filterValue,
				newFilters.orderProperty as any,
				newFilters.orderDirection
			)
		);
	};

export const defaultRenderSearchLink = (
	linkText: string | ReactNode,
	newFilters: FilterState,
	className?: string
): ReactNode => {
	const filterProp = Object.keys(newFilters.filters || {})[0] as SearchFilter | undefined;
	const filterValue = (newFilters.filters || {})[filterProp as SearchFilter] as
		| string
		| undefined;
	return (
		<Link
			className={className}
			to={generateSearchLinkString(
				filterProp,
				filterValue,
				newFilters.orderProperty as any,
				newFilters.orderDirection
			)}
		>
			{linkText}
		</Link>
	);
};
