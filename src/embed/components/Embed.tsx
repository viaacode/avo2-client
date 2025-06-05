// eslint-disable-next-line import/no-unresolved
import AvoLogo from '@assets/images/avo-logo-button.svg';
import { Alert, Column, Flex, Grid, Icon, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import type { ItemSchema } from '@viaa/avo2-types/types/item';
import queryString from 'query-string';
import React, { type FC, useEffect, useMemo, useState } from 'react';
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

import { EmbedErrorView } from './EmbedErrorView';

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

	const isReplaced = useMemo(() => !!embedCode?.content?.relations?.length, [embedCode]);

	const content = useMemo(() => {
		if (embedCode?.content?.relations?.length) {
			return embedCode?.content?.relations[0].object_meta;
		}
		return embedCode?.content;
	}, [embedCode]);

	const errorInfo = useMemo(() => {
		let errorMessage: React.ReactNode | string = '';
		let showReloadButton = false;
		let icon: IconName | null = null;

		if (isErrorEmbedCode) {
			errorMessage = tHtml(
				'embed/components/error-view___oeps-er-liep-iets-mis-probeer-het-opnieuw-br-lukt-het-nog-steeds-niet-dan-is-dit-fragment-mogelijks-verwijderd'
			);
			showReloadButton = true;
		} else if (embedCode && !content) {
			errorMessage = tHtml('embed/components/embed___deze-video-is-niet-meer-beschikbaar');
		} else if (content && content.is_deleted) {
			errorMessage = tHtml('Deze video werd verwijderd');
		} else if (content && !content.is_published) {
			if (content.depublish_reason) {
				errorMessage = tHtml('Deze video werd gedepubliceerd met volgende reden', {
					depublishReason: content.depublish_reason,
				});
			} else {
				errorMessage = tHtml('Deze video werd gedepubliceerd');
			}
			icon = IconName.cameraOff;
		}

		if (errorMessage) {
			return { errorMessage, showReloadButton, icon };
		}
		return null;
	}, [content, embedCode, isErrorEmbedCode]);

	const onPlay = () => {
		if (!embedCode) {
			return;
		}
		trackEvents(
			{
				object: embedCode?.id,
				object_type: 'embed_code',
				action: 'play',
			},
			commonUser
		);
	};

	const openOnAvo = () => {
		if (!embedCode) {
			return;
		}
		trackEvents(
			{
				object: embedCode?.id,
				object_type: 'embed_code',
				action: 'view',
			},
			commonUser
		);
		redirectToExternalPage(toEmbedCodeDetail(embedCode?.id), '_blank');
	};

	if (errorInfo) {
		return (
			<EmbedErrorView
				message={errorInfo.errorMessage}
				showReloadButton={errorInfo.showReloadButton}
				icon={errorInfo.icon}
			/>
		);
	}

	if (isLoadingEmbedCode || !embedCode) {
		return (
			<Flex center style={{ height: '100%' }}>
				<Spinner size="large" />
			</Flex>
		);
	}

	return (
		<>
			<div className="embed-wrapper">
				{isReplaced && (
					<Alert type="danger">
						{tHtml(
							'Dit fragment werd uitzonderlijk vervangen door Het Archief voor Onderwijs. Het zou kunnen dat de tijdscodes of de beschrijving niet meer goed passen. Meld dit aan de lesgever die het fragment aanmaakte.'
						)}
					</Alert>
				)}
				<FlowPlayerWrapper
					poster={getFlowPlayerPoster(undefined, content)}
					item={content}
					canPlay={true}
					placeholder={false}
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
										title={content?.organisation.name}
									>
										{content?.organisation.name}
									</span>
									<span className="u-text-bold">&bull;</span>
									<span>{tHtml('embed/components/embed___uitgezonden')}</span>
									<span
										className="u-text-bold"
										title={reorderDate(content?.issued, '/')}
									>
										{reorderDate(
											(embedCode.content as ItemSchema)?.issued,
											'/'
										)}
									</span>
								</p>
								<p className="c-meta-data">
									<span>{tHtml('embed/components/embed___reeks')}</span>
									<span
										className="u-text-bold u-truncate"
										title={content?.series}
									>
										{content?.series}
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
					<img src={content?.organisation?.logo_url} />
				</div>
			</div>
		</>
	);
};

export default compose(withRouter, withUser)(Embed) as FC;
