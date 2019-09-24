import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
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
	Menu,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentType } from '@viaa/avo2-components/dist/types';
import { DocumentNode } from 'graphql';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { GET_COLLECTION_BY_ID } from '../../collection/graphql';
import { dutchContentLabelToEnglishLabel } from '../../collection/types';
import { RouteParts } from '../../constants';
import { GET_ITEM_BY_ID } from '../../item/item.gql';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { Assignment, AssignmentContentType, AssignmentLayout } from '../types';

interface EditAssignmentProps extends RouteComponentProps {}

const EditAssignment: FunctionComponent<EditAssignmentProps> = ({ history, location }) => {
	const [assignment, setAssignment] = useState<Partial<Assignment>>({});
	const [contentId, setContentId] = useState<string>();
	const [pageType, setPageType] = useState<'create' | 'edit' | undefined>();
	const [contentType, setContentType] = useState<AssignmentContentType | undefined>();
	const [tagsDropdownOpen, setTagsDropdownOpen] = useState<boolean>(false);

	useEffect(() => {
		const queryParams = queryString.parse(location.search);
		if (typeof queryParams.content_id === 'string') {
			setContentId(queryParams.content_id);
		}
		if (typeof queryParams.content_type === 'string') {
			setContentType(queryParams.content_type as AssignmentContentType);
		}
		console.log('location object: ', location);
		if (location.pathname.includes(RouteParts.Create)) {
			setPageType('create');
		} else {
			setPageType('edit');
		}
	});

	const setAssignmentProp = (property: keyof Assignment, value: any) => {
		setAssignment({
			...assignment,
			[property]: value,
		});
	};

	const saveAssignment = () => {
		if (pageType === 'create') {
			// create => insert into graphql
		} else {
			// edit => update graphql
		}
	};

	const CONTENT_TYPE_TO_ROUTE_PARTS: { [contentType in AssignmentContentType]: string } = {
		audio: RouteParts.Item,
		video: RouteParts.Item,
		collectie: RouteParts.Collection,
		zoek: RouteParts.SearchQuery,
	};

	const renderEditAssignmentForm = (contentObject: Avo.Collection.Response | Avo.Item.Response) => (
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
										<Button type="secondary" onClick={() => history.goBack()} label="Annuleren" />
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
						<div className="o-form-group-layout o-form-group-layout--standard">
							<FormGroup>
								<label className="o-form-group__label" htmlFor="assignmentTitle">
									Titel
									<abbr className="required" title="Verplicht veld">
										*
									</abbr>
								</label>
								<div className="o-form-group__controls">
									<TextInput
										id="title"
										value={assignment.title}
										onChange={title => setAssignmentProp('title', title)}
									/>
								</div>
							</FormGroup>
							<FormGroup>
								<label className="o-form-group__label" htmlFor="assignmentDescription">
									Opdracht
									<abbr className="required" title="Verplicht veld">
										*
									</abbr>
								</label>
								<div className="o-form-group__controls">
									<WYSIWYG
										id="assignmentDescription"
										autogrow
										data={assignment.description}
										onChange={description => setAssignmentProp('description', description)}
									/>
								</div>
							</FormGroup>
							{contentType && (
								<Link to={`/${CONTENT_TYPE_TO_ROUTE_PARTS[contentType]}/${assignment.content_id}`}>
									<FormGroup>
										<label className="o-form-group__label">Inhoud</label>
										<div className="c-box c-box--padding-small">
											<Flex orientation="vertical" center>
												<Spacer margin="right">
													<Thumbnail
														category={dutchContentLabelToEnglishLabel(contentType) as ContentType}
														src={contentObject.thumbnail_path || undefined}
													/>
													{/*TODO use stills api to get thumbnail*/}
												</Spacer>
												<FlexItem>
													<div className="c-overline-plus-p">
														<p className="c-overline">{assignment.content_label}</p>
														<p>{contentObject.title || contentObject.description}</p>
													</div>
												</FlexItem>
											</Flex>
										</div>
									</FormGroup>
								</Link>
							)}
							<FormGroup label="Weergave" labelFor="only_player">
								<RadioButtonGroup>
									<RadioButton
										label="Weergeven als enkel mediaspeler"
										name="only_player"
										value="only_player"
										onChange={isChecked =>
											isChecked && setAssignmentProp('content_layout', AssignmentLayout.OnlyPlayer)
										}
									/>
									<RadioButton
										label="Weergeven als mediaspeler + tekst"
										name="player_and_text"
										value="player_and_text"
										onChange={isChecked =>
											isChecked &&
											setAssignmentProp('content_layout', AssignmentLayout.PlayerAndText)
										}
									/>
								</RadioButtonGroup>
							</FormGroup>
							<FormGroup label="Vak of project">
								<Dropdown
									isOpen={tagsDropdownOpen}
									onOpen={() => setTagsDropdownOpen(true)}
									onClose={() => setTagsDropdownOpen(false)}
								>
									<DropdownButton>
										<Fragment>Tags</Fragment>
									</DropdownButton>
									<DropdownContent>
										<Menu
											menuItems={[
												{ id: 'geen', label: 'geen' },
												{ id: 'manage_options', label: 'options' },
											]}
										/>
									</DropdownContent>
								</Dropdown>
							</FormGroup>
							<FormGroup label="Antwoorden op" labelFor="answer_url">
								<TextInput id="answer_url" type="text" placeholder="http://..." />
								<label className="o-form-group__label" htmlFor="assignmentAvailableFromDate">
									Antwoorden op
								</label>
								<div className="o-form-group__controls">
									<input className="c-input" type="text" placeholder="http://..." />
									<p className="c-form-help-text">
										Waar geeft de leerling de antwoorden in? Voeg een optionele URL naar een ander
										platform toe.
									</p>
								</div>
							</FormGroup>
							<FormGroup>
								<label className="o-form-group__label" htmlFor="assignmentAvailableFromDate">
									Beschikbaar vanaf
								</label>
								<div className="o-form-group__controls">
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
								</div>
							</FormGroup>
							<FormGroup label="Deadline">
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
							{/*<hr className="c-hr" />*/}
							{/*TODO convert to Alert once Alert supports custom content*/}
							{/*<div className="c-alert c-alert--info">*/}
							{/*	<div className="c-alert__body">*/}
							{/*		<div className="u-spacer-right-s">*/}
							{/*			<Icon name="circle-info" type="multicolor" size="small" />*/}
							{/*		</div>*/}
							{/*		<div className="c-content c-content--no-m">*/}
							{/*			<p />*/}
							{/*		</div>*/}
							{/*	</div>*/}
							{/*</div>*/}
						</div>
					</Form>
				</Container>
			</Container>
		</Fragment>
	);

	const CONTENT_TYPE_TO_QUERY: {
		[contentType: string]: { query: DocumentNode; resultPath: string };
	} = {
		collection: {
			query: GET_COLLECTION_BY_ID,
			resultPath: 'app_collections[0]',
		},
		audio: {
			query: GET_ITEM_BY_ID,
			resultPath: 'app_item_meta[0]',
		},
		video: {
			query: GET_ITEM_BY_ID,
			resultPath: 'app_item_meta[0]',
		},
	};

	return !!contentType ? (
		<DataQueryComponent
			query={CONTENT_TYPE_TO_QUERY[contentType].query}
			variables={{ id: contentId }}
			resultPath={CONTENT_TYPE_TO_QUERY[contentType].resultPath}
			renderData={renderEditAssignmentForm}
			ignoreNotFound={!contentId}
			showSpinner
		/>
	) : null;
};

export default withRouter(EditAssignment);
