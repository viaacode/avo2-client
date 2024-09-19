import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui/dist/client.mjs';
import React, { type FunctionComponent } from 'react';

export interface HtmlProps {
	content: string;
	sanitizePreset?: SanitizePreset;
	type?: 'p' | 'div' | 'span';
	className?: string;
}

const Html: FunctionComponent<HtmlProps> = ({
	content,
	sanitizePreset = SanitizePreset.link,
	type = 'p',
	className,
}) => {
	const Type = type;

	return (
		<Type
			dangerouslySetInnerHTML={{ __html: sanitizeHtml(content, sanitizePreset) }}
			className={className}
		/>
	);
};

export default Html;
