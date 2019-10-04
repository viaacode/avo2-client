import { debounce, get } from 'lodash-es';
import React, {
	createRef,
	Fragment,
	FunctionComponent,
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
	Navbar,
	Spinner,
	TagList,
	TagOption,
	Toolbar,
	ToolbarCenter,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';

import { Avo } from '@viaa/avo2-types';
import { ApolloQueryResult } from 'apollo-client';
import NotFound from '../../404/views/NotFound';
import CollectionFragmentsDetail from '../../collection/components/CollectionFragmentsDetail';
import { RouteParts } from '../../constants';
import ItemVideoDescription from '../../item/components/ItemVideoDescription';
import { dataService } from '../../shared/services/data-service';
import toastService from '../../shared/services/toast-service';
import { GET_ASSIGNMENT_WITH_RESPONSE } from '../graphql';
import { getAssignmentContent, LoadingState } from '../helpers';
import { Assignment, AssignmentContent, AssignmentTag } from '../types';

import './AssignmentDetail.scss';

interface AssignmentProps extends RouteComponentProps {}

const AssignmentDetail: FunctionComponent<AssignmentProps> = ({ match }) => {
	const [isActionsDropdownOpen, setActionsDropdownOpen] = useState<boolean>(false);
	const [isDescriptionCollapsed, setDescriptionCollapsed] = useState<boolean>(false);
	const [navBarHeight, setNavBarHeight] = useState<number>(200);

	const [assignment, setAssignment] = useState<Assignment | undefined>();
	const [assigmentContent, setAssigmentContent] = useState<AssignmentContent | null | undefined>();
	const [loadingState, setLoadingState] = useState<LoadingState>('loading');
	const [loadingError, setLoadingError] = useState<{ error: string; icon: string } | null>(null);

	const navBarRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();

	/**
	 * Load the content (collection, item or searchquery) after we've loaded the assignment
	 */
	useEffect(() => {
		dataService
			.query({
				query: GET_ASSIGNMENT_WITH_RESPONSE,
				variables: {
					studentUuid: ['54859c98-d5d3-1038-8d91-6dfda901a78e'],
					assignmentId: (match.params as any).id,
				},
			})
			.then((response: ApolloQueryResult<Assignment>) => {
				const tempAssignment = get(response, 'data.assignments[0]');
				if (!tempAssignment) {
					setLoadingState('error');
					setLoadingError({ error: 'De opdracht werdt niet gevonden', icon: 'search' });
					return;
				}
				getAssignmentContent(tempAssignment).then((response: AssignmentContent | string | null) => {
					if (typeof response === 'string') {
						// error message
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
	}, [match.params]);

	useEffect(() => {
		// Register window listener when the component mounts
		console.log('useeffect');
		const onResizeHandler = debounce(
			() => {
				if (navBarRef.current) {
					const navBarHeight = navBarRef.current.getBoundingClientRect().height;
					setNavBarHeight(navBarHeight);
				} else {
					setNavBarHeight(387);
				}
			},
			300,
			{ leading: false, trailing: true }
		);

		window.addEventListener('resize', onResizeHandler);
		onResizeHandler();

		return () => {
			window.removeEventListener('resize', onResizeHandler);
		};
	}, [isDescriptionCollapsed]);

	const handleExtraOptionsClick = (itemId: 'archive') => {
		switch (itemId) {
			case 'archive':

			default:
				return null;
		}
	};

	const renderAssignment = (assignment: Assignment) => {
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
				{/* Do not switch to a NavBar component since we need to be able to set a ref to get the height dynamically */}
				<div className="c-navbar" ref={navBarRef}>
					<Container mode="vertical" size="small" background={'alt'}>
						<Container mode="horizontal">
							{/*TODO replace with toolbar with direct children*/}
							<Toolbar size="huge" className="c-toolbar--drop-columns-low-mq c-toolbar__justified">
								<ToolbarLeft>
									<div className="c-toolbar__item">
										<Link
											className="c-return"
											to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}`}
										>
											<Icon type="arrows" name="chevron-left" />
											<span>Mijn opdrachten</span>
										</Link>
										<h2 className="c-h2 u-m-0">{assignment.title}</h2>
									</div>
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
									<Fragment>
										<div className="c-toolbar__item">
											<TagList tags={tags} closable={false} swatches bordered />
										</div>
										{!!assignment.user && (
											<div className="c-toolbar__item">
												<Avatar
													size="small"
													initials={assignment.user.first_name[0] + assignment.user.last_name[0]}
													name={`${assignment.user.role && assignment.user.role.label}: ${
														assignment.user.first_name[0]
													}. ${assignment.user.last_name}`}
													image={
														(assignment.user.profile && assignment.user.profile.avatar) || undefined
													}
												/>
											</div>
										)}
										<div className="c-toolbar__item">
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
														menuItems={[{ icon: 'archive', id: 'archive', label: 'Archiveer' }]}
														onClick={handleExtraOptionsClick as any}
													/>
												</DropdownContent>
											</Dropdown>
										</div>
									</Fragment>
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
					<Container mode="horizontal">
						{assignment.content_label === 'COLLECTIE' && (
							<CollectionFragmentsDetail
								collectionFragments={
									(assigmentContent as Avo.Collection.Response).collection_fragments
								}
							/>
						)}
						{assignment.content_label === 'ITEM' && (
							<ItemVideoDescription itemMetaData={assigmentContent as Avo.Item.Response} />
						)}
					</Container>
				</Container>
			</div>
		);
	};

	if (loadingState === 'loading') {
		return (
			<div className="o-flex o-flex--horizontal-center">
				<Spinner size="large" />
			</div>
		);
	} else if (loadingState === 'loaded' && assignment) {
		return renderAssignment(assignment);
	} else {
		return (
			<NotFound
				message={loadingError ? loadingError.error : 'Het ophalen van de opdracht is mislukt'}
				icon={loadingError ? loadingError.icon : 'alert-triangle'}
			/>
		);
	}
};

export default withRouter(AssignmentDetail);
