import { isArray } from 'lodash-es';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Filters } from '../types';

export function generateSearchLinks(
	key: string,
	filterProp: keyof Filters,
	filterValue: string | string[] | undefined,
	className: string = ''
) {
	if (isArray(filterValue)) {
		return filterValue.map((value: string, index: number) => {
			return (
				<Fragment key={`${key}:${filterProp}":${value}`}>
					{generateSearchLink(filterProp, value, className)}
					{index === filterValue.length - 1 ? '' : ', '}
				</Fragment>
			);
		});
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
			<Link className={className} to={generateSearchLinkString(filterProp, filterValue)}>
				{filterValue}
			</Link>
		)
	);
}

export function generateSearchLinkString(filterProp: keyof Filters, filterValue: string) {
	return `/search?filters={"${filterProp}":["${filterValue}"]}`;
}
