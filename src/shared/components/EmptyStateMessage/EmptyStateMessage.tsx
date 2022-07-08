import { Container, Flex, Spacer } from '@viaa/avo2-components';
import React, { FC, ReactNode } from 'react';

interface EmptyStateMessageProps {
	imgSrc: string;
	imgAlt: string;
	title: string;
	message: ReactNode;
}

const EmptyStateMessage: FC<EmptyStateMessageProps> = ({ imgSrc, imgAlt, title, message }) => {
	return (
		<Container mode="vertical" className="c-empty-collection-placeholder">
			<Flex orientation="vertical" center>
				<img alt={imgAlt} src={imgSrc} />
				<Spacer margin={['top-large', 'bottom']}>
					<h2>{title}</h2>
				</Spacer>
				<p>{message}</p>
			</Flex>
		</Container>
	);
};

export default EmptyStateMessage;
