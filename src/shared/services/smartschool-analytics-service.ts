import { CustomError } from '../helpers';
import { insideIframe } from '../helpers/inside-iframe';

export class SmartschoolAnalyticsService {
	/**
	 * Notify parent frame that link was clicked. This is custom code for Smartschool analytics
	 * https://meemoo.atlassian.net/browse/AVO-1471
	 * @param url
	 * @param title
	 */
	public static triggerUrlEvent(url: string, title?: string): void {
		let message: any | undefined;
		try {
			if (insideIframe()) {
				message = {
					event: 'link',
					metadata: {
						click: {
							title,
							url,
							type: 'outbound',
						},
					},
				};
				window.parent.postMessage(message, '*');
				console.info('posted message to parent frame: ', message);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to notify parent frame of link being clicked', err, {
					message,
				})
			);
		}
	}

	/**
	 * Notify parent frame that movie was played. This is custom code for Smartschool analytics
	 * https://meemoo.atlassian.net/browse/AVO-1471
	 * @param title
	 * @param identifier
	 * @param duration
	 */
	public static triggerVideoPlayEvent(
		title: string | undefined,
		identifier: string | undefined,
		duration: number| undefined
	): void {
		let message: any | undefined;
		try {
			if (insideIframe()) {
				message = {
					event: 'movie',
					metadata: {
						click: {
							title,
							identifier,
							duration,
						},
					},
				};
				window.parent.postMessage(message, '*');
				console.info('posted message to parent frame: ', message);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to notify parent frame of link being clicked', err, {
					message,
				})
			);
		}
	}
}
