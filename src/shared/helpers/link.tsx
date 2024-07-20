import { LinkTarget } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { isArray, isEmpty, isNil } from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment, type ReactNode } from 'react';
import { type RouteComponentProps } from 'react-router-dom';

import { APP_PATH, CONTENT_TYPE_TO_ROUTE } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import { type FilterState } from '../../search/search.types';
import { ToastService } from '../services/toast-service';

import {
	buildLink,
	getMissingParams,
	navigationConsoleError,
	type RouteParams,
} from './build-link';
import { tHtml } from './translate';

export { buildLink } from './build-link';

export const navigate = (
	history: RouteComponentProps['history'],
	route: string,
	params: RouteParams = {},
	search?: string | { [paramName: string]: string },
	action: 'push' | 'replace' = 'push'
): void => {
	const missingParams = getMissingParams(route);

	// Abort navigation when params were expected but none were given
	if (missingParams.length > 0 && (isNil(params) || isEmpty(params))) {
		navigationConsoleError(route, missingParams);
		ToastService.danger(
			tHtml('shared/helpers/link___de-navigatie-is-afgebroken-wegens-foutieve-parameters')
		);

		return;
	}

	// Abort navigation if link build fails
	const builtLink = buildLink(route, params, search);

	if (isEmpty(builtLink)) {
		ToastService.danger(
			tHtml('shared/helpers/link___de-navigatie-is-afgebroken-wegens-foutieve-parameters')
		);

		return;
	}
	if (action === 'push') {
		history.push(builtLink);
	} else if (action === 'replace') {
		history.replace(builtLink);
	}
};

// TODO see if we can replace this method completely by the new SmartLink component
export function navigateToAbsoluteOrRelativeUrl(
	url: string,
	history: RouteComponentProps['history'],
	target: LinkTarget = LinkTarget.Self
): void {
	let fullUrl = url;
	if (url.startsWith('www.')) {
		fullUrl = `//${url}`;
	}
	switch (target) {
		case LinkTarget.Self:
			if (fullUrl.includes('//')) {
				// absolute url
				window.location.href = fullUrl;
			} else {
				// relative url
				history.push(fullUrl);
			}
			break;

		case LinkTarget.Blank:
		default:
			if (fullUrl.includes('//')) {
				// absolute fullUrl
				window.open(fullUrl);
			} else {
				// relative url
				window.open(`${window.location.origin}${fullUrl}`);
			}
			break;
	}
}

export const renderSearchLinks = (
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode,
	key: string,
	filterProp: Avo.Search.FilterProp,
	filterValue: string | string[] | undefined,
	className = ''
): ReactNode => {
	if (isArray(filterValue)) {
		return filterValue.map((value: string, index: number) => (
			<Fragment key={`${key}:${filterProp}":${value}`}>
				{renderSearchLink(
					value,
					{
						filters: { [filterProp]: [value] },
					},
					className
				)}
				{index === filterValue.length - 1 ? '' : ', '}
			</Fragment>
		));
	}

	return renderSearchLink(
		filterValue,
		{
			filters: { [filterProp]: [filterValue] },
		},
		className
	);
};

export function generateSearchLinkString(
	filterProp?: Avo.Search.FilterProp,
	filterValue?: string,
	orderProperty?: Avo.Search.OrderProperty,
	orderDirection?: Avo.Search.OrderDirection
): string {
	const queryParamObject: any = {};
	if (String(filterProp) === SearchFilter.query) {
		queryParamObject.filters = JSON.stringify({ query: filterValue });
	} else if (!!filterProp && !!filterValue) {
		queryParamObject.filters = `{"${filterProp}":["${filterValue}"]}`;
	}
	if (orderProperty) {
		queryParamObject.orderProperty = orderProperty;
	}
	if (orderDirection) {
		queryParamObject.orderDirection = orderDirection;
	}

	return buildLink(APP_PATH.SEARCH.route, {}, queryString.stringify(queryParamObject));
}

export function generateContentLinkString(contentType: Avo.Core.ContentType, id: string): string {
	return buildLink(`${CONTENT_TYPE_TO_ROUTE[contentType]}`, { id });
}
