import { History } from 'history';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Avo } from '@viaa/avo2-types';
import { isArray, isEmpty, isNil, noop } from 'lodash-es';
import queryString from 'query-string';

import { RouteParts } from '../../constants';
import toastService, { TOAST_TYPE } from '../services/toast-service';

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: RouteParts.Item,
	audio: RouteParts.Item,
	collectie: RouteParts.Collection,
	bundel: RouteParts.Folder,
};

export function navigate(history: History, route: string, params: { [key: string]: any } = {}) {
	const showError = (params: string[]) => {
		const paramsString = params.join(', ').replace(':', '');

		console.error(`The following params were not included: [${paramsString}] for ${route}`);
		toastService(`De navigatie is afgebroken wegens foutieve parameters`, TOAST_TYPE.DANGER);
	};
	let builtLink = route;
	let missingParams: string[] = [];

	// Abort navigation when params were expected but none were given
	if (route.includes(':') && (isNil(params) || isEmpty(params))) {
		missingParams = route.split('/').filter(r => r.includes(':'));

		showError(missingParams);

		return;
	}

	// Replace url with given params
	Object.keys(params).forEach((param: string) => {
		const substring = `:${param}`;
		const replaced = builtLink.search(substring) >= 0;

		// Check if something was actually replaced
		if (!replaced) {
			missingParams.push(substring);
		}

		builtLink = builtLink.replace(substring, params[param]);
	});

	// Abort navigation if not all params were replaced
	if (missingParams.length) {
		showError(missingParams);

		return;
	}

	history.push(builtLink);
}

export function generateSearchLinks(
	key: string,
	filterProp: Avo.Search.FilterProp,
	filterValue: string | string[] | undefined,
	className: string = ''
) {
	if (isArray(filterValue)) {
		return filterValue.map((value: string, index: number) => (
			<Fragment key={`${key}:${filterProp}":${value}`}>
				{generateSearchLink(filterProp, value, className)}
				{index === filterValue.length - 1 ? '' : ', '}
			</Fragment>
		));
	}
	return generateSearchLink(filterProp, filterValue, className);
}

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

	return `/${RouteParts.Search}?${queryParams}`;
}

export function generateContentLinkString(contentType: Avo.Core.ContentType, id: string) {
	return `/${CONTENT_TYPE_TO_ROUTE[contentType]}/${id}`;
}

export function generateAssignmentCreateLink(
	assignmentType: Avo.Assignment.Type,
	contentId?: string,
	contentLabel?: Avo.Assignment.ContentLabel
) {
	return `/${RouteParts.Workspace}/${RouteParts.Assignments}/${
		RouteParts.Create
	}?assignment_type=${assignmentType}&content_id=${contentId}&content_label=${contentLabel}`;
}
