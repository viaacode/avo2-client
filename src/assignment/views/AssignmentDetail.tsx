import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { cloneDeep, eq, get, isNil, omit, set } from 'lodash-es';
import React, { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Box,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	MenuContent,
	Spacer,
	TagList,
	TagOption,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getProfileId } from '../../authentication/helpers/get-profile-info';
import { LoginResponse } from '../../authentication/store/types';
import { FragmentDetail } from '../../collection/components';
import { RouteParts } from '../../constants';
import { ErrorView } from '../../error/views';
import { ItemVideoDescription } from '../../item/components';
import { LoadingErrorLoadedComponent } from '../../shared/components';
import { renderAvatar } from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';

import {
	GET_ASSIGNMENT_WITH_RESPONSE,
	INSERT_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT_RESPONSE,
} from '../assignment.gql';
import { getAssignmentContent, LoadingState } from '../assignment.helpers';
import { AssignmentLayout } from '../assignment.types';

import './AssignmentDetail.scss';

interface AssignmentProps extends RouteComponentProps {
	loginResponse: LoginResponse | null;
}

export enum AssignmentRetrieveError {
	DELETED = 'DELETED',
	NOT_YET_AVAILABLE = 'NOT_YET_AVAILABLE',
	PAST_DEADLINE = 'PAST_DEADLINE',
} // TODO: replace with typings repo Avo.Assignment.RetrieveError

