// eslint-disable-next-line import/no-unresolved
import AvoLogo from '@assets/images/avo-logo-button.svg';
import { Column, Flex, Grid, Icon, IconName, Spinner } from '@viaa/avo2-components';
import type { ItemSchema } from '@viaa/avo2-types/types/item';
import queryString from 'query-string';
import React, { type FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { redirectToExternalPage } from '../../authentication/helpers/redirects/redirect-to-external-page';
import { toEmbedCodeDetail } from '../../embed-code/helpers/links';
import { useGetEmbedCode } from '../../embed-code/hooks/useGetEmbedCode';
import FlowPlayerWrapper from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { reorderDate } from '../../shared/helpers/formatters';
import { getFlowPlayerPoster } from '../../shared/helpers/get-poster';
import { isUuid } from '../../shared/helpers/isUuid';
import { tHtml } from '../../shared/helpers/translate-html';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import { trackEvents } from '../../shared/services/event-logging-service';

import ErrorView from './ErrorView';

import './Embed.scss';

const Embed: FC<UserProps> = ({ commonUser }) => {
	const urlInfo = queryString.parseUrl(window.location.href);
	const [embedId, setEmbedId] = useState<string | null>(null);
	const showMetadata = (urlInfo.query['showMetadata'] as string) === 'true';

	const {
		data: embedCode,
		isLoading: isLoadingEmbedCode,
		isError: isErrorEmbedCode,
	} = useGetEmbedCode(embedId, true);

	useEffect(() => {
		const embedId = urlInfo.query['embedId'] || urlInfo.url.split('/').pop();
		if (embedId && typeof embedId === 'string' && isUuid(embedId)) {
			setEmbedId(embedId as string);
		}
	}, [urlInfo]);

	if (isLoadingEmbedCode) {
		return (
			<Flex center style={{ height: '100%' }}>
				<Spinner size="large" />
			</Flex>
		);
	}

	if (isErrorEmbedCode || !embedCode || !embedCode.content) {
		return <ErrorView isNotFoundError={embedCode && !embedCode.content} />;
	}

	const onPlay = () => {
		trackEvents(
			{
				object: embedCode.id,
				object_type: 'embed_code',
				action: 'play',
			},
			commonUser
		);
	};

	const openOnAvo = () => {
		trackEvents(
			{
				object: embedCode.id,
				object_type: 'embed_code',
				action: 'view',
			},
			commonUser
		);
		redirectToExternalPage(toEmbedCodeDetail(embedCode.id), '_blank');
	};

	return (
		<div className="embed-wrapper">
			<FlowPlayerWrapper
				poster={getFlowPlayerPoster(undefined, embedCode.content as ItemSchema)}
				item={embedCode.content as ItemSchema}
				canPlay={true}
				cuePointsLabel={{ start: embedCode.start, end: embedCode.end }}
				cuePointsVideo={{ start: embedCode.start, end: embedCode.end }}
				onPlay={onPlay}
				// Not tracking the playevent in the FlowPlayer since that is bound to the item and not an embed
				trackPlayEvent={false}
			/>

			{showMetadata && (
				<div className="c-embed-metadata">
					<p className="c-title u-spacer-top-s u-truncate" title={embedCode.title}>
						{embedCode.title}
					</p>

					<Grid noWrap>
						<Column size="flex">
							<p className="c-meta-data">
								<span>{tHtml('embed/components/embed___aanbieder')}</span>
								<span
									className="u-text-bold u-truncate"
									title={(embedCode.content as ItemSchema)?.organisation.name}
								>
									{(embedCode.content as ItemSchema)?.organisation.name}
								</span>
								<span className="u-text-bold">&bull;</span>
								<span>{tHtml('embed/components/embed___uitgezonden')}</span>
								<span
									className="u-text-bold"
									title={reorderDate(
										(embedCode.content as ItemSchema)?.issued,
										'/'
									)}
								>
									{reorderDate((embedCode.content as ItemSchema)?.issued, '/')}
								</span>
							</p>
							<p className="c-meta-data">
								<span>{tHtml('embed/components/embed___reeks')}</span>
								<span
									className="u-text-bold u-truncate"
									title={(embedCode.content as ItemSchema)?.series}
								>
									{(embedCode.content as ItemSchema)?.series}
								</span>
							</p>
						</Column>
						<Column size="static">
							<div className="c-avo-button" onClick={openOnAvo}>
								<img
									className="c-avo-logo"
									alt="Archief voor Onderwijs logo"
									src={AvoLogo}
								/>
								<Icon name={IconName.externalLink} subtle />
							</div>
						</Column>
					</Grid>
				</div>
			)}

			<div className="c-custom-logo-overlay u-spacer">
				<img src={(embedCode.content as ItemSchema)?.organisation?.logo_url} />
			</div>
		</div>
	);
};

export default compose(withRouter, withUser)(Embed) as FC;
