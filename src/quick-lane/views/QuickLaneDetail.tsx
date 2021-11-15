import classnames from 'classnames';
import { get } from 'lodash-es';
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Avatar,
	BlockHeading,
	Container,
	Flex,
	FlexItem,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { ItemSchema } from '@viaa/avo2-types/types/item';

import { AssignmentLayout } from '../../assignment/assignment.types';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { FragmentList } from '../../collection/components';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ItemVideoDescription } from '../../item/components';
import { InteractiveTour, LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { CustomError, isMobileWidth } from '../../shared/helpers';
import { trackEvents } from '../../shared/services/event-logging-service';
import { QuickLaneService, QuickLaneUrlObject } from '../quick-lane.service';

import './QuickLaneDetail.scss';

interface QuickLaneDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const QuickLaneDetail: FunctionComponent<QuickLaneDetailProps> = ({
	history,
	location,
	match,
	user,
	...rest
}) => {
	// State
	const [quickLane, setQuickLane] = useState<QuickLaneUrlObject>();
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [t] = useTranslation();

	// Retrieve data from GraphQL
	const fetchQuickLaneAndContent = useCallback(async () => {
		try {
			const quickLaneId = match.params.id;

			const response = await QuickLaneService.fetchQuickLaneById(quickLaneId);

			trackEvents(
				{
					object: String(response.id),
					object_type: 'quick_lane',
					message: `Gebruiker ${getProfileName(
						user
					)} heeft een quick lane pagina bekeken`,
					action: 'view',
				},
				user
			);

			if (response.content_label === 'ITEM') {
				if ((response.content as ItemSchema).depublish_reason) {
					setLoadingInfo({
						state: 'error',
						message:
							t(
								'item/views/item-detail___dit-item-werdt-gedepubliceerd-met-volgende-reden'
							) + (response.content as ItemSchema).depublish_reason,
						icon: 'camera-off',
					});

					return;
				}
			}

			setQuickLane(response);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch quick lane and content for detail page', err, {
					user,
					id: match.params.id,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-detail___het-laden-van-de-opdracht-is-mislukt'
				),
			});
		}
	}, [setQuickLane, setLoadingInfo, match.params.id, t, user, history]);

	useEffect(() => {
		if (PermissionService.hasPerm(user, PermissionName.VIEW_ASSIGNMENTS)) {
			fetchQuickLaneAndContent();
		} else {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-detail___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
				),
				icon: 'lock',
			});
		}
	}, [fetchQuickLaneAndContent, user, t]);

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
						message={t(
							'assignment/views/assignment-detail___onverwacht-opdracht-inhoud-type-0',
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
													<Avatar
														dark={true}
														image={profile.avatar || undefined}
														name={
															profile.usersByuserId.full_name ||
															undefined
														}
													/>
												</ToolbarItem>
											)}
											<ToolbarItem>
												<InteractiveTour showButton />
											</ToolbarItem>
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
							t(
								'assignment/views/assignment-detail___opdracht-detail-pagina-titel-fallback'
							)
						)
					)}
				</title>
				<meta name="description" content={get(quickLane, 'description') || ''} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				notFoundError={t(
					'assignment/views/assignment-detail___de-opdracht-werdt-niet-gevonden'
				)}
				dataObject={quickLane}
				render={renderQuickLaneDetail}
			/>
		</>
	);
};

export default QuickLaneDetail;
