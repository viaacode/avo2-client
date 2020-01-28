import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-boost';
import { get, isEmpty, remove } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Alert,
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	DatePicker,
	Dropdown,
	DropdownButton,
	DropdownContent,
	DutchContentType,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Icon,
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
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId, getProfileName } from '../../authentication/helpers/get-profile-info';
import { PermissionNames } from '../../authentication/helpers/permission-service';
import { INSERT_COLLECTION, INSERT_COLLECTION_FRAGMENTS } from '../../collection/collection.gql';
import { CollectionService } from '../../collection/collection.service';
import { toEnglishContentType } from '../../collection/collection.types';
import {
	DeleteObjectModal,
	InputModal,
	LoadingErrorLoadedComponent,
} from '../../shared/components';
import { renderDropdownButton } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { ROUTE_PARTS } from '../../shared/constants';
import { buildLink, copyToClipboard, navigate } from '../../shared/helpers';
import { dataService } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import toastService from '../../shared/services/toast-service';
import { ASSIGNMENTS_ID, WORKSPACE_PATH } from '../../workspace/workspace.const';

import {
	checkPermissions,
	LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { ASSIGNMENT_PATH, CONTENT_LABEL_TO_QUERY } from '../assignment.const';
import {
	DELETE_ASSIGNMENT,
	GET_ASSIGNMENT_BY_ID,
	INSERT_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
} from '../assignment.gql';
import {
	deleteAssignment,
	insertAssignment,
	insertDuplicateAssignment,
	updateAssignment,
} from '../assignment.service';
import { AssignmentLayout } from '../assignment.types';
import './AssignmentEdit.scss';

const ASSIGNMENT_COPY = 'Opdracht kopie %index%: ';

const CONTENT_LABEL_TO_ROUTE_PARTS: { [contentType in Avo.Assignment.ContentLabel]: string } = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

const CONTENT_LABEL_TO_EVENT_OBJECT_TYPE: {
	[contentType in Avo.Assignment.ContentLabel]: Avo.EventLogging.ObjectType;
} = {
	ITEM: 'avo_item_pid',
	COLLECTIE: 'collections',
	ZOEKOPDRACHT: 'avo_search_query' as any, // TODO add this object type to the database
};

interface AssignmentEditProps extends DefaultSecureRouteProps<{ id: string }> {}

let currentAssignment: Partial<Avo.Assignment.Assignment>;
let setCurrentAssignment: (newAssignment: Partial<Avo.Assignment.Assignment>) => void;
let initialAssignment: Partial<Avo.Assignment.Assignment>;
let setInitialAssignment: (newAssignment: Partial<Avo.Assignment.Assignment>) => void;

const AssignmentEdit: FunctionComponent<AssignmentEditProps> = ({
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	[currentAssignment, setCurrentAssignment] = useState<Partial<Avo.Assignment.Assignment>>({});
	[initialAssignment, setInitialAssignment] = useState<Partial<Avo.Assignment.Assignment>>({});
	const [pageType, setPageType] = useState<'create' | 'edit' | undefined>();
	const [assignmentContent, setAssignmentContent] = useState<Avo.Assignment.Content | undefined>(
		undefined
	);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tagsDropdownOpen, setTagsDropdownOpen] = useState<boolean>(false);
	const [isExtraOptionsMenuOpen, setExtraOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [isDuplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [triggerAssignmentDelete] = useMutation(DELETE_ASSIGNMENT);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerAssignmentUpdate] = useMutation(UPDATE_ASSIGNMENT);
	const [triggerCollectionInsert] = useMutation(INSERT_COLLECTION);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);

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
				if (loadingInfo.state === 'error') {
					// Do not keep trying to fetch the assignment when an error occurred
					return;
				}

				// Determine if this is an edit or create page and initialize or fetch the assignment
				let assignment: Partial<Avo.Assignment.Assignment> | null;
				if (location.pathname.includes(ROUTE_PARTS.create)) {
					setPageType('create');
					assignment = initAssignmentsByQueryParams();
				} else {
					setPageType('edit');
					assignment = await fetchAssignment(match.params.id);
				}

				if (!assignment) {
					// Something went wrong during init/fetch
					return;
				}

				// Fetch the content if the assignment has content
				await fetchAssignmentContent(assignment);
			} catch (err) {
				setLoadingInfo({
					state: 'error',
					message: 'Het ophalen/aanmaken van de opdracht is mislukt',
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
					setLoadingInfo({
						state: 'error',
						message: 'Het ophalen van de opdracht inhoud is mislukt (leeg antwoord)',
						icon: 'search',
					});
					return null;
				}
				setBothAssignments(assignmentResponse);
				setLoadingInfo({ state: 'loaded' });
				return assignmentResponse;
			} catch (err) {
				console.error(err);

				setLoadingInfo({
					state: 'error',
					message: 'Het ophalen van de opdracht is mislukt',
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
					setLoadingInfo({ state: 'loaded' });
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

				const assignmentContentResponse: Avo.Assignment.Content = get(
					response,
					`data.${
						CONTENT_LABEL_TO_QUERY[assignment.content_label as Avo.Assignment.ContentLabel]
							.resultPath
					}`
				);
				if (!assignmentContentResponse) {
					console.error('Failed to fetch the assignment content', { response, ...queryParams });
					setLoadingInfo({
						state: 'error',
						message: 'Het ophalen van de opdracht inhoud is mislukt (leeg antwoord)',
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
				setLoadingInfo({ state: 'loaded' });
			} catch (err) {
				console.error(err);
				setLoadingInfo({
					state: 'error',
					message: 'Het ophalen van de opdracht inhoud is mislukt',
					icon: 'alert-triangle',
				});
			}
		};

		checkPermissions(
			PermissionNames.EDIT_ASSIGNMENTS,
			user,
			initAssignmentData,
			setLoadingInfo,
			t,
			t('assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken')
		);
	}, [loadingInfo, location, match.params, setLoadingInfo, assignmentContent, t, user]);

	const deleteCurrentAssignment = async () => {
		try {
			if (typeof currentAssignment.id === 'undefined') {
				toastService.danger('De huidige opdracht is nog nooit opgeslagen (geen id)');
				return;
			}
			await deleteAssignment(triggerAssignmentDelete, currentAssignment.id);
			navigate(history, WORKSPACE_PATH.WORKSPACE_TAB, { tabId: ASSIGNMENTS_ID });
			toastService.success('De opdracht is verwijdert');
		} catch (err) {
			console.error(err);
			toastService.danger('Het verwijderen van de opdracht is mislukt');
		}
	};

	const getAssignmentUrl = (absolute: boolean = true) => {
		return `${absolute ? window.location.origin : ''}/${ROUTE_PARTS.assignments}/${
			currentAssignment.id
		}`;
	};

	const copyAssignmentUrl = () => {
		copyToClipboard(getAssignmentUrl());
		toastService.success('De url is naar het klembord gekopieerd');

		if (currentAssignment.id) {
			trackEvents(
				{
					object: String(currentAssignment.id),
					object_type: 'avo_assignment' as any, // TODO add this object type to the database
					message: `Gebruiker ${getProfileName(user)} heeft de permalink voor opdracht ${
						currentAssignment.id
					} gekopieert`,
					action: 'view',
				},
				user
			);
		}
	};

	const viewAsStudent = () => history.push(getAssignmentUrl(false));

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
				toastService.success(`De opdracht is ge${shouldBeArchived ? '' : 'de'}archiveerd`);
			}
			// else: assignment was not valid and could not be saved yet
		} catch (err) {
			console.error(err);
			toastService.danger(
				`Het ${shouldBeArchived ? '' : 'de'}archiveren van de opdracht is mislukt`
			);
		}
	};

	const triggerCollectionCopy = async (
		contentLabel: string
	): Promise<Avo.Collection.Collection | null> => {
		if (!(contentLabel === 'COLLECTIE')) {
			return null;
		}

		return await CollectionService.duplicateCollection(
			assignmentContent as Avo.Collection.Collection,
			user,
			ASSIGNMENT_COPY,
			triggerCollectionInsert,
			triggerCollectionFragmentsInsert
		);
	};

	const duplicateAssignment = async (title: string) => {
		try {
			// Copy collection if not own collection
			const collectionCopy = await triggerCollectionCopy(initialAssignment.content_label || '');

			if (!collectionCopy) {
				return;
			}

			// Duplicate assignment with new content identifier
			const duplicatedAssigment = await insertDuplicateAssignment(triggerAssignmentInsert, title, {
				...initialAssignment,
				content_id: String(collectionCopy.id),
			});

			if (!duplicatedAssigment) {
				return;
			}

			navigate(history, ASSIGNMENT_PATH.ASSIGNMENT_EDIT, { id: duplicatedAssigment.id });
			toastService.success('De opdracht is succesvol gedupliceerd. U kijkt nu naar het duplicaat');
		} catch (err) {
			console.error('Failed to copy collection for the current assignment', err, {
				assignmentContent,
			});
			toastService.danger(t('Het kopieren van de opdracht is mislukt'));
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
		trackEvents(
			{
				object: assignment.content_id,
				object_type: CONTENT_LABEL_TO_EVENT_OBJECT_TYPE[assignment.content_label],
				message: `User ${getProfileName(user)} heeft ${
					CONTENT_LABEL_TO_EVENT_OBJECT_TYPE[assignment.content_label]
				} ${assignment.content_id} toegevoegd aan opdracht ${assignment.id}`,
				action: 'view',
			},
			user
		);
	};

	const saveAssignment = async (assignment: Partial<Avo.Assignment.Assignment>) => {
		try {
			setIsSaving(true);
			if (pageType === 'create') {
				// Copy content if it's a collection collection if not owned by logged in user
				// so your assignment can work after the other user deletes his collection
				if (
					assignment.content_label === 'COLLECTIE' &&
					(assignmentContent as Avo.Collection.Collection).owner_profile_id !== getProfileId(user)
				) {
					const sourceCollection = assignmentContent as Avo.Collection.Collection;
					const copy = await CollectionService.duplicateCollection(
						sourceCollection,
						user,
						ASSIGNMENT_COPY,
						triggerCollectionInsert,
						triggerCollectionFragmentsInsert
					);
					if (!copy) {
						return; // Creating the copy failed, error has already been shown to the user
					}
					assignment.content_id = String(copy.id);
				}

				// create => insert into graphql
				const newAssignment: Avo.Assignment.Assignment = {
					...assignment,
					owner_profile_id: getProfileId(user),
				} as Avo.Assignment.Assignment;
				const insertedAssignment = await insertAssignment(triggerAssignmentInsert, newAssignment);

				if (insertedAssignment) {
					setBothAssignments(insertedAssignment);
					trackAddObjectToAssignment(insertedAssignment);
					toastService.success('De opdracht is succesvol aangemaakt');
					navigate(history, ASSIGNMENT_PATH.ASSIGNMENT_EDIT, { id: insertedAssignment.id });
				}
			} else {
				// edit => update graphql
				await updateAssignment(triggerAssignmentUpdate, assignment);
				setBothAssignments(assignment);
				toastService.success(
					t('assignment/views/assignment-edit___de-opdracht-is-succesvol-geupdatet')
				);
			}
			setIsSaving(false);
		} catch (err) {
			console.error(err);
			toastService.danger(
				t('assignment/views/assignment-edit___het-opslaan-van-de-opdracht-is-mislukt')
			);
			setIsSaving(false);
		}
	};

	const isDeadlineInThePast = (): boolean => {
		return (
			!!currentAssignment.deadline_at &&
			new Date(currentAssignment.deadline_at) < new Date(Date.now())
		);
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
					{renderDropdownButton(
						tags.length ? '' : t('assignment/views/assignment-edit___geen'),
						false,
						tags,
						removeTag
					)}
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							<Button
								type="borderless"
								block
								label={t('assignment/views/assignment-edit___geen')}
							/>
							<Button
								type="borderless"
								block
								label={t('assignment/views/assignment-edit___beheer-vakken-en-projecten')}
							/>
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		);
	};

	const renderContentLink = (content: Avo.Assignment.Content) => {
		const dutchLabel = (content.type.label ||
			(currentAssignment.content_label || '').toLowerCase()) as DutchContentType;
		const linkContent = (
			<div className="c-box c-box--padding-small">
				<Flex orientation="vertical" center>
					<Spacer margin="right">
						<Thumbnail
							className="m-content-thumbnail"
							category={toEnglishContentType(dutchLabel)}
							src={content.thumbnail_path || undefined}
						/>
					</Spacer>
					<FlexItem>
						<div className="c-overline-plus-p">
							<p className="c-overline">{dutchLabel}</p>
							<p>{content.title || content.description}</p>
						</div>
					</FlexItem>
				</Flex>
			</div>
		);

		if (
			pageType === 'create' &&
			currentAssignment.content_label === 'COLLECTIE' &&
			getProfileId(user) !== (content as Avo.Collection.Collection).owner_profile_id
		) {
			// During create we do not allow linking to the collection if you do not own the collection,
			// since we still need to make a copy when the user clicks on "save assignment" button
			return (
				<div
					title={t(
						'assignment/views/assignment-edit___u-kan-pas-doorklikken-naar-de-collectie-nadat-u-de-opdracht-hebt-aangemaakt'
					)}
				>
					{linkContent}
				</div>
			);
		}

		return (
			<Link
				to={`/${
					CONTENT_LABEL_TO_ROUTE_PARTS[
						currentAssignment.content_label as Avo.Assignment.ContentLabel
					]
				}/${currentAssignment.content_id}`}
			>
				{linkContent}
			</Link>
		);
	};

	const renderAssignmentEditForm = () => {
		const now = new Date(Date.now());

		return (
			<>
				<Navbar autoHeight>
					<Container mode="vertical" background="alt">
						<Container mode="horizontal">
							<Toolbar autoHeight className="c-toolbar--drop-columns-low-mq">
								<ToolbarLeft>
									<ToolbarItem grow>
										<Link
											className="c-return"
											to={buildLink(WORKSPACE_PATH.WORKSPACE_TAB, {
												tabId: ASSIGNMENTS_ID,
											})}
										>
											<Icon name="chevron-left" size="small" type="arrows" />
											<Trans i18nKey="assignment/views/assignment-edit___mijn-opdrachten">
												Mijn opdrachten
											</Trans>
										</Link>
										<BlockHeading className="u-m-0" type="h2">
											{pageType === 'create'
												? t('assignment/views/assignment-edit___nieuwe-opdracht')
												: currentAssignment.title}
										</BlockHeading>
										{currentAssignment.id && (
											<Spacer margin="top-small">
												<Form type="inline">
													<FormGroup label={t('assignment/views/assignment-edit___url')}>
														<TextInput value={getAssignmentUrl()} disabled />
													</FormGroup>
													<Spacer margin="left-small">
														<Button
															icon="copy"
															type="secondary"
															ariaLabel={t(
																'assignment/views/assignment-edit___kopieer-de-opdracht-url'
															)}
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
												<Button
													type="secondary"
													onClick={() => history.goBack()}
													label={t('assignment/views/assignment-edit___annuleren')}
												/>
											)}
											{pageType === 'edit' && (
												<Spacer margin="right-small">
													<Button
														type="secondary"
														onClick={viewAsStudent}
														label={t('assignment/views/assignment-edit___bekijk-als-leerling')}
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
																ariaLabel={t('assignment/views/assignment-edit___meer-opties')}
																title={t('assignment/views/assignment-edit___meer-opties')}
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
												label={t('assignment/views/assignment-edit___opslaan')}
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
				<Container mode="horizontal" size="small" className="c-assignment-edit">
					<Container mode="vertical" size="large">
						<Form>
							<FormGroup required label={t('assignment/views/assignment-edit___titel')}>
								<TextInput
									id="title"
									value={currentAssignment.title}
									onChange={title => setAssignmentProp('title', title)}
								/>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___opdracht')} required>
								<WYSIWYG
									id="assignmentDescription"
									autogrow
									data={currentAssignment.description}
									onChange={description => setAssignmentProp('description', description)}
								/>
							</FormGroup>
							{assignmentContent && currentAssignment.content_label && (
								<FormGroup label={t('assignment/views/assignment-edit___inhoud')}>
									{renderContentLink(assignmentContent)}
								</FormGroup>
							)}
							<FormGroup
								label={t('assignment/views/assignment-edit___weergave')}
								labelFor="only_player"
							>
								<RadioButtonGroup>
									<RadioButton
										label={t('assignment/views/assignment-edit___mediaspeler-met-beschrijving')}
										name="content_layout"
										value={String(AssignmentLayout.PlayerAndText)}
										checked={currentAssignment.content_layout === AssignmentLayout.PlayerAndText}
										onChange={isChecked =>
											isChecked &&
											setAssignmentProp('content_layout', AssignmentLayout.PlayerAndText)
										}
									/>
									<RadioButton
										label={t('assignment/views/assignment-edit___enkel-mediaspeler')}
										name="content_layout"
										value={String(AssignmentLayout.OnlyPlayer)}
										checked={currentAssignment.content_layout === AssignmentLayout.OnlyPlayer}
										onChange={isChecked =>
											isChecked && setAssignmentProp('content_layout', AssignmentLayout.OnlyPlayer)
										}
									/>
								</RadioButtonGroup>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___klas-of-groep')} required>
								<TextInput
									id="class_room"
									value={currentAssignment.class_room || ''}
									onChange={classRoom => setAssignmentProp('class_room', classRoom)}
								/>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___vak-of-project')}>
								{renderTagsDropdown()}
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___antwoorden-op')}
								labelFor="answer_url"
							>
								<TextInput
									id="answer_url"
									type="text"
									placeholder={t('assignment/views/assignment-edit___http')}
									value={currentAssignment.answer_url || ''}
									onChange={value => setAssignmentProp('answer_url', value)}
								/>
								<p className="c-form-help-text">
									<Trans i18nKey="assignment/views/assignment-edit___waar-geeft-de-leerling-de-antwoorden-in-voeg-een-optionele-url-naar-een-ander-platform-toe">
										Waar geeft de leerling de antwoorden in? Voeg een optionele URL naar een ander
										platform toe.
									</Trans>
								</p>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___beschikbaar-vanaf')}>
								<Flex>
									<DatePicker
										value={
											currentAssignment.available_at
												? new Date(currentAssignment.available_at)
												: now
										}
										onChange={(value: Date | null) =>
											setAssignmentProp('available_at', value ? value.toISOString() : null)
										}
										showTimeInput
									/>
								</Flex>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___deadline')} required>
								<Flex>
									<Spacer margin="right-small">
										<DatePicker
											value={
												currentAssignment.deadline_at
													? new Date(currentAssignment.deadline_at)
													: null
											}
											onChange={value => setAssignmentProp('deadline_at', value)}
											showTimeInput
										/>
									</Spacer>
								</Flex>
								{isDeadlineInThePast() ? (
									<div className="c-form-help-text c-form-help-text--error">
										<Trans i18nKey="assignment/views/assignment-edit___de-deadline-ligt-in-het-verleden">
											De deadline ligt in het verleden.
										</Trans>
										<br />
										<Trans i18nKey="assignment/views/assignment-edit___de-leerlingen-zullen-dus-geen-toegang-hebben-tot-deze-opdracht">
											De leerlingen zullen dus geen toegang hebben tot deze opdracht
										</Trans>
									</div>
								) : (
									<p className="c-form-help-text">
										<Trans i18nKey="assignment/views/assignment-edit___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen">
											Na deze datum kan de leerling de opdracht niet meer invullen.
										</Trans>
									</p>
								)}
							</FormGroup>
							{currentAssignment.assignment_type === 'BOUW' && (
								<FormGroup
									label={t('assignment/views/assignment-edit___groepswerk')}
									labelFor="only_player"
								>
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
										<Trans i18nKey="assignment/views/assignment-edit___hulp-nodig-bij-het-maken-van-opdrachten">
											Hulp nodig bij het maken van opdrachten?
										</Trans>
										<br />
										Bekijk onze{' '}
										<a href="http://google.com" target="_blank" rel="noopener noreferrer">
											<Trans i18nKey="assignment/views/assignment-edit___screencast">
												screencast
											</Trans>
										</a>
										.
									</p>
								</div>
							</Alert>
						</Form>
					</Container>
				</Container>
				<Container background="alt" mode="vertical">
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										<Button
											type="primary"
											label={t('assignment/views/assignment-edit___opslaan')}
											onClick={() => saveAssignment(currentAssignment)}
											disabled={isSaving}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>

				<DeleteObjectModal
					title={t('Ben je zeker dat je deze opdracht wil verwijderen?')}
					body={t('Deze actie kan niet ongedaan gemaakt worden')}
					isOpen={isDeleteModalOpen}
					onClose={() => setDeleteModalOpen(false)}
					deleteObjectCallback={deleteCurrentAssignment}
				/>

				<InputModal
					title={t('assignment/views/assignment-edit___dupliceer-taak')}
					inputLabel={t('Geef de nieuwe taak een naam:')}
					inputValue={currentAssignment.title}
					inputPlaceholder={t('Titel van de nieuwe taak')}
					isOpen={isDuplicateModalOpen}
					onClose={() => setDuplicateModalOpen(false)}
					inputCallback={(newTitle: string) => duplicateAssignment(newTitle)}
					emptyMessage={t('Gelieve een opdracht-titel in te geven.')}
				/>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			dataObject={currentAssignment}
			render={renderAssignmentEditForm}
			loadingInfo={loadingInfo}
			notFoundError={t('De opdracht is niet gevonden')}
		/>
	);
};

export default AssignmentEdit;
