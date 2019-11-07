import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-boost';
import { DocumentNode } from 'graphql';
import { cloneDeep, get, isEmpty, remove } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Alert,
	Button,
	ButtonToolbar,
	Container,
	DateTimePicker,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Icon,
	IconName,
	MenuContent,
	Navbar,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	TagOption,
	TextInput,
	Thumbnail,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { ContentType } from '@viaa/avo2-components/dist/types';
import { Avo } from '@viaa/avo2-types';

import { connect } from 'react-redux';
import { selectLogin } from '../../authentication/store/selectors';
import { LoginResponse } from '../../authentication/store/types';
import { GET_COLLECTION_BY_ID } from '../../collection/graphql';
import { dutchContentLabelToEnglishLabel, DutchContentType } from '../../collection/types';
import { RouteParts } from '../../constants';
import { GET_ITEM_BY_ID } from '../../item/item.gql';
import { renderDropdownButton } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import LoadingErrorLoadedComponent from '../../shared/components/DataComponent/LoadingErrorLoadedComponent';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import InputModal from '../../shared/components/modals/InputModal';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { dataService } from '../../shared/services/data-service';
import { EventObjectType, trackEvents } from '../../shared/services/event-logging-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import {
	DELETE_ASSIGNMENT,
	GET_ASSIGNMENT_BY_ID,
	INSERT_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
} from '../graphql';
import { deleteAssignment, insertAssignment, updateAssignment } from '../services';
import { AssignmentLayout } from '../types';

import { getProfileName } from '../../authentication/helpers/get-profile-info';
import './AssignmentEdit.scss';

const CONTENT_LABEL_TO_ROUTE_PARTS: { [contentType in Avo.Assignment.ContentLabel]: string } = {
	ITEM: RouteParts.Item,
	COLLECTIE: RouteParts.Collection,
	ZOEKOPDRACHT: RouteParts.SearchQuery,
};

const CONTENT_LABEL_TO_EVENT_OBJECT_TYPE: {
	[contentType in Avo.Assignment.ContentLabel]: EventObjectType
} = {
	ITEM: 'item',
	COLLECTIE: 'collection',
	ZOEKOPDRACHT: 'searchQuery',
};

const CONTENT_LABEL_TO_QUERY: {
	[contentType in Avo.Assignment.ContentLabel]: { query: DocumentNode; resultPath: string }
} = {
	COLLECTIE: {
		query: GET_COLLECTION_BY_ID,
		resultPath: 'app_collections[0]',
	},
	ITEM: {
		query: GET_ITEM_BY_ID,
		resultPath: 'app_item_meta[0]',
	},
	ZOEKOPDRACHT: {
		// TODO implement search query saving and usage
		// query: GET_SEARCH_QUERY_BY_ID,
		// resultPath: 'app_item_meta[0]',
	} as any,
};

interface AssignmentEditProps extends RouteComponentProps {
	loginState: LoginResponse | null;
}

// TODO: Test with a single useEffect
let currentAssignment: Partial<Avo.Assignment.Assignment>;
let setCurrentAssignment: (newAssignment: Partial<Avo.Assignment.Assignment>) => void;
let initialAssignment: Partial<Avo.Assignment.Assignment>;
let setInitialAssignment: (newAssignment: Partial<Avo.Assignment.Assignment>) => void;

