import { isArray } from 'lodash-es';
import React from 'react';
import { Link } from 'react-router-dom';
import { Filters } from '../../../../types';

export function generateSearchLinks(
	filterProp: keyof Filters,
	filterValue: string | string[] | undefined,
	className: string = ''
) {
	if (isArray(filterValue)) {
		return filterValue.map(
			(value: string) => `${generateSearchLink(filterProp, value, className)},`
		);
	}
	return generateSearchLink(filterProp, filterValue, className);
}

export function generateSearchLink(
	filterProp: keyof Filters,
	filterValue: string | undefined,
	className: string = ''
) {
	return (
		filterValue && (
			<Link className={className} to={`search?filters={"${filterProp}":[${filterValue}]}`}>
				{filterValue}
			</Link>
		)
	);
}
