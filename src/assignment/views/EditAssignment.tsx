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
import { dutchContentLabelToEnglishLabel, DutchContentType } from '../../collection/types';
import { RouteParts } from '../../constants';
import { GET_ITEM_BY_ID } from '../../item/item.gql';
import { renderDropdownButton } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { dataService } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { GET_ASSIGNMENT_BY_ID, INSERT_ASSIGNMENT, UPDATE_ASSIGNMENT } from '../graphql';
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
let assignment: Partial<Assignment>;
let setAssignment: (newAssignment: any) => void;

const EditAssignment: FunctionComponent<EditAssignmentProps> = ({ history, location, match }) => {
	[assignment, setAssignment] = useState<Partial<Assignment>>({
		content_layout: AssignmentLayout.PlayerAndText,
	});
	const [pageType, setPageType] = useState<'create' | 'edit' | undefined>();
	const [assignmentContent, setAssignmentContent] = useState<AssignmentContent | undefined>(
		undefined
	);
	const [loadingState, setLoadingState] = useState<'loaded' | 'loading' | 'not-found'>('loading');
	const [tagsDropdownOpen, setTagsDropdownOpen] = useState<boolean>(false);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerAssignmentUpdate] = useMutation(UPDATE_ASSIGNMENT);

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

			setAssignment({
				...(assignment || {}),
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
					setAssignment(assignmentResponse);
					setLoadingState('loaded');
				})
				.catch((err: any) => {
					console.error(err);
					toastService('Het ophalen van de opdracht inhoud is mislukt', TOAST_TYPE.DANGER);
					setLoadingState('not-found');
				});
		}
	}, [setAssignment, location]);

	/**
	 * Load the content if the query params change
	 */
	useEffect(() => {
		if (assignment.assignment_type) {
			if (assignment.content_id && assignment.content_label) {
				dataService
					.query({
						query: CONTENT_LABEL_TO_QUERY[assignment.content_label].query,
						variables: { id: assignment.content_id },
					})
					.then((response: ApolloQueryResult<AssignmentContent>) => {
						const assignmentContent = get(
							response,
							`data.${
								CONTENT_LABEL_TO_QUERY[assignment.content_label as AssignmentContentLabel]
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
						setAssignment({
							...assignment,
							title: assignment.title || (assignmentContent && assignmentContent.title) || '',
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
	}, [assignment.content_label, assignment.assignment_type, assignment.content_id]);

	const getAssignment = () => {
		return assignment;
	};

	const setAssignmentProp = (property: keyof Assignment, value: any) => {
		const newAssignment = {
			...getAssignment(),
			[property]: value,
		};
		setAssignment(newAssignment);
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

	const saveAssignment = async () => {
		try {
			// Validate assignment before save
			const [validationErrors, assignmentToSave] = validateAssignment({ ...assignment });
			if (validationErrors.length) {
				toastService(validationErrors.join('<br/>'), TOAST_TYPE.DANGER);
				return;
			}
			if (pageType === 'create') {
				// create => insert into graphql
				const response: void | ExecutionResult<Assignment> = await triggerAssignmentInsert({
					variables: {
						assignment: assignmentToSave,
					},
				});
				if (response && response.data) {
					setAssignment({
						...assignment, // Do not copy the auto modified fields from the validation back into the input controls
						id: response.data.id,
					});
					toastService('De opdracht is succesvol aangemaakt', TOAST_TYPE.SUCCESS);
				} else {
					console.error('assignment insert returned empty response', response);
					toastService('Het opslaan van de opdracht is mislukt', TOAST_TYPE.DANGER);
				}
			} else {
				// edit => update graphql
				const response: void | ExecutionResult<Assignment> = await triggerAssignmentUpdate({
					variables: {
						id: assignmentToSave.id,
						assignment: assignmentToSave,
					},
				});
				if (!response || !response.data) {
					console.error('assignment update returned empty response', response);
					toastService('Het opslaan van de opdracht is mislukt', TOAST_TYPE.DANGER);
				} else {
					toastService('De opdracht is succesvol geupdate', TOAST_TYPE.SUCCESS);
				}
			}
		} catch (err) {
			console.error(err);
			toastService('Het opslaan van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const getTagOptions = (): TagOption[] => {
		return get(assignment, 'assignment_assignment_tags.assignment_tag', []).map(
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
			...get(assignment, 'assignment_assignment_tags.assignment_tag', []),
		];
		remove(tags, (tag: AssignmentTag) => tag.id === tagId);
		setAssignment({
			...assignment,
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
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										{pageType === 'create' && (
											<Button type="secondary" onClick={() => history.goBack()} label="Annuleren" />
										)}
										<Button type="primary" label="Opslaan" onClick={saveAssignment} />
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
								value={assignment.title}
								onChange={title => setAssignmentProp('title', title)}
							/>
						</FormGroup>
						<FormGroup label="Opdracht" required>
							<WYSIWYG
								id="assignmentDescription"
								autogrow
								data={assignment.description}
								onChange={description => setAssignmentProp('description', description)}
							/>
						</FormGroup>
						{assignmentContent && assignment.content_label && (
							<FormGroup label="Inhoud">
								<Link
									to={`/${CONTENT_LABEL_TO_ROUTE_PARTS[assignment.content_label]}/${
										assignment.content_id
									}`}
								>
									<div className="c-box c-box--padding-small">
										<Flex orientation="vertical" center>
											<Spacer margin="right">
												<Thumbnail
													className="m-content-thumbnail"
													category={
														dutchContentLabelToEnglishLabel((assignment.content_label === 'ITEM'
															? assignmentContent.type.label
															: assignment.content_label) as DutchContentType) as ContentType
													}
													src={assignmentContent.thumbnail_path || undefined}
												/>
												{/*TODO use stills api to get thumbnail*/}
											</Spacer>
											<FlexItem>
												<div className="c-overline-plus-p">
													<p className="c-overline">
														{assignment.content_label === 'ITEM'
															? assignmentContent.type.label
															: assignment.content_label}
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
									checked={assignment.content_layout === AssignmentLayout.PlayerAndText}
									onChange={isChecked =>
										isChecked && setAssignmentProp('content_layout', AssignmentLayout.PlayerAndText)
									}
								/>
								<RadioButton
									label="Weergeven als enkel mediaspeler"
									name="content_layout"
									value={String(AssignmentLayout.OnlyPlayer)}
									checked={assignment.content_layout === AssignmentLayout.OnlyPlayer}
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
								value={assignment.answer_url || ''}
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
									value={assignment.available_at ? new Date(assignment.available_at) : null}
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
										value={assignment.deadline_at ? new Date(assignment.deadline_at) : null}
										onChange={value => setAssignmentProp('deadline_at', value)}
										id="deadline_at"
									/>
								</Spacer>
							</Flex>
							<p className="c-form-help-text">
								Na deze datum kan de leerling de opdracht niet meer invullen.
							</p>
						</FormGroup>
						{assignment.assignment_type === 'BOUW' && (
							<FormGroup label="Groepswerk?" labelFor="only_player">
								<Toggle
									checked={assignment.is_collaborative}
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
