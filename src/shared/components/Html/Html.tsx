import React, { FunctionComponent } from 'react';

import { sanitize } from '../../helpers/sanitize';
import { SanitizePreset } from '../../helpers/sanitize/presets';

export interface HtmlProps {
	content: string;
	sanitizePreset?: SanitizePreset;
	type?: 'p' | 'div' | 'span';
	className?: string;
}

const Html: FunctionComponent<HtmlProps> = ({
	content,
	sanitizePreset = 'link',
	type = 'p',
	className,
}) => {
	const Type = type;

	return (
		<Type
			dangerouslySetInnerHTML={{ __html: sanitize(content, sanitizePreset) }}
			className={className}
		/>
	);
};

export default Html;
