import React, { type ReactNode } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { type SearchFilter } from '../../search/search.const';
import { type FilterState } from '../../search/search.types';

import { generateSearchLinkString } from './link';

export const defaultGoToSearchLink =
	(history: RouteComponentProps['history']) =>
	(newFilters: FilterState): void => {
		const filterProp = Object.keys(newFilters.filters || {})[0] as SearchFilter | undefined;
		const filterValue = (newFilters.filters || {})[filterProp as SearchFilter] as
			| string
			| undefined;
		history.push(
			generateSearchLinkString(
				filterProp,
				filterValue,
				newFilters.orderProperty,
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
				newFilters.orderProperty,
				newFilters.orderDirection
			)}
		>
			{linkText}
		</Link>
	);
};
