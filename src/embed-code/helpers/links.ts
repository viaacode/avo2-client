import { stringifyUrl } from 'query-string';

export function toEmbedCodeDetail(embedCodeId: string): string {
	return stringifyUrl({
		url: `${window.location.origin}/embed/index.html`,
		query: {
			'embed-id': embedCodeId,
		},
	});
}
