import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { cloneDeep, eq, get, isNil, omit, set } from 'lodash-es';
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	Box,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	IconName,
	MenuContent,
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
import { getProfileId } from '../../authentication/helpers/get-profile-info';
import { PermissionNames } from '../../authentication/helpers/permission-service';
import { FragmentList } from '../../collection/components';
import { ErrorView } from '../../error/views';
import { ItemVideoDescription } from '../../item/components';
import { LoadingErrorLoadedComponent } from '../../shared/components';
import {
	checkPermissions,
	LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink, renderAvatar } from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services/data-service';
import toastService from '../../shared/services/toast-service';
import { ASSIGNMENTS_ID, WORKSPACE_PATH } from '../../workspace/workspace.const';

import { ASSIGNMENT_PATH } from '../assignment.const';
import {
	GET_ASSIGNMENT_WITH_RESPONSE,
	INSERT_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT_RESPONSE,
} from '../assignment.gql';
import { getAssignmentContent } from '../assignment.helpers';
import { AssignmentLayout, AssignmentRetrieveError } from '../assignment.types';

import './AssignmentDetail.scss';

interface AssignmentProps extends DefaultSecureRouteProps<{ id: string }> {}

const AssignmentDetail: FunctionComponent<AssignmentProps> = ({ match, user, ...rest }) => {
	// State
	const [isActionsDropdownOpen, setActionsDropdownOpen] = useState<boolean>(false);
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment>();
	const [assignmentContent, setAssigmentContent] = useState<
		Avo.Assignment.Content | null | undefined
	>();
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// Mutations
	const [triggerInsertAssignmentResponse] = useMutation(INSERT_ASSIGNMENT_RESPONSE);
	const [triggerUpdateAssignmentResponse] = useMutation(UPDATE_ASSIGNMENT_RESPONSE);

	const [t] = useTranslation();

	const isOwnerOfAssignment = useCallback(
		(tempAssignment: Avo.Assignment.Assignment) => {
			return getProfileId(user) === tempAssignment.owner_profile_id;
		},
		[user]
	);

	useEffect(() => {
		/**
		 * If the creation of the assignment response fails, we'll still continue with getting the assignment content
		 * @param tempAssignment assignment is passed since the tempAssignment has not been set into the state yet,
		 * since we might need to get the assignment content as well and
		 * this looks cleaner if everything loads at once instead of staggered
		 */
		const createAssignmentResponseObject = async (tempAssignment: Avo.Assignment.Assignment) => {
			if (!isOwnerOfAssignment(tempAssignment)) {
				let assignmentResponse: Partial<Avo.Assignment.Response> | null | undefined = get(
					tempAssignment,
					'assignment_responses[0]'
				);

				if (!assignmentResponse) {
					// Student has never viewed this assignment before, we should create a response object for him
					assignmentResponse = {
						owner_profile_ids: [getProfileId(user)],
						assignment_id: tempAssignment.id,
						collection: null,
						collection_uuid: null,
						submitted_at: null,
					} as any; // TODO Remove cast once update to typings 2.8

					try {
						const reply = await triggerInsertAssignmentResponse({
							variables: {
								assignmentResponses: [assignmentResponse],
							},
							update: ApolloCacheManager.clearAssignmentCache,
						});

						const assignmentResponseId = get(
							reply,
							'data.insert_app_assignment_responses.returning[0].id'
						);

						if (isNil(assignmentResponseId)) {
							toastService.info(
								t(
									'assignment/views/assignment-detail___het-aanmaken-van-de-opdracht-antwoord-entry-is-mislukt-leeg-id'
								)
							);
							return;
						}

						(assignmentResponse as Partial<Avo.Assignment.Response>).id = assignmentResponseId;
						tempAssignment.assignment_responses = [assignmentResponse as Avo.Assignment.Response];
					} catch (err) {
						console.error(err);
						toastService.danger(
							t(
								'assignment/views/assignment-detail___het-aanmaken-van-een-opdracht-antwoord-entry-is-mislukt'
							)
						);
					}
				}
			}
		};

		// Retrieve data from GraphQL
		const retrieveAssignmentAndContent = () => {
			const assignmentQuery = {
				query: GET_ASSIGNMENT_WITH_RESPONSE,
				variables: {
					studentUuid: getProfileId(user),
					assignmentId: (match.params as any).id,
				},
			};

			// Load assignment
			dataService
				.query(assignmentQuery)
				.then(async (apiResponse: ApolloQueryResult<Avo.Assignment.Assignment>) => {
					const tempAssignment: Avo.Assignment.Assignment | undefined | null = get(
						apiResponse,
						'data.assignments[0]'
					);

					if (!tempAssignment) {
						setLoadingInfo({
							state: 'error',
							message: t('assignment/views/assignment-detail___de-opdracht-werdt-niet-gevonden'),
							icon: 'search',
						});
						return;
					}

					// Create an assignmentResponse object to track the student viewing and finishing the assignment
					// Currently we wait for this to complete
					// so we can set the created assignment response on the tempAssignment object,
					// so we don't need to do a refetch of the original assignment
					await createAssignmentResponseObject(tempAssignment);

					// Load content (collection, item or search query) according to assignment
					getAssignmentContent(tempAssignment)
						.then((response: Avo.Assignment.Content | null) => {
							setAssigmentContent(response);
							setAssignment(tempAssignment);
						})
						.catch(err => {
							console.error('Failed to get assignment content', err, {
								assignment: tempAssignment,
							});
							// Show toast instead of showing error using the loadingInfo
							// since we still want to show the assignment without the content if the content fails to load
							if (err && err.message === 'NOT_FOUND') {
								toastService.danger(
									t(
										'assignment/views/assignment-detail___de-opdracht-inhoud-werdt-niet-terug-gevonden'
									)
								);
							} else {
								toastService.danger(
									t(
										'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-inhoud-is-mislukt'
									)
								);
							}
						})
						.finally(() => setLoadingInfo({ state: 'loaded' }));
				})
				.catch(err => {
					const { DELETED, NOT_YET_AVAILABLE, PAST_DEADLINE } = AssignmentRetrieveError;
					let errorObj: { message: string; icon: IconName };
					const graphqlError = get(err, 'graphQLErrors[0].message');

					switch (graphqlError) {
						case DELETED:
							errorObj = {
								message: t('assignment/views/assignment-detail___de-opdracht-werd-verwijderd'),
								icon: 'delete' as IconName,
							};
							break;

						case NOT_YET_AVAILABLE:
							errorObj = {
								message: t(`De opdracht is nog niet beschikbaar`),
								icon: 'clock' as IconName,
							};
							break;

						case PAST_DEADLINE:
							errorObj = {
								message: t(
									'assignment/views/assignment-detail___de-deadline-voor-deze-opdracht-is-reeds-verlopen'
								),
								icon: 'clock' as IconName,
							};
							break;

						default:
							errorObj = {
								message: t(
									'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
								),
								icon: 'alert-triangle' as IconName,
							};
							break;
					}

					if (loadingInfo.state !== 'error' || !eq(errorObj.message, loadingInfo.message)) {
						console.error(err);
						setLoadingInfo({ state: 'error', ...errorObj });
					}
				});
		};

		checkPermissions(
			{
				name: PermissionNames.CREATE_ASSIGNMENT_RESPONSE,
				obj: match.params.id,
			},
			user,
			retrieveAssignmentAndContent,
			setLoadingInfo,
			t,
			t('assignment/views/assignment-detail___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken')
		);
	}, [match.params, user, isOwnerOfAssignment, triggerInsertAssignmentResponse, t]);

	const handleExtraOptionsClick = (itemId: 'archive') => {
		if (itemId === 'archive') {
			if (assignment && isOwnerOfAssignment(assignment)) {
				toastService.info(
					t(
						'assignment/views/assignment-detail___u-kan-deze-opdracht-niet-archiveren-want-dit-is-slechts-een-voorbeeld'
					)
				);
				return;
			}

			const assignmentResponse = getAssignmentResponse();

			if (!isNil(assignmentResponse) && !isNil(assignmentResponse.id)) {
				const updatedAssignmentResponse = omit(cloneDeep(assignmentResponse), ['__typename', 'id']);
				triggerUpdateAssignmentResponse({
					variables: {
						id: assignmentResponse.id,
						assignmentResponse: updatedAssignmentResponse,
					},
					update: ApolloCacheManager.clearAssignmentCache,
				})
					.then(() => {
						toastService.success(
							`De opdracht is ge${isAssignmentResponseArchived() ? 'de' : ''}archiveerd`
						);

						// Update local cached assignment
						setAssignment(
							set(
								cloneDeep(assignment as Avo.Assignment.Assignment),
								'assignment_responses[0].is_archived',
								!isAssignmentResponseArchived()
							)
						);
					})
					.catch(err => {
						console.error('failed to update assignmentResponse object', err, {
							variables: {
								assignmentResponse,
								id: assignmentResponse.id,
							},
						});
						toastService.danger(
							t('assignment/views/assignment-detail___het-archiveren-van-de-opdracht-is-mislukt')
						);
					});
			} else {
				console.error("assignmentResponse object is null or doesn't have an id", {
					assignmentResponse,
				});
				toastService.danger(
					t('assignment/views/assignment-detail___het-archiveren-van-de-opdracht-is-mislukt')
				);
			}
		}
	};

	const getAssignmentResponse = (): Avo.Assignment.Response | null => {
		return get(assignment, 'assignment_responses[0]', null);
	};

	const isAssignmentResponseArchived = (): Avo.Assignment.Response | null => {
		return get(getAssignmentResponse(), 'is_archived', false);
	};

	// Render methods
	const renderContent = () => {
		if (!assignment) {
			return null;
		}

		const { content_label, content_layout } = assignment;

		switch (content_label) {
			case 'COLLECTIE':
				return (
					<FragmentList
						collectionFragments={
							(assignmentContent as Avo.Collection.Collection).collection_fragments
						}
						showDescription={assignment.content_layout === AssignmentLayout.PlayerAndText}
						linkToItems={false}
						match={match}
						user={user}
						{...rest}
					/>
				);
			case 'ITEM':
				return (
					<ItemVideoDescription
						itemMetaData={assignmentContent as Avo.Item.Item}
						showDescription={content_layout === AssignmentLayout.PlayerAndText}
						match={match}
						user={user}
						{...rest}
					/>
				);
			default:
				return (
					<ErrorView
						icon="alert-triangle"
						message={t('assignment/views/assignment-detail___onverwacht-opdracht-inhoud-type-0', {
							type: content_label || undefined,
						})}
					/>
				);
		}
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
			? buildLink(ASSIGNMENT_PATH.ASSIGNMENT_EDIT, { id: assignment.id })
			: buildLink(WORKSPACE_PATH.WORKSPACE_TAB, { tabId: ASSIGNMENTS_ID });

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

		const tags: TagOption[] = (
			get(assignment, 'assignment_assignment_tags.assignment_tag') || []
		).map(({ id, label, color_override, enum_color }: Avo.Assignment.Tag) => ({
			id,
			label,
			color: color_override || enum_color.label,
		}));

		return (
			<div className="c-assignment-detail">
				<Navbar>
					<Container mode="vertical" size="small" background="alt">
						<Container mode="horizontal">
							<Toolbar size="huge" className="c-toolbar--drop-columns-low-mq c-toolbar__justified">
								<ToolbarLeft>
									<ToolbarItem>
										{renderBackLink()}
										<BlockHeading className="u-m-0" type="h2">
											{title}
										</BlockHeading>
									</ToolbarItem>
								</ToolbarLeft>
								<ToolbarRight>
									<>
										<ToolbarItem>
											<TagList tags={tags} closable={false} swatches bordered />
										</ToolbarItem>
										{!!profile && (
											<ToolbarItem>
												{renderAvatar(profile, { includeRole: true, small: true })}
											</ToolbarItem>
										)}
										<ToolbarItem>
											<Dropdown
												isOpen={isActionsDropdownOpen}
												menuWidth="fit-content"
												onClose={() => setActionsDropdownOpen(false)}
												onOpen={() => setActionsDropdownOpen(true)}
												placement="bottom-end"
											>
												<DropdownButton>
													<Button icon="more-horizontal" type="secondary" />
												</DropdownButton>
												<DropdownContent>
													<MenuContent
														menuItems={[
															{
																icon: 'archive',
																id: 'archive',
																label: `${
																	isAssignmentResponseArchived() ? 'Dearchiveer' : 'Archiveer'
																}`,
															},
														]}
														onClick={handleExtraOptionsClick as any}
													/>
												</DropdownContent>
											</Dropdown>
										</ToolbarItem>
									</>
								</ToolbarRight>
							</Toolbar>
						</Container>
						<Spacer margin="top">
							<Container mode="horizontal">
								<div className="c-content" dangerouslySetInnerHTML={{ __html: description }} />
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
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			notFoundError="De opdracht werdt niet gevonden"
			dataObject={assignment}
			render={renderAssignment}
		/>
	);
};

export default AssignmentDetail;
