import { get } from 'lodash-es';
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
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
	Spinner,
	TagList,
	TagOption,
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

interface AssignmentProps extends RouteComponentProps {}

const AssignmentDetail: FunctionComponent<AssignmentProps> = ({ match }) => {
	const [isActionsDropdownOpen, setActionsDropdownOpen] = useState<boolean>(false);

	const [assignment, setAssignment] = useState<Assignment | undefined>();
	const [assigmentContent, setAssigmentContent] = useState<AssignmentContent | null | undefined>();
	const [loadingState, setLoadingState] = useState<LoadingState>('loading');
	const [loadingError, setLoadingError] = useState<{ error: string; icon: string } | null>(null);

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
			<Fragment>
				<Container mode="vertical" size="small" background={'alt'}>
					<nav className="c-navbar c-navbar--auto c-navbar--bg-alt">
						<div className="o-container">
							<div className="c-toolbar c-toolbar--huge c-toolbar--drop-columns-low-mq">
								<div className="c-toolbar__left">
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
								</div>
								<div className="c-toolbar__right">
									<div className="c-toolbar__item">
										<TagList tags={tags} closable={false} swatches bordered />
									</div>
									{!!assignment.user && (
										<div className="c-toolbar__item">
											<Avatar
												size="small"
												initials={assignment.user.first_name[0] + assignment.user.last_name[0]}
												name={`${assignment.user.role && assignment.user.role.label}: ${
													assignment.user.first_name
												} ${assignment.user.last_name}`}
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
								</div>
							</div>
						</div>
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
					</nav>
				</Container>

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
			</Fragment>
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
