import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { clone, cloneDeep, debounce, get, isNil, omit, set } from 'lodash-es';
import React, {
	createRef,
	FunctionComponent,
	ReactElement,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Avatar,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	MenuContent,
	TagList,
	TagOption,
	Toolbar,
	ToolbarCenter,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import NotFound from '../../404/views/NotFound';
import FragmentDetail from '../../collection/components/FragmentDetail';
import { RouteParts } from '../../constants';
import ItemVideoDescription from '../../item/components/ItemVideoDescription';
import LoadingErrorLoadedComponent from '../../shared/components/DataComponent/LoadingErrorLoadedComponent';
import { dataService } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';
import {
	GET_ASSIGNMENT_WITH_RESPONSE,
	INSERT_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT_RESPONSE,
} from '../graphql';
import { getAssignmentContent, LoadingState } from '../helpers';
import { Assignment, AssignmentContent, AssignmentResponse, AssignmentTag } from '../types';

import './AssignmentDetail.scss';

interface AssignmentProps extends RouteComponentProps {}

const DEFAULT_ASSIGNMENT_DESCRIPTION_HEIGHT = 200;

const AssignmentDetail: FunctionComponent<AssignmentProps> = ({ match }) => {
	const [isActionsDropdownOpen, setActionsDropdownOpen] = useState<boolean>(false);
	const [isDescriptionCollapsed, setDescriptionCollapsed] = useState<boolean>(false);
	const [navBarHeight, setNavBarHeight] = useState<number>(DEFAULT_ASSIGNMENT_DESCRIPTION_HEIGHT);
	const [assignment, setAssignment] = useState<Assignment>();
	const [assigmentContent, setAssigmentContent] = useState<AssignmentContent | null | undefined>();
	const [loadingState, setLoadingState] = useState<LoadingState>('loading');
	const [loadingError, setLoadingError] = useState<{ error: string; icon: IconName } | null>(null);

	const [triggerInsertAssignmentResponse] = useMutation(INSERT_ASSIGNMENT_RESPONSE);
	const [triggerUpdateAssignmentResponse] = useMutation(UPDATE_ASSIGNMENT_RESPONSE);

	const navBarRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();

	const isOwnerOfAssignment = (tempAssignment: Assignment) => {
		// TODO replace with getUser().uuid once available
		return '54859c98-d5d3-1038-8d91-6dfda901a78e' === tempAssignment.owner_uid;
	};

	// Handle resize
	const onResizeHandler = debounce(
		() => {
			if (navBarRef.current) {
				const navBarHeight = navBarRef.current.getBoundingClientRect().height;
				setNavBarHeight(navBarHeight);
			} else {
				setNavBarHeight(DEFAULT_ASSIGNMENT_DESCRIPTION_HEIGHT);
			}
		},
		300,
		{ leading: false, trailing: true }
	);

	const registerResizeHandler = () => {
		window.addEventListener('resize', onResizeHandler);
		onResizeHandler();

		return window.removeEventListener('resize', onResizeHandler);
	};

	useEffect(registerResizeHandler, [isDescriptionCollapsed]);

	/**
	 * If the creation of the assignment response fails, we'll still continue with getting the assignment content
	 * @param tempAssignment assignment is passed since the tempAssignment has not been set into the state yet,
	 * since we might need to get the assignment content as well and
	 * this looks cleaner if everything loads at once instead of staggered
	 */
	const createAssignmentResponseObject = async (tempAssignment: Assignment) => {
		if (!isOwnerOfAssignment(tempAssignment)) {
			let assignmentResponse: Partial<AssignmentResponse> | null | undefined = get(
				tempAssignment,
				'assignment_responses[0]'
			);
			if (!assignmentResponse) {
				// Student has never viewed this assignment before, we should create a response object for him
				assignmentResponse = {
					owner_uids: ['54859c98-d5d3-1038-8d91-6dfda901a78e'], // TODO replace with getUser().uuid
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
					});
					const assignmentResponseId = get(
						reply,
						'data.insert_app_assignment_responses.returning[0].id'
					);
					if (isNil(assignmentResponseId)) {
						toastService('Het aanmaken van de opdracht antwoord entry is mislukt (leeg id)');
						return;
					}
					(assignmentResponse as Partial<AssignmentResponse>).id = assignmentResponseId;
					tempAssignment.assignment_responses = [assignmentResponse as AssignmentResponse];
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
				studentUuid: ['54859c98-d5d3-1038-8d91-6dfda901a78e'],
				assignmentId: (match.params as any).id,
			},
		};

		// Load assignment
		dataService
			.query(assignmentQuery)
			.then(async (apiResponse: ApolloQueryResult<Assignment>) => {
				const tempAssignment: Assignment | undefined | null = get(
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
				getAssignmentContent(tempAssignment).then((response: AssignmentContent | string | null) => {
					if (typeof response === 'string') {
						toastService(response);
						return;
					}

					setAssigmentContent(response);
					setAssignment(tempAssignment);
					setLoadingState('loaded');
				});
			})
			.catch(err => {
				console.error(err);
				setLoadingState('error');
				setLoadingError({
					error: 'Het ophalen van de opdracht is mislukt',
					icon: 'alert-triangle',
				});
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
				})
					.then(() => {
						toastService(
							`De opdracht is ge${isAssignmentResponseArchived() ? 'de' : ''}archiveerd`,
							TOAST_TYPE.SUCCESS
						);
						// Update local cached assignment
						setAssignment(
							set(
								cloneDeep(assignment as Assignment),
								'assignment_responses[0].is_archived',
								!isAssignmentResponseArchived()
							)
						);
					})
					.catch(err => {
						console.error('failed to update assignmentResponse object', err, {
							variables: {
								id: assignmentResponse.id,
								assignmentResponse,
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

	const getAssignmentResponse = (): AssignmentResponse | null => {
		return get(assignment, 'assignment_responses[0]', null);
	};

	const isAssignmentResponseArchived = (): AssignmentResponse | null => {
		return get(getAssignmentResponse(), 'is_archived', false);
	};

	const renderContent = () => {
		if (!assignment) {
			return null;
		}

		switch (assignment.content_label) {
			case 'COLLECTIE':
				return (
					<FragmentDetail
						collectionFragments={
							(assigmentContent as Avo.Collection.Collection).collection_fragments
						}
					/>
				);
			case 'ITEM':
				return <ItemVideoDescription itemMetaData={assigmentContent as Avo.Item.Item} />;
			default:
				return (
					<NotFound
						icon="alert-triangle"
						message={`Onverwacht opdracht inhoud type: "${assignment.content_label}"`}
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

		if (isOwnerOfAssignment(assignment)) {
			return (
				<Link
					className="c-return"
					to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${assignment.id}/${
						RouteParts.Edit
					}`}
				>
					<Icon type="arrows" name="chevron-left" />
					<span>Terug naar opdracht bewerken</span>
				</Link>
			);
		} else {
			return (
				<Link className="c-return" to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}`}>
					<Icon type="arrows" name="chevron-left" />
					<span>Mijn opdrachten</span>
				</Link>
			);
		}
	};

	const renderAssignment = (): ReactElement | null => {
		if (!assignment) {
			return null;
		}

		const tags: TagOption[] = (
			get(assignment, 'assignment_assignment_tags.assignment_tag') || []
		).map(
			(tag: AssignmentTag): TagOption => ({
				id: tag.id,
				label: tag.label,
				color: tag.color_override || tag.enum_color.label,
			})
		);

		return (
			<div className="c-assigment-detail">
				<div className="c-navbar" ref={navBarRef}>
					<Container mode="vertical" size="small" background="alt">
						<Container mode="horizontal">
							<Toolbar size="huge" className="c-toolbar--drop-columns-low-mq c-toolbar__justified">
								<ToolbarLeft>
									<ToolbarItem>
										{renderBackLink()}
										<h2 className="c-h2 u-m-0">{assignment.title}</h2>
									</ToolbarItem>
								</ToolbarLeft>
								<ToolbarCenter>
									<div style={{ zIndex: 22 }}>
										<Button
											icon={isDescriptionCollapsed ? 'chevron-up' : 'chevron-down'}
											label={isDescriptionCollapsed ? 'opdracht tonen' : 'opdracht verbergen'}
											onClick={() => setDescriptionCollapsed(!isDescriptionCollapsed)}
										/>
									</div>
								</ToolbarCenter>
								<ToolbarRight>
									<>
										<ToolbarItem>
											<TagList tags={tags} closable={false} swatches bordered />
										</ToolbarItem>
										{!!assignment.user && (
											<ToolbarItem>
												<Avatar
													size="small"
													initials={
														get(assignment, 'user.first_name[0]') +
														get(assignment, 'user.last_name[0]')
													}
													name={`${assignment.user.role && assignment.user.role.label}: ${get(
														assignment,
														'user.first_name[0]'
													)}. ${assignment.user.last_name}`}
													image={
														(assignment.user.profile && assignment.user.profile.avatar) || undefined
													}
												/>
											</ToolbarItem>
										)}
										<ToolbarItem>
											<Dropdown
												autoSize
												isOpen={isActionsDropdownOpen}
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
						{!isDescriptionCollapsed && (
							<Container mode="horizontal">
								<div
									className="c-content"
									dangerouslySetInnerHTML={{ __html: assignment.description }}
								/>
								{!!assignment.answer_url && (
									<div className="c-box c-box--padding-small c-box--soft-white">
										<p>Geef je antwoorden in op:</p>
										<p>
											<a href={assignment.answer_url}>{assignment.answer_url}</a>
										</p>
									</div>
								)}
							</Container>
						)}
					</Container>
				</div>

				<div style={{ height: `${navBarHeight}px` }}>{/*whitespace behind fixed navbar*/}</div>

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
