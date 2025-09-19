import './EmbedCodeDetail.scss';

import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Alert,
	Button,
	Container,
	Flex,
	FlexItem,
	HeaderBottomRowLeft,
	IconName,
	Navbar,
	Spinner,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { generatePath, useMatch, useNavigate } from 'react-router';

import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { ItemVideoDescription } from '../../item/components/ItemVideoDescription';
import { getValidStartAndEnd } from '../../shared/helpers/cut-start-and-end';
import { renderAvatar } from '../../shared/helpers/formatters';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { toSeconds } from '../../shared/helpers/parsers/duration';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { createResource } from '../helpers/resourceForTrackEvents';
import { useGetEmbedCode } from '../hooks/useGetEmbedCode';

export const EmbedCodeDetail: FC = () => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(APP_PATH.EMBED.route);
	const embedCodeId = match?.params.id;
	const commonUser = useAtomValue(commonUserAtom);

	const {
		data: embedCode,
		isLoading: isLoadingEmbedCode,
		isError: isErrorEmbedCode,
	} = useGetEmbedCode(embedCodeId as string, !!embedCodeId);

	const canReadOriginal = useMemo(() => {
		if (!embedCode || !commonUser) {
			return false;
		}

		if (embedCode.contentType === 'ITEM') {
			return PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_PUBLISHED_ITEMS);
		} else {
			return false;
		}
	}, [commonUser, embedCode]);

	const triggerViewEvents = useCallback(async () => {
		if (!embedCode?.content) {
			return null;
		}

		if (embedCode.contentType === 'ITEM') {
			trackEvents(
				{
					object: embedCode.id,
					object_type: 'embed_code',
					action: 'view',
					resource: {
						...createResource(embedCode, commonUser as Avo.User.CommonUser),
						parentPage: '', // No parent page since we are on the detail page in avo
					},
				},
				commonUser
			);

			// Also increase the view count for the item or collection
			await BookmarksViewsPlaysService.action(
				'view',
				'item',
				(embedCode.content as Avo.Item.Item).external_id,
				commonUser
			).then(noop);
		}
	}, [commonUser, embedCode]);

	useEffect(() => {
		if (embedCode) {
			triggerViewEvents().then(noop);
		}
	}, [embedCode, triggerViewEvents]);

	const onPlay = () => {
		if (embedCode) {
			trackEvents(
				{
					object: embedCode?.id,
					object_type: 'embed_code',
					action: 'play',
					resource: {
						...createResource(embedCode, commonUser as Avo.User.CommonUser),
						parentPage: '', // No parent page since we are on the detail page in avo
					},
				},
				commonUser
			);
		}
	};

	// Render methods
	const renderContent = () => {
		if (!embedCode?.content) {
			return null;
		}

		const content = embedCode.content as Avo.Item.Item;
		const contentLabel = embedCode.contentType;

		const [start, end] = getValidStartAndEnd(
			embedCode.start,
			embedCode.end,
			toSeconds(content.duration || 0)
		);

		switch (contentLabel) {
			case 'ITEM':
				return (
					<ItemVideoDescription
						itemMetaData={content}
						showMetadata={true}
						enableMetadataLink={false}
						showDescription={embedCode.descriptionType !== 'NONE'}
						description={embedCode.description}
						verticalLayout={isMobileWidth()}
						cuePointsLabel={{ start, end }}
						cuePointsVideo={{ start, end }}
						onPlay={onPlay}
						// Not tracking the playevent in the FlowPlayer since that is bound to the item and not an embed
						trackPlayEvent={false}
					/>
				);
			default:
				return (
					<ErrorView
						icon={IconName.alertTriangle}
						message={tHtml(
							'embed-code/views/embed-code-detail___onverwacht-inhoudstype',
							{
								type: contentLabel || undefined,
							}
						)}
					/>
				);
		}
	};

	const handleClickGoToContentButton = () => {
		if (!embedCode?.content) {
			return;
		}

		let path: string | undefined;

		if (embedCode?.contentType === 'ITEM') {
			path = generatePath(APP_PATH.ITEM_DETAIL.route, {
				id: (embedCode.content as Avo.Item.Item).external_id.toString(),
			});
		}

		if (path) {
			navigateFunc(path);
		}
	};

	const renderGoToContentButton = () => {
		if (!canReadOriginal) {
			return null;
		}

		return (
			<ToolbarItem>
				<Button
					type="primary"
					label={tText('embed-code/views/embed-code-detail___bekijk-als-leerkracht')}
					title={tText('embed-code/views/embed-code-detail___bekijk-als-leerkracht')}
					icon={IconName.eye}
					onClick={handleClickGoToContentButton}
				/>
			</ToolbarItem>
		);
	};

	const renderEmbedCodeDetail = () => {
		if (!embedCode) {
			return null;
		}
		const { title } = embedCode;
		const profile = embedCode.owner;

		return (
			<div
				className={clsx('c-embed-code-detail', {
					'c-embed-code-detail--mobile': isMobileWidth(),
				})}
			>
				<Navbar>
					<Container mode="vertical" size="small" background="alt">
						<Container mode="horizontal">
							<Flex>
								<FlexItem>
									<Toolbar
										justify
										wrap={isMobileWidth()}
										size="huge"
										className="c-toolbar--drop-columns-low-mq"
									>
										<ToolbarLeft>
											<ToolbarItem>
												<BlockHeading className="u-m-0" type="h2">
													{title}
												</BlockHeading>
											</ToolbarItem>
										</ToolbarLeft>
										<ToolbarRight>
											{!!profile && (
												<ToolbarItem>
													<HeaderBottomRowLeft>
														{renderAvatar(profile, { dark: true })}
													</HeaderBottomRowLeft>
												</ToolbarItem>
											)}
											{renderGoToContentButton()}
										</ToolbarRight>
									</Toolbar>
								</FlexItem>
							</Flex>
						</Container>
					</Container>
				</Navbar>

				{embedCode.contentIsReplaced && (
					<Container mode="horizontal">
						<Alert type="danger">
							{tHtml(
								'embed-code/views/embed-code-detail___dit-fragment-werd-uitzonderlijk-vervangen-door-het-archief-voor-onderwijs-het-zou-kunnen-dat-de-tijdscodes-of-de-beschrijving-niet-meer-goed-passen-meld-dit-aan-de-lesgever-die-het-fragment-aanmaakte'
							)}
						</Alert>
					</Container>
				)}
				<Container mode="vertical">
					<Container mode="horizontal">{renderContent()}</Container>
				</Container>
			</div>
		);
	};

	const renderPageContent = (): ReactNode | null => {
		if (isLoadingEmbedCode) {
			return (
				<Container mode="vertical">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Container>
			);
		}

		if (isErrorEmbedCode) {
			return (
				<ErrorView
					icon={IconName.alertTriangle}
					message={tHtml(
						'embed-code/views/embed-code-detail___het-laden-van-het-ingesloten-fragment-is-mislukt'
					)}
				/>
			);
		}

		return renderEmbedCodeDetail();
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						embedCode?.title ||
							tText(
								'embed-code/views/embed-code-detail___ingesloten-fragment-detail-pagina-titel-fallback'
							)
					)}
				</title>
				<meta name="description" content={embedCode?.description || ''} />
			</Helmet>
			{renderPageContent()}
		</>
	);
};
