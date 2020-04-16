import { History } from 'history';
import { get, isArray, isEmpty, isNil, noop } from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { ButtonAction, LinkTarget } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { BUNDLE_PATH } from '../../bundle/bundle.const';
import { APP_PATH, CONTENT_TYPE_TO_ROUTE } from '../../constants';
import { ToastService } from '../services';
import i18n from '../translations/i18n';
import { getEnv } from './env';

type RouteParams = { [key: string]: string | number | undefined };

const getMissingParams = (route: string): string[] => route.split('/').filter(r => r.match(/^:/));
const navigationConsoleError = (route: string, missingParams: string[] = []) => {
	const paramsString = missingParams.join(', ');
	console.error(`The following params were not included: [${paramsString}] for route ${route}`);
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
		ToastService.danger(
			i18n.t('shared/helpers/link___de-navigatie-is-afgebroken-wegens-foutieve-parameters')
		);

		return;
	}

	// Abort navigation if link build fails
	const builtLink = buildLink(route, params, search);

	if (isEmpty(builtLink)) {
		ToastService.danger(
			i18n.t('shared/helpers/link___de-navigatie-is-afgebroken-wegens-foutieve-parameters')
		);

		return;
	}

	history.push(builtLink);
};

export function navigateToAbsoluteOrRelativeUrl(
	url: string,
	history: History,
	target: LinkTarget = LinkTarget.Self
) {
	let fullUrl = url;
	if (url.startsWith('www.')) {
		fullUrl = `//${url}`;
	}
	if (target === LinkTarget.Self) {
		if (fullUrl.includes('//')) {
			// absolute url
			window.location.href = fullUrl;
		} else {
			// relative url
			history.push(fullUrl);
		}
	} else {
		if (fullUrl.includes('//')) {
			// absolute fullUrl
			window.open(fullUrl);
		} else {
			// relative url
			window.open(`${window.location.origin}${fullUrl}`);
		}
	}
}

export const navigateToContentType = (action: ButtonAction, history: History) => {
	if (action) {
		const { type, value, target } = action;

		switch (
			type as Avo.Core.ContentPickerType | 'PROJECTS' // TODO remove after update to typings 2.16.0
		) {
			case 'INTERNAL_LINK':
			case 'CONTENT_PAGE':
			case 'PROJECTS':
				navigateToAbsoluteOrRelativeUrl(String(value), history, target);
				break;

			case 'COLLECTION':
				const collectionUrl = buildLink(APP_PATH.COLLECTION_DETAIL.route, {
					id: value as string,
				});
				navigateToAbsoluteOrRelativeUrl(collectionUrl, history, target);
				break;

			case 'ITEM':
				const itemUrl = buildLink(APP_PATH.ITEM_DETAIL.route, {
					id: value,
				});
				navigateToAbsoluteOrRelativeUrl(itemUrl, history, target);
				break;

			case 'BUNDLE':
				const bundleUrl = buildLink(BUNDLE_PATH.BUNDLE_DETAIL, {
					id: value,
				});
				navigateToAbsoluteOrRelativeUrl(bundleUrl, history, target);
				break;

			case 'EXTERNAL_LINK':
				const externalUrl = ((value as string) || '').replace(
					'{{PROXY_URL}}',
					getEnv('PROXY_URL') || ''
				);
				navigateToAbsoluteOrRelativeUrl(externalUrl, history, target);
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

	return buildLink(APP_PATH.SEARCH.route, {}, queryParams);
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
		APP_PATH.ASSIGNMENT_CREATE.route,
		{},
		`assignment_type=${assignmentType}&content_id=${contentId}&content_label=${contentLabel}`
	);
}
