import { Container, Flex, Spacer } from '@viaa/avo2-components';
import React, { FC, ReactNode } from 'react';

import { ReactComponent as TeacherSvg } from '../../../assets/images/leerkracht.svg';

import './EmptyStateMessage.scss';

interface EmptyStateMessageProps {
	img?: ReactNode;
	title: string;
	message: ReactNode;
}

const EmptyStateMessage: FC<EmptyStateMessageProps> = ({
	img = <TeacherSvg />,
	title,
	message,
}) => {
	return (
		<Container mode="vertical" className="c-empty-collection-placeholder">
			<Flex orientation="vertical" center>
				{img}
				<Spacer margin={['top-large', 'bottom']}>
					<h2>{title}</h2>
				</Spacer>
				<p>{message}</p>
			</Flex>
		</Container>
	);
};

export default EmptyStateMessage;
