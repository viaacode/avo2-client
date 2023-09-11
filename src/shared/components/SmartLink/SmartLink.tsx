import { ButtonAction, LinkTarget } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { fromPairs, map } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../../constants';
import { buildLink, getEnv } from '../../helpers';

export interface SmartLinkProps {
	action?: ButtonAction | null;
	removeStyles?: boolean;
	title?: string;
	children: ReactNode;
}

const SmartLink: FunctionComponent<SmartLinkProps> = ({
	action,
	removeStyles = true,
	title,
	children,
}) => {
	const renderLink = (
		url: string,
		target: LinkTarget = LinkTarget.Self
	): ReactElement<any, any> | null => {
		let fullUrl = url;
		if (url.startsWith('www.')) {
			fullUrl = `//${url}`;
		}

		switch (target) {
			case LinkTarget.Self:
				// Open inside same tab
				if (fullUrl.includes('//')) {
					// absolute url
					return (
						<a
							href={fullUrl}
							target="_self"
							className={classnames({ 'a-link__no-styles': removeStyles })}
							title={title}
						>
							{children}
						</a>
					);
				}
				// relative url
				return (
					<Link
						to={fullUrl}
						className={classnames({ 'a-link__no-styles': removeStyles })}
						title={title}
					>
						{children}
					</Link>
				);

			case LinkTarget.Blank:
			default:
				// Open in a new tab
				if (fullUrl.includes('//')) {
					// absolute fullUrl
					return (
						<a
							href={fullUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={classnames({ 'a-link__no-styles': removeStyles })}
							title={title}
						>
							{children}
						</a>
					);
				}
				// relative url
				return (
					<a
						href={`${window.location.origin}${fullUrl}`}
						target="_blank"
						rel="noopener noreferrer"
						className={classnames({ 'a-link__no-styles': removeStyles })}
						title={title}
					>
						{children}
					</a>
				);
		}
	};

	const renderSmartLink = (): ReactElement<any, any> | null => {
		if (action) {
			const { type, value, target } = action;

			if (!value) {
				return <>{children}</>;
			}

			switch (type as Avo.Core.ContentPickerType) {
				case 'INTERNAL_LINK':
				case 'CONTENT_PAGE':
				case 'PROJECTS':
					return renderLink(String(value), target);

				case 'COLLECTION': {
					const collectionUrl = buildLink(APP_PATH.COLLECTION_DETAIL.route, {
						id: value as string,
					});
					return renderLink(collectionUrl, target);
				}

				case 'ITEM': {
					const itemUrl = buildLink(APP_PATH.ITEM_DETAIL.route, {
						id: value,
					});
					return renderLink(itemUrl, target);
				}

				case 'BUNDLE': {
					const bundleUrl = buildLink(APP_PATH.BUNDLE_DETAIL.route, {
						id: value,
					});
					return renderLink(bundleUrl, target);
				}

				case 'EXTERNAL_LINK': {
					const externalUrl = ((value as string) || '').replace(
						'{{PROXY_URL}}',
						getEnv('PROXY_URL') || ''
					);
					return renderLink(externalUrl, target);
				}

				case 'ANCHOR_LINK': {
					const urlWithoutQueryOrAnchor = window.location.href
						.split('?')[0]
						.split('#')[0];
					return renderLink(`${urlWithoutQueryOrAnchor}#${value}`, target);
				}

				case 'FILE':
					return renderLink(value as string, LinkTarget.Blank);

				case 'SEARCH_QUERY': {
					const queryParams = JSON.parse(value as string);
					return renderLink(
						buildLink(
							APP_PATH.SEARCH.route,
							{},
							queryString.stringify(
								fromPairs(
									map(queryParams, (queryParamValue, queryParam) => [
										queryParam,
										JSON.stringify(queryParamValue),
									])
								)
							)
						),
						target
					);
				}

				default:
					break;
			}
		}
		return <>{children}</>;
	};

	return renderSmartLink();
};

export default SmartLink;
