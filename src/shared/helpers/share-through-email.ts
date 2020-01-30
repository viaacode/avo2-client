import { getEnv } from './env';
import { CustomError } from './error';

export async function shareThroughEmail(
	email: string,
	title: string,
	link: string,
	type: 'item' | 'collection' | 'bundle'
): Promise<void> {
	let url: string | undefined = undefined;
	let body: any = undefined;
	try {
		url = `${getEnv('PROXY_URL')}/campaign-monitor/send`;
		body = {
			to: email,
			template: type,
			data: {
				mainLink: link,
				mainTitle: title,
			},
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
			credentials: 'include',
		});
		const reply = await response.json();
		console.log(reply);
		return;
	} catch (err) {
		throw new CustomError('Failed to get player ticket', err, {
			email,
			title,
			link,
			type,
			url,
			body,
		});
	}
}
