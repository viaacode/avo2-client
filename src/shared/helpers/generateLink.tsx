import React, { Fragment } from 'react';

import { Avo } from '@viaa/avo2-types';

import { isArray, noop } from 'lodash-es';
import { Link } from 'react-router-dom';

export function generateSearchLinks(
	key: string,
	filterProp: keyof Avo.Search.Filters,
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
	filterProp: keyof Avo.Search.Filters,
	filterValue: string | undefined,
	className: string = '',
	onClick: () => void = noop
) {
	return (
		<Fragment>
			{filterValue && (
				<Link
					className={className}
					to={generateSearchLinkString(filterProp, filterValue)}
					onClick={onClick}
				>
					{filterValue}
				</Link>
			)}
			{!filterValue && <Fragment />}
		</Fragment>
	);
}

export function generateSearchLinkString(
	filterProp: keyof Avo.Search.Filters,
	filterValue: string
) {
	return `/search?filters={"${filterProp}":["${filterValue}"]}`;
}