const AssignmentEdit: FunctionComponent<AssignmentEditProps> = ({
	history,
	location,
	match,
	loginState,
}) => {
	[currentAssignment, setCurrentAssignment] = useState<Partial<Avo.Assignment.Assignment>>({});
	[initialAssignment, setInitialAssignment] = useState<Partial<Avo.Assignment.Assignment>>({});
	const [pageType, setPageType] = useState<'create' | 'edit' | undefined>();
	const [assignmentContent, setAssignmentContent] = useState<Avo.Assignment.Content | undefined>(
		undefined
	);
	const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
	const [loadingError, setLoadingError] = useState<{ error: string; icon: IconName } | null>(null);
	const [tagsDropdownOpen, setTagsDropdownOpen] = useState<boolean>(false);
	const [isExtraOptionsMenuOpen, setExtraOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [isDuplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [triggerAssignmentDelete] = useMutation(DELETE_ASSIGNMENT);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerAssignmentUpdate] = useMutation(UPDATE_ASSIGNMENT);

	const setBothAssignments = (assignment: Partial<Avo.Assignment.Assignment>) => {
		setCurrentAssignment(assignment);
		setInitialAssignment(assignment);
	};

	/**
	 *  Get query string variables and store them into the assignment state object
	 */
	useEffect(() => {
		const initAssignmentData = async () => {
			try {
				if (loadingState === 'error') {
					// Do not keep trying to fetch the assignment when an error occurred
					return;
				}

				// Determine if this is an edit or create page and initialize or fetch the assignment
				let assignment: Partial<Avo.Assignment.Assignment> | null;
				if (location.pathname.includes(RouteParts.Create)) {
					setPageType('create');
					assignment = initAssignmentsByQueryParams();
				} else {
					setPageType('edit');
					assignment = await fetchAssignment((match.params as any).id);
				}

				if (!assignment) {
					// Something went wrong during init/fetch
					return;
				}

				// Fetch the content if the assignment has content
				await fetchAssignmentContent(assignment);
			} catch (err) {
				setLoadingError({
					error: 'Het ophalen/aanmaken van de opdracht is mislukt',
					icon: 'alert-triangle',
				});
			}
		};

		/**
		 * Get assignment_type, content_id and content_label from query params
		 */
		const initAssignmentsByQueryParams = (): Partial<Avo.Assignment.Assignment> => {
			if (currentAssignment && !isEmpty(currentAssignment)) {
				// Only init the assignment if not set yet
				return currentAssignment;
			}
			const queryParams = queryString.parse(location.search);
			let newAssignment: Partial<Avo.Assignment.Assignment> | undefined;

			if (typeof queryParams.assignment_type === 'string') {
				newAssignment = {
					assignment_type: queryParams.assignment_type as Avo.Assignment.Type,
				};
			}

			if (typeof queryParams.content_id === 'string') {
				newAssignment = {
					...(newAssignment || {}),
					content_id: queryParams.content_id,
				};
			}

			if (typeof queryParams.content_label === 'string') {
				newAssignment = {
					...(newAssignment || {}),
					content_label: queryParams.content_label as Avo.Assignment.ContentLabel,
				};
			}

			newAssignment = {
				...(currentAssignment || {}),
				...newAssignment,
			} as Avo.Assignment.Assignment;

			setBothAssignments(newAssignment);

			return newAssignment;
		};

		const fetchAssignment = async (
			id: string | number
		): Promise<Avo.Assignment.Assignment | null> => {
			try {
				if (currentAssignment && !isEmpty(currentAssignment)) {
					// Only fetch the assignment if not set yet
					return currentAssignment as Avo.Assignment.Assignment;
				}

				const assignmentQuery = {
					query: GET_ASSIGNMENT_BY_ID,
					variables: { id },
				};

				// Get the assigment from graphql
				const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query(
					assignmentQuery
				);

				const assignmentResponse: Avo.Assignment.Assignment | undefined = get(
					response,
					'data.app_assignments[0]'
				);
				if (!assignmentResponse) {
					setLoadingState('error');
					setLoadingError({
						error: 'Het ophalen van de opdracht inhoud is mislukt (leeg antwoord)',
						icon: 'search',
					});
					return null;
				}
				setBothAssignments(assignmentResponse);
				setLoadingState('loaded');
				return assignmentResponse;
			} catch (err) {
				console.error(err);

				setLoadingState('error');
				setLoadingError({
					error: 'Het ophalen van de opdracht is mislukt',
					icon: 'alert-triangle',
				});
				return null;
			}
		};

		/**
		 * Load the content if they are not loaded yet
		 */
		const fetchAssignmentContent = async (assignment: Partial<Avo.Assignment.Assignment>) => {
			try {
				if (!assignment.assignment_type || assignmentContent) {
					// Only fetch assignment content if not set yet
					return;
				}
				if (!assignment.content_id || !assignment.content_label) {
					// The assignment doesn't have content linked to it
					setLoadingState('loaded');
					return;
				}

				// Fetch the content from the network
				const queryParams = {
					query:
						CONTENT_LABEL_TO_QUERY[assignment.content_label as Avo.Assignment.ContentLabel].query,
					variables: { id: assignment.content_id },
				};
				const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query(
					queryParams
				);

				const assignmentContentResponse = get(
					response,
					`data.${
						CONTENT_LABEL_TO_QUERY[assignment.content_label as Avo.Assignment.ContentLabel]
							.resultPath
					}`
				);
				if (!assignmentContentResponse) {
					console.error('Failed to fetch the assignment content', { response, ...queryParams });
					setLoadingState('error');
					setLoadingError({
						error: 'Het ophalen van de opdracht inhoud is mislukt (leeg antwoord)',
						icon: 'search',
					});
					return;
				}
				setAssignmentContent(assignmentContentResponse);
				setBothAssignments({
					...assignment,
					title:
						assignment.title ||
						(assignmentContentResponse && assignmentContentResponse.title) ||
						'',
				});
				setLoadingState('loaded');
			} catch (err) {
				console.error(err);
				setLoadingState('error');
				setLoadingError({
					error: 'Het ophalen van de opdracht inhoud is mislukt',
					icon: 'alert-triangle',
				});
			}
		};

		initAssignmentData();
	}, [loadingState, location, match.params, setLoadingState, assignmentContent]);

	const deleteCurrentAssignment = async () => {
		try {
			if (typeof currentAssignment.id === 'undefined') {
				toastService('De huidige opdracht is nog nooit opgeslagen (geen id)', TOAST_TYPE.DANGER);
				return;
			}
			await deleteAssignment(triggerAssignmentDelete, currentAssignment.id);
			history.push(`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}`);
			toastService('De opdracht is verwijdert', TOAST_TYPE.SUCCESS);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const getAssignmentUrl = (absolute: boolean = true) => {
		return `${absolute ? window.location.origin : ''}/${RouteParts.Assignment}/${
			currentAssignment.id
		}`;
	};

	const copyAssignmentUrl = () => {
		copyToClipboard(getAssignmentUrl());
		toastService('De url is naar het klembord gekopieert', TOAST_TYPE.SUCCESS);

		if (currentAssignment.id) {
			trackEvents({
				event_object: {
					type: 'assignment',
					identifier: String(currentAssignment.id),
				},
				event_message: `Gebruiker ${getProfileName()} heeft de permalink voor opdracht ${
					currentAssignment.id
				} gekopieert`,
				name: 'view',
				category: 'item',
			});
		}
	};

	const viewAsStudent = () => {
		history.push(getAssignmentUrl(false));
	};

	const archiveAssignment = async (shouldBeArchived: boolean) => {
		try {
			// Use initialAssignment to avoid saving changes the user made, but hasn't explicitly saved yet
			const archivedAssigment: Partial<Avo.Assignment.Assignment> = {
				...initialAssignment,
				is_archived: shouldBeArchived,
			};
			setInitialAssignment(archivedAssigment);

			// Also set the currentAssignment to archived, so if the user saves, the assignment will stay archived
			setCurrentAssignment({
				...currentAssignment,
				is_archived: shouldBeArchived,
			});
			if (await updateAssignment(triggerAssignmentUpdate, archivedAssigment)) {
				toastService(
					`De opdracht is ge${shouldBeArchived ? '' : 'de'}archiveerd`,
					TOAST_TYPE.SUCCESS
				);
			}
			// else: assignment was not valid and could not be saved yet
		} catch (err) {
			console.error(err);
			toastService(
				`Het ${shouldBeArchived ? '' : 'de'}archiveren van de opdracht is mislukt`,
				TOAST_TYPE.DANGER
			);
		}
	};

	const duplicateAssignment = async (newTitle: string) => {
		try {
			const duplicateAssignment = cloneDeep(initialAssignment);
			delete duplicateAssignment.id;
			duplicateAssignment.title = newTitle;
			const assigment = await insertAssignment(triggerAssignmentInsert, duplicateAssignment);
			if (!assigment) {
				return; // assignment was not valid
			}
			history.push(
				`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${assigment.id}/${RouteParts.Edit}`
			);
			toastService(
				'De opdracht is succesvol gedupliceerd. U kijk nu naar het duplicaat',
				TOAST_TYPE.SUCCESS
			);
		} catch (err) {
			console.error(err);
			toastService('Het dupliceren van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const handleExtraOptionClicked = async (itemId: 'duplicate' | 'archive' | 'delete') => {
		switch (itemId) {
			case 'duplicate':
				setDuplicateModalOpen(true);
				setExtraOptionsMenuOpen(false);
				break;

			case 'archive':
				archiveAssignment(!initialAssignment.is_archived).then(() => {});
				setExtraOptionsMenuOpen(false);
				break;

			case 'delete':
				setDeleteModalOpen(true);
				setExtraOptionsMenuOpen(false);
				break;
			default:
				return null;
		}
	};

	const setAssignmentProp = (property: keyof Avo.Assignment.Assignment, value: any) => {
		const newAssignment = {
			...currentAssignment,
			[property]: value,
		};
		setCurrentAssignment(newAssignment);
	};

	const trackAddObjectToAssignment = (assignment: Avo.Assignment.Assignment) => {
		if (!assignment.content_label || !assignment.content_id) {
			return;
		}
		trackEvents({
			event_object: {
				type: CONTENT_LABEL_TO_EVENT_OBJECT_TYPE[assignment.content_label],
				identifier: assignment.content_id,
			},
			event_message: `User ${getProfileName()} heeft ${
				CONTENT_LABEL_TO_EVENT_OBJECT_TYPE[assignment.content_label]
			} ${assignment.content_id} toegevoegd aan opdracht ${assignment.id}`,
			name: 'view',
			category: 'item',
		});
	};

	const saveAssignment = async (assignment: Partial<Avo.Assignment.Assignment>) => {
		try {
			setIsSaving(true);
			if (pageType === 'create') {
				// create => insert into graphql
				const newAssignment: Avo.Assignment.Assignment = {
					...assignment,
					owner_profile_id: get(loginState, 'userInfo.profile.id'),
				} as Avo.Assignment.Assignment;
				const insertedAssignment = await insertAssignment(triggerAssignmentInsert, newAssignment);

				if (insertedAssignment) {
					setBothAssignments(insertedAssignment);
					trackAddObjectToAssignment(insertedAssignment);
					toastService('De opdracht is succesvol aangemaakt', TOAST_TYPE.SUCCESS);
					history.push(
						`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${insertedAssignment.id}/${
							RouteParts.Edit
						}`
					);
				}
			} else {
				// edit => update graphql
				const updatedAssignment = await updateAssignment(triggerAssignmentUpdate, assignment);

				if (updatedAssignment) {
					setBothAssignments(assignment);
					toastService('De opdracht is succesvol geupdate', TOAST_TYPE.SUCCESS);
				}
			}
			setIsSaving(false);
		} catch (err) {
			console.error(err);
			toastService('Het opslaan van de opdracht is mislukt', TOAST_TYPE.DANGER);
			setIsSaving(false);
		}
	};

	const getTagOptions = (): TagOption[] => {
		return get(currentAssignment, 'assignment_assignment_tags.assignment_tag', []).map(
			(assignmentTag: Avo.Assignment.Tag) => {
				return {
					label: assignmentTag.label,
					id: assignmentTag.id,
					// assignmentTag.enum_color.label contains hex code (graphql enum quirk)
					// The value of the enum has to be uppercase text, so the value contains the color name
					color: assignmentTag.color_override || assignmentTag.enum_color.label,
				};
			}
		);
	};

	const removeTag = (tagId: string | number, evt: MouseEvent) => {
		evt.stopPropagation();
		const tags: Avo.Assignment.Tag[] = [
			...get(currentAssignment, 'assignment_assignment_tags.assignment_tag', []),
		];
		remove(tags, (tag: Avo.Assignment.Tag) => tag.id === tagId);
		setCurrentAssignment({
			...currentAssignment,
			assignment_assignment_tags: {
				assignment_tag: tags,
			},
		});
	};

	const renderTagsDropdown = () => {
		const tags = getTagOptions();

		return (
			<Dropdown
				isOpen={tagsDropdownOpen}
				menuWidth="fit-content"
				onOpen={() => setTagsDropdownOpen(true)}
				onClose={() => setTagsDropdownOpen(false)}
			>
				<DropdownButton>
					{renderDropdownButton(tags.length ? '' : 'Geen', false, tags, removeTag)}
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							<Button type="borderless" block label="Geen" />
							<Button type="borderless" block label="Beheer vakken en projecten" />
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		);
	};

	const renderAssignmentEditForm = () => (
		<>
			<Navbar autoHeight>
				<Container mode="vertical" background="alt">
					<Container mode="horizontal">
						<Toolbar autoHeight className="c-toolbar--drop-columns-low-mq">
							<ToolbarLeft>
								<ToolbarItem grow>
									<Link
										className="c-return"
										to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}`}
									>
										<Icon name="chevron-left" size="small" type="arrows" />
										Mijn opdrachten
									</Link>
									<h2 className="c-h2 u-m-0">
										{pageType === 'create' ? 'Nieuwe opdracht' : currentAssignment.title}
									</h2>
									{currentAssignment.id && (
										<Spacer margin="top-small">
											<Form type="inline">
												<FormGroup label="URL">
													<TextInput value={getAssignmentUrl()} disabled />
												</FormGroup>
												<Spacer margin="left-small">
													<Button
														icon="copy"
														type="secondary"
														ariaLabel="Kopieer de opdracht url"
														onClick={copyAssignmentUrl}
													/>
												</Spacer>
											</Form>
										</Spacer>
									)}
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										{pageType === 'create' && (
											<Button type="secondary" onClick={() => history.goBack()} label="Annuleren" />
										)}
										{pageType === 'edit' && (
											<Spacer margin="right-small">
												<Button
													type="secondary"
													onClick={viewAsStudent}
													label="Bekijk als leerling"
												/>
												<Dropdown
													isOpen={isExtraOptionsMenuOpen}
													menuWidth="fit-content"
													onOpen={() => setExtraOptionsMenuOpen(true)}
													onClose={() => setExtraOptionsMenuOpen(false)}
													placement="bottom-end"
												>
													<DropdownButton>
														<Button
															type="secondary"
															icon="more-horizontal"
															ariaLabel="Meer opties"
															title="Meer opties"
														/>
													</DropdownButton>
													<DropdownContent>
														<MenuContent
															menuItems={[
																{ icon: 'copy', id: 'duplicate', label: 'Dupliceer' },
																{
																	icon: 'archive',
																	id: 'archive',
																	label: initialAssignment.is_archived
																		? 'Dearchiveer'
																		: 'Archiveer',
																},
																{ icon: 'delete', id: 'delete', label: 'Verwijder' },
															]}
															onClick={id => handleExtraOptionClicked(id.toString() as any)}
														/>
													</DropdownContent>
												</Dropdown>
											</Spacer>
										)}
										<Button
											type="primary"
											label="Opslaan"
											onClick={() => saveAssignment(currentAssignment)}
											disabled={isSaving}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
			</Navbar>
			<Container mode="horizontal" size="small">
				<Container mode="vertical" size="large">
					<Form>
						<FormGroup required label="Titel">
							<TextInput
								id="title"
								value={currentAssignment.title}
								onChange={title => setAssignmentProp('title', title)}
							/>
						</FormGroup>
						<FormGroup label="Opdracht" required>
							<WYSIWYG
								id="assignmentDescription"
								autogrow
								data={currentAssignment.description}
								onChange={description => setAssignmentProp('description', description)}
							/>
						</FormGroup>
						{assignmentContent && currentAssignment.content_label && (
							<FormGroup label="Inhoud">
								<Link
									to={`/${
										CONTENT_LABEL_TO_ROUTE_PARTS[
											currentAssignment.content_label as Avo.Assignment.ContentLabel
										]
									}/${currentAssignment.content_id}`}
								>
									<div className="c-box c-box--padding-small">
										<Flex orientation="vertical" center>
											<Spacer margin="right">
												<Thumbnail
													className="m-content-thumbnail"
													category={
														dutchContentLabelToEnglishLabel((currentAssignment.content_label ===
														'ITEM'
															? assignmentContent.type.label
															: currentAssignment.content_label) as DutchContentType) as ContentType
													}
													src={assignmentContent.thumbnail_path || undefined}
												/>
											</Spacer>
											<FlexItem>
												<div className="c-overline-plus-p">
													<p className="c-overline">
														{currentAssignment.content_label === 'ITEM'
															? assignmentContent.type.label
															: currentAssignment.content_label}
													</p>
													<p>{assignmentContent.title || assignmentContent.description}</p>
												</div>
											</FlexItem>
										</Flex>
									</div>
								</Link>
							</FormGroup>
						)}
						<FormGroup label="Weergave" labelFor="only_player">
							<RadioButtonGroup>
								<RadioButton
									label="mediaspeler met beschrijving"
									name="content_layout"
									value={String(AssignmentLayout.PlayerAndText)}
									checked={currentAssignment.content_layout === AssignmentLayout.PlayerAndText}
									onChange={isChecked =>
										isChecked && setAssignmentProp('content_layout', AssignmentLayout.PlayerAndText)
									}
								/>
								<RadioButton
									label="enkel mediaspeler"
									name="content_layout"
									value={String(AssignmentLayout.OnlyPlayer)}
									checked={currentAssignment.content_layout === AssignmentLayout.OnlyPlayer}
									onChange={isChecked =>
										isChecked && setAssignmentProp('content_layout', AssignmentLayout.OnlyPlayer)
									}
								/>
							</RadioButtonGroup>
						</FormGroup>
						<FormGroup label="Vak of project">{renderTagsDropdown()}</FormGroup>
						<FormGroup label="Antwoorden op" labelFor="answer_url">
							<TextInput
								id="answer_url"
								type="text"
								placeholder="http://..."
								value={currentAssignment.answer_url || ''}
								onChange={value => setAssignmentProp('answer_url', value)}
							/>
							<p className="c-form-help-text">
								Waar geeft de leerling de antwoorden in? Voeg een optionele URL naar een ander
								platform toe.
							</p>
						</FormGroup>
						<FormGroup label="Beschikbaar vanaf">
							<Flex>
								<DateTimePicker
									value={
										currentAssignment.available_at ? new Date(currentAssignment.available_at) : null
									}
									onChange={(value: Date | null) =>
										setAssignmentProp('available_at', value ? value.toISOString() : null)
									}
									id="available_at"
									defaultHours={0}
									defaultMinutes={0}
								/>
							</Flex>
						</FormGroup>
						<FormGroup label="Deadline" required>
							<Flex>
								<Spacer margin="right-small">
									<DateTimePicker
										value={
											currentAssignment.deadline_at ? new Date(currentAssignment.deadline_at) : null
										}
										onChange={value => setAssignmentProp('deadline_at', value)}
										id="deadline_at"
										defaultHours={23}
										defaultMinutes={59}
									/>
								</Spacer>
							</Flex>
							<p className="c-form-help-text">
								Na deze datum kan de leerling de opdracht niet meer invullen.
							</p>
						</FormGroup>
						{currentAssignment.assignment_type === 'BOUW' && (
							<FormGroup label="Groepswerk?" labelFor="only_player">
								<Toggle
									checked={currentAssignment.is_collaborative}
									onChange={checked => setAssignmentProp('is_collaborative', checked)}
								/>
							</FormGroup>
						)}
						<hr className="c-hr" />
						<Alert type="info">
							<div className="c-content c-content--no-m">
								<p>
									Hulp nodig bij het maken van opdrachten?
									<br />
									Bekijk onze{' '}
									<a href="http://google.com" target="_blank" rel="noopener noreferrer">
										screencast
									</a>
									.
								</p>
							</div>
						</Alert>
					</Form>
				</Container>
			</Container>

			<DeleteObjectModal
				title={`Ben je zeker dat de opdracht "${currentAssignment.title}" wil verwijderen?`}
				body="Deze actie kan niet ongedaan gemaakt worden"
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				deleteObjectCallback={deleteCurrentAssignment}
			/>

			<InputModal
				title="Dupliceer taak"
				inputLabel="Geef de nieuwe taak een naam:"
				inputValue={currentAssignment.title}
				inputPlaceholder="Titel van de nieuwe taak"
				isOpen={isDuplicateModalOpen}
				onClose={() => setDuplicateModalOpen(false)}
				inputCallback={(newTitle: string) => duplicateAssignment(newTitle)}
			/>
		</>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingState={loadingState}
			dataObject={currentAssignment}
			render={renderAssignmentEditForm}
			loadingError={loadingError && loadingError.error}
			loadingErrorIcon={loadingError && loadingError.icon}
			notFoundError="De opdracht is niet gevonden"
		/>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(AssignmentEdit));
