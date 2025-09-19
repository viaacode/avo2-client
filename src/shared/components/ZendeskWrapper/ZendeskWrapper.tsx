import React, { type FC } from 'react';
import Zendesk from 'react-zendesk';

import { getEnv } from '../../helpers/env';

declare const ResizeObserver: any;

const FOOTER_HEIGHT = 373;

export const ZendeskWrapper: FC = () => {
	/**
	 * Change the bottom margin of the zendesk widget so it doesn't overlap with the footer
	 */
	const onLoaded = () => {
		let widget: HTMLIFrameElement | null;
		let footerHeight = FOOTER_HEIGHT;
		const zendeskMarginBottom = -27;
		const updateFooterHeight = () => {
			footerHeight =
				document.querySelector('.c-global-footer')?.clientHeight || FOOTER_HEIGHT;
		};
		const updateMargin = () => {
			if (widget) {
				const scrollHeight = document.documentElement.scrollHeight;
				const screenHeight = document.documentElement.clientHeight;
				const scrollTop = document.documentElement.scrollTop;
				if (scrollHeight - screenHeight - scrollTop < footerHeight + zendeskMarginBottom) {
					widget.style.marginBottom = `${
						footerHeight +
						zendeskMarginBottom -
						(scrollHeight - screenHeight - scrollTop)
					}px`;
				} else {
					widget.style.marginBottom = '10px';
				}
			}
		};
		document.addEventListener('scroll', updateMargin);
		document.addEventListener('resize', () => {
			updateFooterHeight();
			updateMargin();
		});

		// Safari < 13.1
		if (!ResizeObserver) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			updateFooterHeight();
			updateMargin();
		});

		resizeObserver.observe(document.body);

		const getZendeskWidget = () => {
			widget = document.querySelector('iframe#launcher');
			if (!widget) {
				setTimeout(getZendeskWidget, 100);
			} else {
				updateFooterHeight();
				updateMargin();
			}
		};
		getZendeskWidget();
	};

	return (
		<Zendesk zendeskKey={getEnv('ZENDESK_KEY') as string} defer={true} onLoaded={onLoaded} />
	);
};