const AssignmentDetail: FunctionComponent<AssignmentProps> = ({ match }) => {
	// State
	const [isActionsDropdownOpen, setActionsDropdownOpen] = useState<boolean>(false);
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment>();
	const [assigmentContent, setAssigmentContent] = useState<
		Avo.Assignment.Content | null | undefined
	>();
	const [loadingState, setLoadingState] = useState<LoadingState>('loading');
	const [loadingError, setLoadingError] = useState<{ error: string; icon: IconName } | null>(null);

	// Mutations
	const [triggerInsertAssignmentResponse] = useMutation(INSERT_ASSIGNMENT_RESPONSE);
	const [triggerUpdateAssignmentResponse] = useMutation(UPDATE_ASSIGNMENT_RESPONSE);

	const isOwnerOfAssignment = (tempAssignment: Avo.Assignment.Assignment) => {
		return getProfileId() === tempAssignment.owner_profile_id;
	};

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
					owner_profile_ids: [getProfileId()], // TODO: replace with getUser().uuid
					assignment_id: tempAssignment.id,
					collection: null,
					collection_id: null,
					submitted_at: null,
				};

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
						toastService('Het aanmaken van de opdracht antwoord entry is mislukt (leeg id)');
						return;
					}

					(assignmentResponse as Partial<Avo.Assignment.Response>).id = assignmentResponseId;
					tempAssignment.assignment_responses = [assignmentResponse as Avo.Assignment.Response];
				} catch (err) {
					console.error(err);
					toastService(
						'Het aanmaken van een opdracht antwoord entry is mislukt',
						TOAST_TYPE.DANGER
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
				studentUuid: [getProfileId()],
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
					setLoadingState('error');
					setLoadingError({ error: 'De opdracht werdt niet gevonden', icon: 'search' });
					return;
				}

				// Create an assignmentResponse object to track the student viewing and finishing the assignment
				// Currently we wait for this to complete
				// so we can set the created assignment response on the tempAssignment object,
				// so we don't need to do a refetch of the original assignment
				await createAssignmentResponseObject(tempAssignment);

				// Load content (collection, item or search query) according to assignment
				getAssignmentContent(tempAssignment).then(
					(response: Avo.Assignment.Content | string | null) => {
						if (typeof response === 'string') {
							toastService(response);
							return;
						}

						setAssigmentContent(response);
						setAssignment(tempAssignment);
						setLoadingState('loaded');
					}
				);
			})
			.catch(err => {
				const { DELETED, NOT_YET_AVAILABLE, PAST_DEADLINE } = AssignmentRetrieveError;
				let errorObj: { error: string; icon: IconName };
				const graphqlError = get(err, 'graphQLErrors[0].message');

				switch (graphqlError) {
					case DELETED:
						errorObj = {
							error: 'De opdracht werd verwijderd',
							icon: 'delete' as IconName,
						};
						break;

					case NOT_YET_AVAILABLE:
						errorObj = {
							error: `De opdracht is nog niet beschikbaar`,
							icon: 'clock' as IconName,
						};
						break;

					case PAST_DEADLINE:
						errorObj = {
							error: 'De deadline voor deze opdracht is reeds verlopen',
							icon: 'clock' as IconName,
						};
						break;

					default:
						errorObj = {
							error: 'Het ophalen van de opdracht is mislukt',
							icon: 'alert-triangle' as IconName,
						};
						break;
				}

				if (loadingState !== 'error' || !eq(errorObj, loadingError)) {
					console.error(err);
					setLoadingState('error');
					setLoadingError(errorObj);
				}
			});
	};

	useEffect(retrieveAssignmentAndContent, []);

	const handleExtraOptionsClick = (itemId: 'archive') => {
		if (itemId === 'archive') {
			if (assignment && isOwnerOfAssignment(assignment)) {
				toastService(
					'U kan deze opdracht niet archiveren want dit is slechts een voorbeeld',
					TOAST_TYPE.INFO
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
						toastService(
							`De opdracht is ge${isAssignmentResponseArchived() ? 'de' : ''}archiveerd`,
							TOAST_TYPE.SUCCESS
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
						toastService('Het archiveren van de opdracht is mislukt', TOAST_TYPE.DANGER);
					});
			} else {
				console.error("assignmentResponse object is null or doesn't have an id", {
					assignmentResponse,
				});
				toastService('Het archiveren van de opdracht is mislukt', TOAST_TYPE.DANGER);
			}
		}
	};

	const getAssignmentResponse = (): Avo.Assignment.Response | null => {
		return get(assignment, 'assignment_responses[0]', null);
	};

	const isAssignmentResponseArchived = (): Avo.Assignment.Response | null => {
		return get(getAssignmentResponse(), 'is_archived', false);
	};

	const renderContent = () => {
		if (!assignment) {
			return null;
		}

		const { content_label, content_layout } = assignment;

		switch (content_label) {
			case 'COLLECTIE':
				return (
					<FragmentDetail
						collectionFragments={
							(assigmentContent as Avo.Collection.Collection).collection_fragments
						}
					/>
				);
			case 'ITEM':
				return (
					<ItemVideoDescription
						itemMetaData={assigmentContent as Avo.Item.Item}
						showDescriptionNextToVideo={content_layout === AssignmentLayout.PlayerAndText}
					/>
				);
			default:
				return (
					<ErrorView
						icon="alert-triangle"
						message={`Onverwacht opdracht inhoud type: "${content_label}"`}
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
		const isOwner = getProfileId() === assignment.owner_profile_id;

		return (
			<Link
				className="c-return"
				to={
					isOwner
						? `/${RouteParts.Workspace}/${RouteParts.Assignments}/${assignment.id}/${
								RouteParts.Edit
						  }`
						: `/${RouteParts.Workspace}/${RouteParts.Assignments}`
				}
			>
				<Icon type="arrows" name="chevron-left" />
				<span>{isOwner ? 'Terug naar opdracht bewerken' : 'Mijn opdrachten'}</span>
			</Link>
		);
	};

	const renderAssignment = (): ReactElement | null => {
		if (!assignment) {
			return null;
		}

		const tags: TagOption[] = (
			get(assignment, 'assignment_assignment_tags.assignment_tag') || []
		).map(
			(tag: Avo.Assignment.Tag): TagOption => ({
				id: tag.id,
				label: tag.label,
				color: tag.color_override || tag.enum_color.label,
			})
		);

		return (
			<div className="c-assignment-detail">
				<div className="c-navbar">
					<Container mode="vertical" size="small" background="alt">
						<Container mode="horizontal">
							<Toolbar size="huge" className="c-toolbar--drop-columns-low-mq c-toolbar__justified">
								<ToolbarLeft>
									<ToolbarItem>
										{renderBackLink()}
										<h2 className="c-h2 u-m-0">{assignment.title}</h2>
									</ToolbarItem>
								</ToolbarLeft>
								<ToolbarRight>
									<>
										<ToolbarItem>
											<TagList tags={tags} closable={false} swatches bordered />
										</ToolbarItem>
										{!!assignment.profile && (
											<ToolbarItem>
												{renderAvatar(assignment.profile, { includeRole: true, small: true })}
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
								<div
									className="c-content"
									dangerouslySetInnerHTML={{ __html: assignment.description }}
								/>
								{!!assignment.answer_url && (
									<Box backgroundColor="soft-white" condensed>
										<p>Geef je antwoorden in op:</p>
										<p>
											<a href={assignment.answer_url}>{assignment.answer_url}</a>
										</p>
									</Box>
								)}
							</Container>
						</Spacer>
					</Container>
				</div>
				<Container mode="vertical">
					<Container mode="horizontal">{renderContent()}</Container>
				</Container>
			</div>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingState={loadingState}
			loadingError={loadingError && loadingError.error}
			loadingErrorIcon={loadingError && loadingError.icon}
			notFoundError="De opdracht werdt niet gevonden"
			dataObject={assignment}
			render={renderAssignment}
		/>
	);
};

export default withRouter(AssignmentDetail);
