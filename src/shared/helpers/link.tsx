import { ButtonAction, ContentPickerType, LinkTarget } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { fromPairs, get, isArray, isEmpty, isNil, isString, map } from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment, ReactElement, ReactNode } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { BUNDLE_PATH } from '../../bundle/bundle.const';
import { APP_PATH, CONTENT_TYPE_TO_ROUTE } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import { FilterState } from '../../search/search.types';
import SmartLink from '../components/SmartLink/SmartLink';
import { ToastService } from '../services/toast-service';

import { getEnv } from './env';
import { insideIframe } from './inside-iframe';
import { tHtml } from './translate';

type RouteParams = { [key: string]: string | number | undefined };

const getMissingParams = (route: string): string[] => route.split('/').filter((r) => r.match(/^:/));
const navigationConsoleError = (route: string, missingParams: string[] = []) => {
	const paramsString = missingParams.join(', ');
	console.error(`The following params were not included: [${paramsString}] for route ${route}`);
};

export const buildLink = (
	route: string,
	params: RouteParams = {},
	search?: string | { [paramName: string]: string }
): string => {
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
	return search
		? `${builtLink}?${isString(search) ? search : queryString.stringify(search)}`
		: builtLink;
};

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

export const generateSmartLink = (
	action: ButtonAction | null | undefined,
	children: ReactNode,
	label?: string,
	title?: string
): ReactElement<any, any> | null => {
	return (
		<SmartLink action={action} label={label} title={title}>
			{children}
		</SmartLink>
	);
};

export const navigateToContentType = (
	action: ButtonAction,
	history: RouteComponentProps['history']
): void => {
	if (action) {
		const { type, value, target } = action;

		let resolvedTarget = target;
		if (insideIframe()) {
			// Klaar page inside smartschool iframe must open all links in new window: https://meemoo.atlassian.net/browse/AVO-1354
			resolvedTarget = LinkTarget.Blank;
		}

		switch (type as ContentPickerType) {
			case 'INTERNAL_LINK':
			case 'CONTENT_PAGE':
			case 'PROJECTS':
				navigateToAbsoluteOrRelativeUrl(String(value), history, resolvedTarget);
				break;

			case 'COLLECTION': {
				const collectionUrl = buildLink(APP_PATH.COLLECTION_DETAIL.route, {
					id: value as string,
				});
				navigateToAbsoluteOrRelativeUrl(collectionUrl, history, resolvedTarget);
				break;
			}

			case 'ITEM': {
				const itemUrl = buildLink(APP_PATH.ITEM_DETAIL.route, {
					id: value,
				});
				navigateToAbsoluteOrRelativeUrl(itemUrl, history, resolvedTarget);
				break;
			}

			case 'BUNDLE': {
				const bundleUrl = buildLink(BUNDLE_PATH.BUNDLE_DETAIL, {
					id: value,
				});
				navigateToAbsoluteOrRelativeUrl(bundleUrl, history, resolvedTarget);
				break;
			}

			case 'EXTERNAL_LINK': {
				const externalUrl = ((value as string) || '').replace(
					'{{PROXY_URL}}',
					getEnv('PROXY_URL') || ''
				);
				navigateToAbsoluteOrRelativeUrl(externalUrl, history, resolvedTarget);
				break;
			}

			case 'ANCHOR_LINK': {
				const urlWithoutQueryOrAnchor = window.location.href.split('?')[0].split('#')[0];
				navigateToAbsoluteOrRelativeUrl(
					`${urlWithoutQueryOrAnchor}#${value}`,
					history,
					resolvedTarget
				);
				break;
			}

			case 'FILE':
				navigateToAbsoluteOrRelativeUrl(value as string, history, LinkTarget.Blank);
				break;

			case 'SEARCH_QUERY': {
				const queryParams = JSON.parse(value as string);
				navigateToAbsoluteOrRelativeUrl(
					buildLink(
						APP_PATH.SEARCH.route,
						{},
						fromPairs(
							map(queryParams, (queryParamValue, queryParam) => [
								queryParam,
								JSON.stringify(queryParamValue),
							])
						)
					),
					history,
					resolvedTarget
				);
				break;
			}

			default:
				break;
		}
	}
};

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

export function openLinkInNewTab(link: string): void {
	const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
	if (newWindow) {
		newWindow.opener = null;
	}
}
