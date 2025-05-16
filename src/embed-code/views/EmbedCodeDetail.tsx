import './EmbedCodeDetail.scss';

import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Button,
	Container,
	Flex,
	FlexItem,
	IconName,
	Navbar,
	Spinner,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { HeaderBottomRowLeft } from '@viaa/avo2-components/src/components/Header/Header.slots';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { generatePath } from 'react-router';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ItemVideoDescription } from '../../item/components';
import { getValidStartAndEnd } from '../../shared/helpers/cut-start-and-end';
import { renderAvatar } from '../../shared/helpers/formatters';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { toSeconds } from '../../shared/helpers/parsers/duration';
import withUser from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service';
import { useGetEmbedCode } from '../hooks/useGetEmbedCode';

type EmbedCodeDetailProps = DefaultSecureRouteProps<{ id: string }>;

const EmbedCodeDetail: FC<EmbedCodeDetailProps> = ({ history, match, commonUser }) => {
	const { tText, tHtml } = useTranslation();
	const embedCodeId = match.params.id;

	const {
		data: embedCode,
		isLoading: isLoadingEmbedCode,
		isError: isErrorEmbedCode,
	} = useGetEmbedCode(embedCodeId);

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
		if (!embedCode) {
			return null;
		}

		// Also increase the view count for the item or collection
		if (embedCode.contentType === 'ITEM' && embedCode.contentId) {
			await BookmarksViewsPlaysService.action(
				'view',
				'item',
				embedCode.contentId,
				commonUser
			).then(noop);
		}
	}, [commonUser, embedCode]);

	useEffect(() => {
		if (embedCode) {
			triggerViewEvents().then(noop);
		}
	}, [embedCode, triggerViewEvents]);

	// Render methods
	const renderContent = () => {
		if (!embedCode || !embedCode.content) {
			return null;
		}

		const contentLabel = embedCode.contentType;

		const [start, end] = getValidStartAndEnd(
			embedCode.start,
			embedCode.end,
			toSeconds((embedCode.content as Avo.Item.Item)?.duration || 0)
		);

		switch (contentLabel) {
			case 'ITEM':
				return (
					<ItemVideoDescription
						itemMetaData={embedCode.content as Avo.Item.Item}
						showMetadata={true}
						enableMetadataLink={false}
						showDescription={embedCode.descriptionType !== 'NONE'}
						description={embedCode.description}
						verticalLayout={isMobileWidth()}
						cuePointsLabel={{ start, end }}
						cuePointsVideo={{ start, end }}
						trackPlayEvent={true}
					/>
				);
			default:
				return (
					<ErrorView
						icon={IconName.alertTriangle}
						message={tHtml('Onverwacht inhoudstype', {
							type: contentLabel || undefined,
						})}
					/>
				);
		}
	};

	const handleClickGoToContentButton = () => {
		if (!embedCode?.contentId) {
			return;
		}

		let path: string | undefined;

		if (embedCode?.contentType === 'ITEM') {
			path = generatePath(APP_PATH.ITEM_DETAIL.route, {
				id: (embedCode.content as Avo.Item.Item).external_id.toString(),
			});
		}

		if (path) {
			history.push(path);
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
					label={tText('Bekijk als leerkracht')}
					title={tText('Bekijk als leerkracht')}
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
					message={tHtml('Het laden van het ingesloten fragment is mislukt')}
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
							tText('Ingesloten fragment detail pagina titel fallback')
					)}
				</title>
				<meta name="description" content={embedCode?.description || ''} />
			</Helmet>
			{renderPageContent()}
		</>
	);
};

export default withUser(EmbedCodeDetail) as FC<EmbedCodeDetailProps>;
