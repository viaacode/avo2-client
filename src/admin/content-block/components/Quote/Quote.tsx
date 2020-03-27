import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import { AvatarIcon, Container, DefaultProps } from '@viaa/avo2-components';

export interface QuoteProps extends DefaultProps {
	quote: string;
	authorImage?: string;
	authorName: string;
	authorInitials?: string;
}

export const Quote: FunctionComponent<QuoteProps> = ({
	className,
	quote,
	authorImage,
	authorName,
	authorInitials,
}) => (
	<Container className={classnames(className, 'o-container-vertical-quote')} mode="vertical">
		<div className="c-quote">
			<blockquote className="c-quote__text">{quote}</blockquote>
			{authorName && (
				<cite className="c-quote__author">
					<AvatarIcon initials={authorInitials} image={authorImage} />
					<span>{authorName}</span>
				</cite>
			)}
		</div>
	</Container>
);
