import { ExecutionResult } from '@apollo/react-common';
import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-boost';
import { DocumentNode } from 'graphql';
import { cloneDeep, get, remove } from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment, FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Alert,
	Button,
	Container,
	DatePicker,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Icon,
	MenuContent,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	Spinner,
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

import NotFound from '../../404/views/NotFound';
import { GET_COLLECTION_BY_ID } from '../../collection/graphql';
import {
	ContentTypeString,
	dutchContentLabelToEnglishLabel,
	DutchContentType,
} from '../../collection/types';
import { RouteParts } from '../../constants';
import { GET_ITEM_BY_ID } from '../../item/item.gql';
import { renderDropdownButton } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { generateContentLinkString } from '../../shared/helpers/generateLink';
import { dataService } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import {
	DELETE_ASSIGNMENT,
	GET_ASSIGNMENT_BY_ID,
	INSERT_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
} from '../graphql';
import {
	Assignment,
	AssignmentContent,
	AssignmentContentLabel,
	AssignmentLayout,
	AssignmentTag,
	AssignmentType,
} from '../types';
import './EditAssignment.scss';

const CONTENT_LABEL_TO_ROUTE_PARTS: { [contentType in AssignmentContentLabel]: string } = {
	ITEM: RouteParts.Item,
	COLLECTIE: RouteParts.Collection,
	ZOEKOPDRACHT: RouteParts.SearchQuery,
};

