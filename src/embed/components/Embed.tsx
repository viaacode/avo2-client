import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import queryString from 'query-string';
import React, { type FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import { type EmbedCode } from '../../embed-code/embed-code.types';
import { EmbedCodeService } from '../services/embed-code-service';

import ErrorView from './ErrorView';

const Embed: FC = () => {
	const params = queryString.parse(window.location.search);
	const embedId = (params['embed-id'] as string) || '';

	const [isLoadingEmbedCode, setIsLoadingEmbedCode] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);
	const [embedCode, setEmbedCode] = useState<EmbedCode | null>(null);

	useEffect(() => {
		const loadEmbedCode = async () => {
			setIsLoadingEmbedCode(true);
			setIsError(false);

			try {
				const result = await EmbedCodeService.getEmbedCode(embedId);
				setEmbedCode(result);
			} catch (err) {
				setIsError(true);
			}

			setIsLoadingEmbedCode(false);
		};

		loadEmbedCode();
	}, [embedId]);

	if (isLoadingEmbedCode) {
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<Flex center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	if (!embedCode || isError) {
		return <ErrorView />;
	}

	return (
		<Spacer margin={['top-large', 'bottom-large']}>
			<Flex center>{embedCode.title}</Flex>
		</Spacer>
	);
};

export default withRouter(Embed);
