import classnames from 'classnames';
import { get, isString } from 'lodash-es';
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	BlockIntro,
	Box,
	Checkbox,
	Container,
	Flex,
	FlexItem,
	Icon,
	IconName,
	Navbar,
	Spacer,
	TagList,
	TagOption,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ItemVideoDescription } from '../../item/components';
import { InteractiveTour, LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import Html from '../../shared/components/Html/Html';
import { buildLink, CustomError, isMobileWidth, renderAvatar } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { AssignmentRetrieveError } from '../assignment.types';

import './AssignmentDetail.scss';

interface AssignmentProps extends DefaultSecureRouteProps<{ id: string }> {}

const AssignmentDetail: FunctionComponent<AssignmentProps> = ({
	history,
	location,
	match,
	user,
	...rest
}) => {
	// State
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment_v2>();
	const [assignmentBlocks, setAssignmentBlocks] = useState<Avo.Assignment.Block[]>([]);
	const [permissions, setPermissions] = useState<
		Partial<{
			canCreateAssignmentResponse: boolean;
			canEditAssignment: boolean;
		}>
	>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [t] = useTranslation();

	// Retrieve data from GraphQL
	const fetchAssignmentAndContent = useCallback(async () => {
		try {
			const assignmentId = match.params.id;

			const response = await AssignmentService.fetchAssignmentAndContent(
				getProfileId(user),
				assignmentId
			);

			if (isString(response)) {
				// error
				let errorObj: { message: string; icon: IconName };
				switch (response as AssignmentRetrieveError) {
					case AssignmentRetrieveError.DELETED:
						errorObj = {
							message: t(
								'assignment/views/assignment-detail___de-opdracht-werd-verwijderd'
							),
							icon: 'delete',
						};
						break;

					case AssignmentRetrieveError.NOT_YET_AVAILABLE:
						errorObj = {
							message: t(
								'assignment/views/assignment-detail___de-opdracht-is-nog-niet-beschikbaar'
							),
							icon: 'clock',
						};
						break;

					case AssignmentRetrieveError.PAST_DEADLINE:
						errorObj = {
							message: t(
								'assignment/views/assignment-detail___de-deadline-voor-deze-opdracht-is-reeds-verlopen'
							),
							icon: 'clock',
						};
						break;

					default:
						errorObj = {
							message: t(
								'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
							),
							icon: 'alert-triangle',
						};
						break;
				}
				setLoadingInfo({
					state: 'error',
					...errorObj,
				});
				return;
			}

			const [canEditAssignment, canCreateAssignmentResponse] = await Promise.all([
				PermissionService.hasPermissions(
					[
						PermissionName.EDIT_ANY_ASSIGNMENTS,
						{ name: PermissionName.EDIT_ASSIGNMENTS, obj: response.assignment },
						{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: response.assignment },
					],
					user
				),
				PermissionService.hasPerm(user, PermissionName.CREATE_ASSIGNMENT_RESPONSE),
			]);

			if (canCreateAssignmentResponse) {
				// Create an assignmentResponse object to track the student viewing and finishing the assignment
				// Currently we wait for this to complete
				// so we can set the created assignment response on the tempAssignment object,
				// so we don't need to do a refetch of the original assignment
				const assignmentResponse = await AssignmentService.createAssignmentResponseObject(
					response.assignment,
					user
				);

				if (assignmentResponse) {
					response.assignment.responses = [assignmentResponse];
				}
			}

			trackEvents(
				{
					object: String(response.assignment.id),
					object_type: 'assignment',
					action: 'view',
				},
				user
			);

			setPermissions({ canEditAssignment, canCreateAssignmentResponse });
			setAssignment(response.assignment);
			setAssignmentBlocks(response.assignmentBlocks);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch assignment and content for detail page', err, {
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
	}, [setAssignment, setAssignmentBlocks, setLoadingInfo, match.params.id, t, user]);

	useEffect(() => {
		if (PermissionService.hasPerm(user, PermissionName.VIEW_ASSIGNMENTS)) {
			fetchAssignmentAndContent();
		} else {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-detail___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
				),
				icon: 'lock',
			});
		}
	}, [fetchAssignmentAndContent, user, t]);

	useEffect(() => {
		if (assignment) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignment]);

	const handleSubmittedAtChanged = async (checked: boolean) => {
		try {
			const assignmentResponse = get(assignment, 'responses[0]');
			if (!assignmentResponse) {
				console.error(
					new CustomError(
						'Trying to submit an assignment response while passing null',
						null,
						{ assignmentResponse }
					)
				);
				ToastService.danger(
					t(
						'assignment/views/assignment-detail___deze-opdracht-kon-niet-geupdate-worden-probeer-de-pagina-te-herladen'
					)
				);
				return;
			}
			await AssignmentService.toggleAssignmentResponseSubmitStatus(
				assignmentResponse.id,
				checked ? new Date().toISOString() : null
			);
			fetchAssignmentAndContent();
			ToastService.success(
				checked
					? t(
							'assignment/views/assignment-detail___de-opdracht-is-gemarkeerd-als-gemaakt'
					  )
					: t(
							'assignment/views/assignment-detail___de-opdracht-is-gemarkeerd-als-nog-niet-gemaakt'
					  )
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle assignment response submit status', err, {
					assignment,
				})
			);
			ToastService.danger(
				t(
					'assignment/views/assignment-detail___deze-opdracht-kon-niet-geupdate-worden-probeer-de-pagina-te-herladen'
				)
			);
		}
	};

	// Render methods
	const renderBlock = (block: Avo.Assignment.Block) => {
		switch (block.type) {
			case 'ITEM':
				return (
					<li className="c-collection-list__item" key={`assignment-block-${block.id}`}>
						<ItemVideoDescription
							itemMetaData={block.item as Avo.Item.Item}
							showTitle={true}
							showDescription={true}
							title={AssignmentHelper.getDisplayTitle(block)}
							description={AssignmentHelper.getDisplayDescription(block)}
							cuePoints={AssignmentHelper.getCuePoints(block)}
							verticalLayout={isMobileWidth()}
							poster={AssignmentHelper.getThumbnail(block)}
							{...rest}
						/>
					</li>
				);
			case 'TEXT':
				return (
					<li className="c-collection-list__item" key={`assignment-block-${block.id}`}>
						<BlockIntro
							content={block.custom_description || ''}
							title={block.custom_title || ''}
							headingType="h3"
							align="center"
							className="c-fragment-detail__intro-block"
							{...rest}
						/>
					</li>
				);
			default:
				return (
					<ErrorView
						icon="alert-triangle"
						message={t(
							'assignment/views/assignment-detail___onverwacht-opdracht-inhoud-type-0',
							{
								type: block.type || undefined,
							}
						)}
					/>
				);
		}
	};

	const renderContent = () => {
		return (
			<ul className="c-collection-list">
				{assignmentBlocks.map((block: Avo.Assignment.Block) => renderBlock(block))}
			</ul>
		);
	};

	/**
	 * Should render a back link to the edit page if the current user has edit rights on the assignment
	 * Should render back link to assignments overview if the current user does not have edit rights
	 */
	const renderBackLink = () => {
		if (!assignment) {
			return null;
		}

		const isOwner = getProfileId(user) === assignment.owner_profile_id;
		const backLink = isOwner
			? buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignment.id })
			: buildLink(APP_PATH.WORKSPACE_TAB.route, { tabId: ASSIGNMENTS_ID });

		return isOwner ? (
			<Link className="c-return" to={backLink}>
				<Icon type="arrows" name="chevron-left" />
				<span>
					<Trans i18nKey="assignment/views/assignment-detail___terug-naar-opdracht-bewerken">
						Terug naar opdracht bewerken
					</Trans>
				</span>
			</Link>
		) : null;
	};

	const renderAssignment = (): ReactElement | null => {
		if (!assignment) {
			return null;
		}

		const { answer_url, description, profile, title } = assignment;

		const tags: TagOption[] = AssignmentHelper.getLabels(assignment, 'LABEL').map(
			({ assignment_label: { id, label, color_override, enum_color } }: any) => ({
				id,
				label: label || '',
				color: color_override || get(enum_color, 'label'),
			})
		);

		return (
			<div
				className={classnames('c-assignment-detail', {
					'c-assignment-detail--mobile': isMobileWidth(),
				})}
			>
				<Navbar>
					<Container mode="vertical" size="small" background="alt">
						<Container mode="horizontal">
							{renderBackLink()}
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
											{permissions.canCreateAssignmentResponse && (
												<ToolbarItem>
													<Checkbox
														label={t(
															'assignment/views/assignment-detail___opdracht-gemaakt'
														)}
														checked={
															!!get(
																assignment,
																'responses[0].submitted_at'
															)
														}
														onChange={handleSubmittedAtChanged}
													/>
												</ToolbarItem>
											)}
											<ToolbarItem>
												<TagList
													tags={tags}
													closable={false}
													swatches
													bordered
												/>
											</ToolbarItem>
											{!!profile && (
												<ToolbarItem>
													{renderAvatar(profile, {
														small: true,
														dark: true,
													})}
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
						<Spacer margin="top">
							<Container mode="horizontal">
								<Html
									content={description}
									type="div"
									sanitizePreset="full"
									className="c-content"
								/>
								{!!answer_url && (
									<Box backgroundColor="soft-white" condensed>
										<p>
											<Trans i18nKey="assignment/views/assignment-detail___geef-je-antwoorden-in-op">
												Geef je antwoorden in op:
											</Trans>
										</p>
										<p>
											<a href={answer_url}>{answer_url}</a>
										</p>
									</Box>
								)}
							</Container>
						</Spacer>
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
							assignment,
							'title',
							t(
								'assignment/views/assignment-detail___opdracht-detail-pagina-titel-fallback'
							)
						)
					)}
				</title>
				<meta name="description" content={get(assignment, 'description') || ''} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				notFoundError={t(
					'assignment/views/assignment-detail___de-opdracht-werdt-niet-gevonden'
				)}
				dataObject={assignment}
				render={renderAssignment}
			/>
		</>
	);
};

export default AssignmentDetail;