const CONTENT_LABEL_TO_QUERY: {
	[contentType in AssignmentContentLabel]: { query: DocumentNode; resultPath: string }
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

interface EditAssignmentProps extends RouteComponentProps {}

// https://medium.com/@divyabiyani26/react-hooks-with-closures-usestate-v-s-usereducer-9e0c20e81051
let currentAssignment: Partial<Assignment>;
let setCurrentAssignment: (newAssignment: any) => void;
let initialAssignment: Partial<Assignment>;
let setInitialAssignment: (newAssignment: any) => void;

const EditAssignment: FunctionComponent<EditAssignmentProps> = ({ history, location, match }) => {
	[currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
		content_layout: AssignmentLayout.PlayerAndText,
	});
	[initialAssignment, setInitialAssignment] = useState<Partial<Assignment>>({
		content_layout: AssignmentLayout.PlayerAndText,
	});
	const [pageType, setPageType] = useState<'create' | 'edit' | undefined>();
	const [assignmentContent, setAssignmentContent] = useState<AssignmentContent | undefined>(
		undefined
	);
	const [loadingState, setLoadingState] = useState<'loaded' | 'loading' | 'not-found'>('loading');
	const [tagsDropdownOpen, setTagsDropdownOpen] = useState<boolean>(false);
	const [isExtraOptionsMenuOpen, setExtraOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerAssignmentUpdate] = useMutation(UPDATE_ASSIGNMENT);
	const [triggerAssignmentDelete] = useMutation(DELETE_ASSIGNMENT);

	const setBothAssignments = (assignment: Partial<Assignment>) => {
		setCurrentAssignment(assignment);
		setInitialAssignment(assignment);
	};

	/**
	 * Get query string variables and store them into the assignment state object
	 */
	useEffect(() => {
		// Determine if this is an edit or create page
		if (location.pathname.includes(RouteParts.Create)) {
			setPageType('create');

			// Get assignment_type, content_id and content_label from query params
			const queryParams = queryString.parse(location.search);
			let newAssignment: Partial<Assignment> | undefined;
			if (typeof queryParams.assignment_type === 'string') {
				newAssignment = {
					assignment_type: queryParams.assignment_type as AssignmentType,
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
					content_label: queryParams.content_label as AssignmentContentLabel,
				};
			}

			setBothAssignments({
				...(currentAssignment || {}),
				...newAssignment,
			});
		} else {
			setPageType('edit');

			// Get the assigment from graphql
			dataService
				.query({
					query: GET_ASSIGNMENT_BY_ID,
					variables: { id: (match.params as any).id },
				})
				.then((response: ApolloQueryResult<AssignmentContent>) => {
					const assignmentResponse: Assignment | undefined = get(
						response,
						'data.app_assignments[0]'
					);
					if (!assignmentResponse) {
						toastService(
							'Het ophalen van de opdracht inhoud is mislukt (leeg antwoord)',
							TOAST_TYPE.DANGER
						);
						setLoadingState('not-found');
						return;
					}
					setBothAssignments(assignmentResponse);
					setLoadingState('loaded');
				})
				.catch((err: any) => {
					console.error(err);
					toastService('Het ophalen van de opdracht inhoud is mislukt', TOAST_TYPE.DANGER);
					setLoadingState('not-found');
				});
		}
	}, [setCurrentAssignment, setInitialAssignment, location]);

	/**
	 * Load the content if the query params change
	 */
	useEffect(() => {
		if (currentAssignment.assignment_type) {
			if (currentAssignment.content_id && currentAssignment.content_label) {
				dataService
					.query({
						query: CONTENT_LABEL_TO_QUERY[currentAssignment.content_label].query,
						variables: { id: currentAssignment.content_id },
					})
					.then((response: ApolloQueryResult<AssignmentContent>) => {
						const assignmentContent = get(
							response,
							`data.${
								CONTENT_LABEL_TO_QUERY[currentAssignment.content_label as AssignmentContentLabel]
									.resultPath
							}`
						);
						if (!assignmentContent) {
							toastService(
								'Het ophalen van de opdracht inhoud is mislukt (leeg antwoord)',
								TOAST_TYPE.DANGER
							);
							setLoadingState('not-found');
							return;
						}
						setAssignmentContent(assignmentContent);
						setBothAssignments({
							...currentAssignment,
							title:
								currentAssignment.title || (assignmentContent && assignmentContent.title) || '',
						});
						setLoadingState('loaded');
					})
					.catch((err: any) => {
						console.error(err);
						toastService('Het ophalen van de opdracht inhoud is mislukt', TOAST_TYPE.DANGER);
						setLoadingState('not-found');
					});
			} else {
				setLoadingState('loaded');
			}
		}
	}, [
		currentAssignment.content_label,
		currentAssignment.assignment_type,
		currentAssignment.content_id,
	]);

	const deleteAssignment = async () => {
		try {
			await triggerAssignmentDelete({
				variables: {
					id: currentAssignment.id,
				},
			});
			history.push(`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}`);
			toastService('De opdracht is verwijdert', TOAST_TYPE.SUCCESS);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const getAssignmentUrl = () => {
		return `${window.location.origin}/${RouteParts.Assignment}/${currentAssignment.id}`;
	};

	const copyAssignmentUrl = () => {
		copyToClipboard(getAssignmentUrl());
		toastService('De url is naar het klembord gekopieert', TOAST_TYPE.SUCCESS);
	};

	const viewAsStudent = () => {
		window.open(getAssignmentUrl(), '_blank');
	};

	const archiveAssignment = async () => {
		try {
			// Use initialAssignment to avoid saving changes the user made, but hasn't explicitly saved yet
			const archivedAssigment: Partial<Assignment> = {
				...initialAssignment,
				is_archived: true,
			};
			setInitialAssignment(archivedAssigment);

			// Also set the currentAssignment to archived, so if the user saves, the assignment will stay archived
			setCurrentAssignment({
				...currentAssignment,
				is_archived: true,
			});
			if (await updateAssignment(archivedAssigment)) {
				toastService('De opdracht is gearchiveerd');
			}
			// else: assignment was not valid and could not be saved yet
		} catch (err) {
			console.error(err);
			toastService('Het archiveren van de opdracht is mislukt');
		}
	};

	const duplicateAssignment = async () => {
		try {
			const duplicateAssignment = cloneDeep(initialAssignment);
			delete duplicateAssignment.id;
			const assigment = await insertAssignment(duplicateAssignment);
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
			toastService('Het dupliceren van de opdracht is mislukt');
		}
	};

	const handleExtraOptionClicked = async (itemId: 'duplicate' | 'archive' | 'delete') => {
		switch (itemId) {
			case 'duplicate':
				duplicateAssignment().then(() => {});
				break;

			case 'archive':
				archiveAssignment().then(() => {});
				break;

			case 'delete':
				setDeleteModalOpen(true);
				break;
			default:
				return null;
		}
	};

	const setAssignmentProp = (property: keyof Assignment, value: any) => {
		const newAssignment = {
			...currentAssignment,
			[property]: value,
		};
		setCurrentAssignment(newAssignment);
	};

	const validateAssignment = (assignment: Partial<Assignment>): [string[], Assignment] => {
		const assignmentToSave = cloneDeep(assignment);
		const errors = [];
		if (!assignmentToSave.title) {
			errors.push('Een titel is verplicht');
		}
		if (!assignmentToSave.description) {
			errors.push('Een beschrijving is verplicht');
		}
		assignmentToSave.content_layout =
			assignmentToSave.content_layout || AssignmentLayout.PlayerAndText;
		if (assignmentToSave.answer_url && /^(https?:)?\/\//.test(assignmentToSave.answer_url)) {
			assignmentToSave.answer_url = `//${assignmentToSave.answer_url}`;
		}
		if (!assignmentToSave.deadline_at) {
			errors.push('Een deadline is verplicht');
		}

		assignmentToSave.owner_uid =
			assignmentToSave.owner_uid || '54859c98-d5d3-1038-8d91-6dfda901a78e';
		assignmentToSave.is_archived = assignmentToSave.is_archived || false;
		assignmentToSave.is_deleted = assignmentToSave.is_deleted || false;
		assignmentToSave.is_collaborative = assignmentToSave.is_collaborative || false;
		delete assignmentToSave.assignment_responses; // = assignmentToSave.assignment_responses || [];
		delete assignmentToSave.assignment_assignment_tags; // = assignmentToSave.assignment_assignment_tags || {
		// 	assignment_tag: [],
		// };
		delete (assignmentToSave as any).__typename;
		return [errors, assignmentToSave as Assignment];
	};

	const insertAssignment = async (assignment: Partial<Assignment>) => {
		try {
			const [validationErrors, assignmentToSave] = validateAssignment({ ...assignment });
			if (validationErrors.length) {
				toastService(validationErrors.join('<br/>'), TOAST_TYPE.DANGER);
				return;
			}
			const response: void | ExecutionResult<Assignment> = await triggerAssignmentInsert({
				variables: {
					assignment: assignmentToSave,
				},
			});
			const id = get(response, 'data.insert_app_assignments.returning[0].id');
			if (typeof id !== undefined) {
				return {
					...assignment, // Do not copy the auto modified fields from the validation back into the input controls
					id,
				};
			} else {
				console.error('assignment insert returned empty response', response);
				throw 'Het opslaan van de opdracht is mislukt';
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
	};

	const updateAssignment = async (assignment: Partial<Assignment>) => {
		try {
			const [validationErrors, assignmentToSave] = validateAssignment({ ...assignment });
			if (validationErrors.length) {
				toastService(validationErrors.join('<br/>'), TOAST_TYPE.DANGER);
				return;
			}
			const response: void | ExecutionResult<Assignment> = await triggerAssignmentUpdate({
				variables: {
					id: assignment.id,
					assignment: assignmentToSave,
				},
			});
			if (!response || !response.data) {
				console.error('assignment update returned empty response', response);
				throw new Error('Het opslaan van de opdracht is mislukt');
			} else {
				return assignment;
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
	};

	const saveAssignment = async (assignment: Partial<Assignment>) => {
		try {
			if (pageType === 'create') {
				// create => insert into graphql
				await insertAssignment(assignment);
				setBothAssignments(assignment);
				toastService('De opdracht is succesvol aangemaakt', TOAST_TYPE.SUCCESS);
			} else {
				// edit => update graphql
				await updateAssignment(assignment);
				setBothAssignments(assignment);
				toastService('De opdracht is succesvol geupdate', TOAST_TYPE.SUCCESS);
			}
		} catch (err) {
			console.error(err);
			toastService('Het opslaan van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const getTagOptions = (): TagOption[] => {
		return get(currentAssignment, 'assignment_assignment_tags.assignment_tag', []).map(
			(assignmentTag: AssignmentTag) => {
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
		const tags: AssignmentTag[] = [
			...get(currentAssignment, 'assignment_assignment_tags.assignment_tag', []),
		];
		remove(tags, (tag: AssignmentTag) => tag.id === tagId);
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
				onOpen={() => setTagsDropdownOpen(true)}
				onClose={() => setTagsDropdownOpen(false)}
				autoSize={true}
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

	const renderEditAssignmentForm = () => (
		<Fragment>
			<Container mode="vertical" background={'alt'}>
				<nav className="c-navbar c-navbar--auto">
					<Container mode="horizontal">
						<Toolbar autoHeight className="c-toolbar--drop-columns-low-mq">
							<ToolbarLeft>
								<ToolbarItem className="c-toolbar__item--grow">
									{/* TODO use grow option from component */}
									<Link
										className="c-return"
										to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}`}
									>
										<Icon name="chevron-left" size="small" type="arrows" />
										Mijn opdrachten
									</Link>
									<h2 className="c-h2 u-m-0">Nieuwe opdracht</h2>
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
									<div className="c-button-toolbar">
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
												<ControlledDropdown
													isOpen={isExtraOptionsMenuOpen}
													onOpen={() => setExtraOptionsMenuOpen(true)}
													onClose={() => setExtraOptionsMenuOpen(false)}
													placement="bottom-end"
													autoSize
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
																{ icon: 'archive', id: 'archive', label: 'Archiveer' },
																{ icon: 'delete', id: 'delete', label: 'Verwijder' },
															]}
															onClick={id => handleExtraOptionClicked(id.toString() as any)}
														/>
													</DropdownContent>
												</ControlledDropdown>
											</Spacer>
										)}
										<Button
											type="primary"
											label="Opslaan"
											onClick={() => saveAssignment(currentAssignment)}
										/>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</nav>
			</Container>
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
									to={`/${CONTENT_LABEL_TO_ROUTE_PARTS[currentAssignment.content_label]}/${
										currentAssignment.content_id
									}`}
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
												{/*TODO use stills api to get thumbnail*/}
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
									label="Weergeven als mediaspeler met tekst"
									name="content_layout"
									value={String(AssignmentLayout.PlayerAndText)}
									checked={currentAssignment.content_layout === AssignmentLayout.PlayerAndText}
									onChange={isChecked =>
										isChecked && setAssignmentProp('content_layout', AssignmentLayout.PlayerAndText)
									}
								/>
								<RadioButton
									label="Weergeven als enkel mediaspeler"
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
								{/*TODO Replace with DateTimePicker from components*/}
								<DatePicker
									value={
										currentAssignment.available_at ? new Date(currentAssignment.available_at) : null
									}
									onChange={(value: Date | null) =>
										setAssignmentProp('available_at', value ? value.toISOString() : null)
									}
									id="available_at"
								/>
							</Flex>
						</FormGroup>
						<FormGroup label="Deadline" required>
							<Flex>
								<Spacer margin="right-small">
									{/*TODO Replace with DateTimePicker from components*/}
									<DatePicker
										value={
											currentAssignment.deadline_at ? new Date(currentAssignment.deadline_at) : null
										}
										onChange={value => setAssignmentProp('deadline_at', value)}
										id="deadline_at"
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
									Bekijk onze <a href="#">screencast</a>.
								</p>
							</div>
						</Alert>
					</Form>
				</Container>
			</Container>

			<DeleteObjectModal
				title={`Ben je zeker dat de opdracht \"${currentAssignment.title}\" wil verwijderen?`}
				body="Deze actie kan niet ongedaan gemaakt worden"
				isOpen={isDeleteModalOpen}
				setIsOpen={setDeleteModalOpen}
				deleteObjectCallback={deleteAssignment}
			/>
		</Fragment>
	);

	switch (loadingState) {
		case 'loading':
			return (
				<Flex center orientation="horizontal">
					<Spinner size="large" />
				</Flex>
			);

		case 'loaded':
			return renderEditAssignmentForm();

		case 'not-found':
			return <NotFound message="De inhoud voor deze opdracht is niet gevonden" icon="search" />;
	}
};

export default withRouter(EditAssignment);
