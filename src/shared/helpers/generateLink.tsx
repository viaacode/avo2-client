import React, { Fragment } from 'react';

import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

import { isArray, noop } from 'lodash-es';
import { Link } from 'react-router-dom';
import { RouteParts } from '../../constants';

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: RouteParts.Item,
	audio: RouteParts.Item,
	collection: RouteParts.Collection,
	bundle: RouteParts.Folder,
};

export function generateSearchLinks(
	key: string,
	filterProp: Avo.Search.FilterProp,
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
	filterProp: Avo.Search.FilterProp,
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

export function generateSearchLinkString(filterProp: Avo.Search.FilterProp, filterValue: string) {
	if (String(filterProp) === 'query') {
		const queryParams = queryString.stringify({ filters: JSON.stringify({ query: filterValue }) });
		return `/${RouteParts.Search}?${queryParams}`;
	}

	const queryParams = queryString.stringify({ filters: `{"${filterProp}":["${filterValue}"]}` });
	return `/${RouteParts.Search}?${queryParams}`;
}

export function generateContentLinkString(contentType: Avo.Core.ContentType, id: string) {
	return `/${CONTENT_TYPE_TO_ROUTE[contentType]}/${id}`;
}
