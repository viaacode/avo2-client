import { stripRichTextParagraph } from './strip-rich-text-paragraph.js';

describe('stripRichTextParagraph', () => {
	it('Should not remove p style attribute', () => {
		const originalHtml =
			'<p style="text-align:center">Simpel! Drie <a href="/start" target="_self">stappen</a> naar een geslaagde opdracht:</p>';
		const strippedHtml = stripRichTextParagraph(originalHtml);
		expect(strippedHtml).toEqual(originalHtml);
	});

	it('Should remove wrapping p tag without link', () => {
		const originalHtml =
			'<p>Simpel! Drie <a href="/start" target="_self">stappen</a> naar een geslaagde opdracht:</p>';
		const strippedHtml = stripRichTextParagraph(originalHtml);
		expect(strippedHtml).toEqual(
			'Simpel! Drie <a href="/start" target="_self">stappen</a> naar een geslaagde opdracht:'
		);
	});

	it('Should remove wrapping p tag', () => {
		const originalHtml = '<p>Simpel</p>';
		const strippedHtml = stripRichTextParagraph(originalHtml);
		expect(strippedHtml).toEqual('Simpel');
	});

	it('Should remove wrapping p tag when there are multiple p tags', () => {
		const originalHtml = '<p>Simpel <p>and</p> advanced</p>';
		const strippedHtml = stripRichTextParagraph(originalHtml);
		expect(strippedHtml).toEqual(originalHtml);
	});
});
