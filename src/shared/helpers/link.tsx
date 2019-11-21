import { History } from 'history';
import { get, isArray, isEmpty, isNil, noop } from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Avo } from '@viaa/avo2-types';

import { ASSIGNMENT_PATH } from '../../assignment/assignment.const';
import { SEARCH_PATH } from '../../search/search.const';

import { CONTENT_TYPE_TO_ROUTE } from '../constants';
import toastService, { TOAST_TYPE } from '../services/toast-service';

type RouteParams = { [key: string]: string | number | undefined };

const getMissingParams = (route: string): string[] => route.split('/').filter(r => r.match(/^:/));
const showNavigateError = (params: string[], route: string) => {
	const paramsString = params.join(', ').replace(':', '');

	console.error(`The following params were not included: [${paramsString}] for route ${route}`);
	toastService(`De navigatie is afgebroken wegens foutieve parameters`, TOAST_TYPE.DANGER);
};

export const buildLink = (route: string, params: RouteParams = {}, search?: string): string => {
	let builtLink = route;

	// Replace url with given params
	Object.keys(params).forEach((param: string) => {
		builtLink = builtLink.replace(`:${param}`, String(get(params, [param], '')));
	});

	const missingParams = getMissingParams(builtLink);

	// Return empty string if not all params were replaced
	if (missingParams.length > 0) {
		console.error(`The following params were not included: [${missingParams}] for route ${route}`);
		return '';
	}

	// Add search query if present
	return search ? `${builtLink}?${search}` : builtLink;
};

export const navigate = (
	history: History,
	route: string,
	params: RouteParams = {},
	search?: string
) => {
	let missingParams = getMissingParams(route);

	// Abort navigation when params were expected but none were given
	if (missingParams.length > 0 && (isNil(params) || isEmpty(params))) {
		showNavigateError(missingParams, route);

		return;
	}

	const builtLink = buildLink(route, params, search);
	missingParams = getMissingParams(builtLink);

	// Abort navigation if not all params were replaced
	if (missingParams.length > 0) {
		showNavigateError(missingParams, route);

		return;
	}

	history.push(builtLink);
};

export const generateSearchLinks = (
	key: string,
	filterProp: Avo.Search.FilterProp,
	filterValue: string | string[] | undefined,
	className: string = ''
) => {
	if (isArray(filterValue)) {
		return filterValue.map((value: string, index: number) => (
			<Fragment key={`${key}:${filterProp}":${value}`}>
				{generateSearchLink(filterProp, value, className)}
				{index === filterValue.length - 1 ? '' : ', '}
			</Fragment>
		));
	}

	return generateSearchLink(filterProp, filterValue, className);
};

export function generateSearchLink(
	filterProp: Avo.Search.FilterProp,
	filterValue: string | undefined,
	className: string = '',
	onClick: () => void = noop
) {
	return filterValue ? (
		<Link
			className={className}
			to={generateSearchLinkString(filterProp, filterValue)}
			onClick={onClick}
		>
			{filterValue}
		</Link>
	) : (
		<Fragment />
	);
}

export function generateSearchLinkString(filterProp: Avo.Search.FilterProp, filterValue: string) {
	const queryParams =
		String(filterProp) === 'query'
			? queryString.stringify({ filters: JSON.stringify({ query: filterValue }) })
			: queryString.stringify({ filters: `{"${filterProp}":["${filterValue}"]}` });

	return buildLink(SEARCH_PATH.SEARCH, {}, queryParams);
}

export function generateContentLinkString(contentType: Avo.Core.ContentType, id: string) {
	return `/${CONTENT_TYPE_TO_ROUTE[contentType]}/${id}`;
}

export function generateAssignmentCreateLink(
	assignmentType: Avo.Assignment.Type,
	contentId?: string,
	contentLabel?: Avo.Assignment.ContentLabel
) {
	return buildLink(
		ASSIGNMENT_PATH.ASSIGNMENT_CREATE,
		{},
		`assignment_type=${assignmentType}&content_id=${contentId}&content_label=${contentLabel}`
	);
}
