import { History } from 'history';
import { get, isArray, isEmpty, isNil, noop } from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Avo } from '@viaa/avo2-types';

import { ASSIGNMENT_PATH } from '../../assignment/assignment.const';
import { BUNDLE_PATH } from '../../bundle/bundle.const';
import { COLLECTION_PATH } from '../../collection/collection.const';
import { CONTENT_TYPE_TO_ROUTE } from '../../constants';
import { ITEM_PATH } from '../../item/item.const';
import { SEARCH_PATH } from '../../search/search.const';
import { toastService } from '../services';
import i18n from '../translations/i18n';
import { ButtonAction } from '@viaa/avo2-components';

type RouteParams = { [key: string]: string | number | undefined };

const getMissingParams = (route: string): string[] => route.split('/').filter(r => r.match(/^:/));
const navigationConsoleError = (route: string, missingParams: string[] = []) => {
	const paramsString = missingParams.join(', ');
	console.error(`The following params were not included: [${paramsString}] for route ${route}`);
};
const navigationToastError = i18n.t(
	'shared/helpers/link___de-navigatie-is-afgebroken-wegens-foutieve-parameters'
);

export const buildLink = (route: string, params: RouteParams = {}, search?: string): string => {
	let builtLink = route;

	// Replace url with given params
	Object.keys(params).forEach((param: string) => {
		builtLink = builtLink.replace(`:${param}`, String(get(params, [param], '')));
	});

	const missingParams = getMissingParams(builtLink);

	// Return empty string if not all params were replaced
	if (missingParams.length > 0) {
		navigationConsoleError(route, missingParams);

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
	const missingParams = getMissingParams(route);

	// Abort navigation when params were expected but none were given
	if (missingParams.length > 0 && (isNil(params) || isEmpty(params))) {
		navigationConsoleError(route, missingParams);
		toastService.danger(navigationToastError);

		return;
	}

	// Abort navigation if link build fails
	const builtLink = buildLink(route, params, search);

	if (isEmpty(builtLink)) {
		toastService.danger(navigationToastError);

		return;
	}

	history.push(builtLink);
};

export const navigateToContentType = (action: ButtonAction, history: History) => {
	if (action) {
		const { type, value } = action;

		switch (type as Avo.Core.ContentPickerType) {
			case 'INTERNAL_LINK':
			case 'CONTENT_PAGE':
				history.push(value as string);
				break;
			case 'COLLECTION':
				navigate(history, COLLECTION_PATH.COLLECTION_DETAIL, {
					id: value as string,
				});
				break;
			case 'ITEM':
				navigate(history, ITEM_PATH.ITEM, {
					id: value,
				});
				break;
			case 'BUNDLE':
				navigate(history, BUNDLE_PATH.BUNDLE_DETAIL, {
					id: value,
				});
				break;
			case 'EXTERNAL_LINK':
				window.location.href = value as string;
				break;
			default:
				break;
		}
	}
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
	return buildLink(`${CONTENT_TYPE_TO_ROUTE[contentType]}`, { id });
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
