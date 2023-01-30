import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	Container,
	Flex,
	FlexItem,
	HeaderAvatar,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { get } from 'lodash-es';
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { generatePath } from 'react-router';

import { AssignmentLayout } from '../../assignment/assignment.types';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { FragmentList } from '../../collection/components';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ItemVideoDescription } from '../../item/components';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { CustomError, isMobileWidth, renderAvatar } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { QuickLaneUrlObject } from '../../shared/types';
import { isCollection, isItem } from '../quick-lane.helpers';
import { QuickLaneService } from '../quick-lane.service';

import './QuickLaneDetail.scss';

type QuickLaneDetailProps = DefaultSecureRouteProps<{ id: string }>;

const QuickLaneDetail: FunctionComponent<QuickLaneDetailProps> = ({
	history,
	location,
	match,
	user,
	...rest
}) => {
	const { tText } = useTranslation();

	// State
	const [quickLane, setQuickLane] = useState<QuickLaneUrlObject>();
	const [canReadOriginal, setCanReadOriginal] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// Retrieve data from GraphQL
	const fetchQuickLaneAndContent = useCallback(async () => {
		try {
			const quickLaneId = match.params.id;

			const response = await QuickLaneService.fetchQuickLaneById(quickLaneId);

			// Handle edge cases

			if (isCollection(response)) {
				const content = response.content as Avo.Collection.Collection | undefined;

				if (!content || !content.is_public) {
					setLoadingInfo({
						state: 'error',
						message: tText(
							'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden'
						),
						icon: 'search',
					});

					return;
				}
			} else {
				// We assume the response isItem but don't check so we can handle the absence of VIEW_ANY_UNPUBLISHED_ITEMS
				const content = response.content as Avo.Item.Item;

				// Check for a depublishing reason first
				if (content.depublish_reason) {
					setLoadingInfo({
						state: 'error',
						message:
							tText(
								'item/views/item-detail___dit-item-werdt-gedepubliceerd-met-volgende-reden'
							) + (response.content as Avo.Item.Item).depublish_reason,
						icon: 'camera-off',
					});

					return;
				}

				// If there's no reason, check if it's published
				// Note: this is not handled in GQL because the response is a quick_lane object enriched in the QuickLaneService using the ItemService's fetch
				if (!content.is_published) {
					setLoadingInfo({
						state: 'error',
						message: tText('item/views/item___dit-item-werd-niet-gevonden'),
						icon: 'search',
					});

					return;
				}
			}

			// Fetch permissions

			let permissionName: PermissionName | undefined = undefined;

			if (isItem(response)) {
				permissionName = PermissionName.VIEW_ANY_PUBLISHED_ITEMS;
			} else if (isCollection(response)) {
				permissionName = PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS;
			}

			if (permissionName !== undefined) {
				setCanReadOriginal(await PermissionService.hasPerm(user, permissionName));
			}

			// Update state

			setQuickLane(response);

			// Analytics

			// TODO re-enable this once task https://meemoo.atlassian.net/browse/AVO-2177 is fixed
			// trackEvents(
			// 	{
			// 		object: String(response.id),
			// 		object_type: 'quick_lane',
			// 		action: 'view',
			// 	},
			// 	user
			// );
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch quick lane and content for detail page', err, {
					user,
					id: match.params.id,
				})
			);

			setLoadingInfo({
				state: 'error',
				message: tText(
					'quick-lane/views/quick-lane-detail___het-laden-van-de-gedeelde-link-is-mislukt'
				),
			});
		}
	}, [setQuickLane, setLoadingInfo, match.params.id, tText, user]);

	useEffect(() => {
		if (PermissionService.hasPerm(user, PermissionName.VIEW_QUICK_LANE_DETAIL)) {
			fetchQuickLaneAndContent();
		} else {
			setLoadingInfo({
				state: 'error',
				message: tText(
					'quick-lane/views/quick-lane-detail___je-hebt-geen-rechten-om-deze-gedeelde-link-te-bekijken'
				),
				icon: 'lock',
			});
		}
	}, [fetchQuickLaneAndContent, user, tText]);

	useEffect(() => {
		if (quickLane) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [quickLane]);

	// Render methods
	const renderContent = () => {
		if (!quickLane || !quickLane.content) {
			return null;
		}

		const contentLabel = quickLane.content_label;
		const contentLayout = quickLane.view_mode;

		switch (contentLabel) {
			case 'COLLECTIE':
				return (
					<FragmentList
						collectionFragments={
							(quickLane.content as Avo.Collection.Collection).collection_fragments
						}
						showDescription={contentLayout === AssignmentLayout.PlayerAndText}
						linkToItems={false}
						history={history}
						location={location}
						match={match}
						user={user}
						collection={quickLane.content as Avo.Collection.Collection}
						{...rest}
					/>
				);
			case 'ITEM':
				return (
					<ItemVideoDescription
						itemMetaData={quickLane.content as Avo.Item.Item}
						showDescription={contentLayout === AssignmentLayout.PlayerAndText}
						verticalLayout={isMobileWidth()}
					/>
				);
			default:
				return (
					<ErrorView
						icon="alert-triangle"
						message={tText(
							'quick-lane/views/quick-lane-detail___onverwacht-inhoudstype',
							{
								type: contentLabel || undefined,
							}
						)}
					/>
				);
		}
	};

	const renderQuickLaneDetail = (): ReactElement | null => {
		if (!quickLane) {
			return null;
		}

		const { title } = quickLane;
		const profile = quickLane.owner;

		return (
			<div
				className={classnames('c-quick-lane-detail', {
					'c-quick-lane-detail--mobile': isMobileWidth(),
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
													<HeaderAvatar>
														{renderAvatar(profile, { dark: true })}
													</HeaderAvatar>
												</ToolbarItem>
											)}
											{canReadOriginal && (
												<ToolbarItem>
													<Button
														type="primary"
														label={tText(
															'quick-lane/views/quick-lane-detail___bekijk-als-leerkracht'
														)}
														title={tText(
															'quick-lane/views/quick-lane-detail___bekijk-als-leerkracht'
														)}
														icon="eye"
														onClick={() => {
															if (!quickLane.content_id) {
																return;
															}

															let path: string | undefined;

															if (isItem(quickLane)) {
																path = generatePath(
																	APP_PATH.ITEM_DETAIL.route,
																	{
																		id: (
																			quickLane.content as Avo.Item.Item
																		).external_id.toString(),
																	}
																);
															} else if (isCollection(quickLane)) {
																path = generatePath(
																	APP_PATH.COLLECTION_DETAIL
																		.route,
																	{
																		id: quickLane.content_id,
																	}
																);
															}

															if (path) {
																history.push(path);
															}
														}}
													/>
												</ToolbarItem>
											)}
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

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(
							quickLane,
							'title',
							tText(
								'quick-lane/views/quick-lane-detail___gedeelde-link-detail-pagina-titel-fallback'
							)
						)
					)}
				</title>
				<meta name="description" content={get(quickLane, 'description') || ''} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				notFoundError={tText(
					'quick-lane/views/quick-lane-detail___de-gedeelde-link-werd-niet-gevonden'
				)}
				dataObject={quickLane}
				render={renderQuickLaneDetail}
			/>
		</>
	);
};

export default QuickLaneDetail;
