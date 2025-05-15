import AvoLogo from '@assets/images/avo-logo-button.svg';
import { Column, Flex, Grid, Icon, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import type { ItemSchema } from '@viaa/avo2-types/types/item';
import queryString from 'query-string';
import React, { type FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import { redirectToExternalPage } from '../../authentication/helpers/redirects';
import { type EmbedCode } from '../../embed-code/embed-code.types';
import { toEmbedCodeDetail } from '../../embed-code/helpers/links';
import { ItemVideoDescription } from '../../item/components';
import { tHtml } from '../../shared/helpers/translate-html';
import { EmbedCodeService } from '../services/embed-code-service';

import ErrorView from './ErrorView';

import './Embed.scss';
import { reorderDate } from '../../shared/helpers';

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
		<div className={'embed-wrapper u-spacer-s'}>
			<ItemVideoDescription
				itemMetaData={embedCode.content as ItemSchema}
				showMetadata={false}
				enableMetadataLink={false}
				showTitle={false}
				showDescription={false}
				canPlay={true}
				cuePointsLabel={{ start: embedCode.start, end: embedCode.end }}
				cuePointsVideo={{ start: embedCode.start, end: embedCode.end }}
				trackPlayEvent={false}
			/>

			<p className="c-title u-spacer-top-s u-truncate" title={embedCode.title}>
				{embedCode.title}
			</p>

			<Grid noWrap>
				<Column size="flex">
					<p className="c-meta-data">
						<span>{tHtml('Aanbieder:')}</span>
						<span
							className="u-text-bold u-truncate"
							title={(embedCode.content as ItemSchema)?.organisation.name}
						>
							{(embedCode.content as ItemSchema)?.organisation.name}
						</span>
						<span className="u-text-bold">&bull;</span>
						<span>{tHtml('Uitgezonden:')}</span>
						<span
							className="u-text-bold"
							title={reorderDate((embedCode.content as ItemSchema)?.issued, '/')}
						>
							{reorderDate((embedCode.content as ItemSchema)?.issued, '/')}
						</span>
					</p>
					<p className="c-meta-data">
						<span>{tHtml('Reeks:')}</span>
						<span
							className="u-text-bold u-truncate"
							title={(embedCode.content as ItemSchema)?.series}
						>
							{(embedCode.content as ItemSchema)?.series}
						</span>
					</p>
				</Column>
				<Column size="static">
					<div
						className="c-avo-button"
						onClick={() => redirectToExternalPage(toEmbedCodeDetail(embedId), '_blank')}
					>
						<img
							className="c-avo-logo"
							alt="Archief voor Onderwijs logo"
							src={AvoLogo}
						/>
						<Icon name={IconName.externalLink} subtle />
					</div>
				</Column>
			</Grid>

			<div className="c-custom-logo-overlay u-spacer">
				<img src={(embedCode.content as ItemSchema)?.organisation?.logo_url} />
			</div>
		</div>
	);
};

export default withRouter(Embed);
