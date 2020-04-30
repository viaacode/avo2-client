import { ApolloQueryResult } from 'apollo-boost';
import { get, isEmpty, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
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
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { PermissionName } from '../../authentication/helpers/permission-service';
import { toEnglishContentType } from '../../collection/collection.types';
import { APP_PATH } from '../../constants';
import {
	checkPermissions,
	DeleteObjectModal,
	InputModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import InteractiveTour from '../../shared/components/InteractiveTour/InteractiveTour';
import { ROUTE_PARTS } from '../../shared/constants';
import { buildLink, copyToClipboard, navigate } from '../../shared/helpers';
import { AssignmentLabelsService, dataService, ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { CONTENT_LABEL_TO_QUERY, CONTENT_LABEL_TO_ROUTE_PARTS } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentLayout } from '../assignment.types';
import AssignmentLabels from '../components/AssignmentLabels';

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	const [assignmentContent, setAssignmentContent] = useState<Avo.Assignment.Content>();
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignmentLabels, setAssignmentLabels] = useState<Avo.Assignment.Label[]>([]);
	const [isExtraOptionsMenuOpen, setExtraOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [isDuplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [currentAssignment, setCurrentAssignment] = useState<Partial<Avo.Assignment.Assignment>>(
		{}
	);
	const [initialAssignment, setInitialAssignment] = useState<Partial<Avo.Assignment.Assignment>>(
		{}
	);

	const setBothAssignments = useCallback(
		(assignment: Partial<Avo.Assignment.Assignment>) => {
			setCurrentAssignment(assignment);
			setInitialAssignment(assignment);
			setAssignmentLabels(AssignmentLabelsService.getLabelsFromAssignment(assignment));
		},
		[setCurrentAssignment, setInitialAssignment, setAssignmentLabels]
	);

	/**
	 *  Get query string variables and store them into the assignment state object
	 */
	useEffect(() => {
		const initAssignmentData = async () => {
			try {
				// Determine if this is an edit or create page and initialize or fetch the assignment
				const tempAssignment: Partial<
					Avo.Assignment.Assignment
				> | null = await fetchAssignment(match.params.id);

				if (!tempAssignment) {
					// Something went wrong during init/fetch
					return;
				}

				// Fetch the content if the assignment has content
				const tempAssignmentContent = await fetchAssignmentContent(tempAssignment);

				setAssignmentContent(tempAssignmentContent);
				setBothAssignments({
					...tempAssignment,
					title: tempAssignment.title || get(tempAssignmentContent, 'title', ''),
				});
			} catch (err) {
				setLoadingInfo({
					state: 'error',
					message: t(
						'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
					),
					icon: 'alert-triangle',
				});
			}
		};

		const fetchAssignment = async (
			id: string | number
		): Promise<Avo.Assignment.Assignment | null> => {
			try {
				return await AssignmentService.fetchAssignmentById(id);
			} catch (err) {
				console.error(err);
				setLoadingInfo({
					state: 'error',
					message: t(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
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
				let assignmentContentResponse: Avo.Assignment.Content | undefined = undefined;
				if (assignment.content_id && assignment.content_label) {
					// The assignment doesn't have content linked to it
					// Fetch the content from the network
					const queryInfo =
						CONTENT_LABEL_TO_QUERY[
							assignment.content_label as Avo.Assignment.ContentLabel
						];
					const queryParams = {
						query: queryInfo.query,
						variables: queryInfo.getVariables(assignment.content_id),
					};
					const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query(
						queryParams
					);

					assignmentContentResponse = get(response, `data.${queryInfo.resultPath}`);
					if (!assignmentContentResponse) {
						console.error('Failed to fetch the assignment content', {
							response,
							...queryParams,
						});
						setLoadingInfo({
							state: 'error',
							message: t(
								'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-inhoud-is-mislukt-leeg-antwoord'
							),
							icon: 'search',
						});
					}
				}
				return assignmentContentResponse;
			} catch (err) {
				console.error(err);
				setLoadingInfo({
					state: 'error',
					message: t(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-inhoud-is-mislukt'
					),
					icon: 'alert-triangle',
				});
			}
		};

		checkPermissions(
			PermissionName.EDIT_ASSIGNMENTS,
			user,
			initAssignmentData,
			setLoadingInfo,
			t(
				'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
			)
		);
	}, [location, match.params, setLoadingInfo, setAssignmentContent, t, user, setBothAssignments]);

	useEffect(() => {
		if (
			!isEmpty(initialAssignment) &&
			!isEmpty(currentAssignment) &&
			(isNil(currentAssignment.content_id) || !isEmpty(assignmentContent))
		) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [initialAssignment, currentAssignment, assignmentContent]);

	const deleteCurrentAssignment = async () => {
		try {
			if (typeof currentAssignment.id === 'undefined') {
				ToastService.danger(
					t(
						'assignment/views/assignment-edit___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
					)
				);
				return;
			}
			await AssignmentService.deleteAssignment(currentAssignment.id);
			navigate(history, APP_PATH.WORKSPACE_TAB.route, { tabId: ASSIGNMENTS_ID });
			ToastService.success(t('assignment/views/assignment-edit___de-opdracht-is-verwijderd'));
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t('assignment/views/assignment-edit___het-verwijderen-van-de-opdracht-is-mislukt')
			);
		}
	};

	const getAssignmentUrl = (absolute: boolean = true) => {
		return `${absolute ? window.location.origin : ''}/${ROUTE_PARTS.assignments}/${
			currentAssignment.id
		}`;
	};

	const copyAssignmentUrl = () => {
		copyToClipboard(getAssignmentUrl());
		ToastService.success(
			t('assignment/views/assignment-edit___de-url-is-naar-het-klembord-gekopieerd')
		);

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
			const archivedAssignment: Partial<Avo.Assignment.Assignment> = {
				...initialAssignment,
				is_archived: shouldBeArchived,
			};
			setInitialAssignment(archivedAssignment);

			// Also set the currentAssignment to archived, so if the user saves, the assignment will stay archived
			setCurrentAssignment({
				...currentAssignment,
				is_archived: shouldBeArchived,
			});

			if (await AssignmentService.updateAssignment(archivedAssignment)) {
				ToastService.success(
					shouldBeArchived
						? t('assignment/views/assignment-edit___de-opdracht-is-gearchiveerd')
						: t('assignment/views/assignment-edit___de-opdracht-is-gedearchiveerd')
				);
			}
			// else: assignment was not valid and could not be saved yet
		} catch (err) {
			console.error(err);
			ToastService.danger(
				shouldBeArchived
					? t(
							'assignment/views/assignment-edit___het-archiveren-van-de-opdracht-is-mislukt'
					  )
					: t(
							'assignment/views/assignment-edit___het-dearchiveren-van-de-opdracht-is-mislukt'
					  )
			);
		}
	};

	const attemptDuplicateAssignment = async (
		newTitle: string,
		assignment: Partial<Avo.Assignment.Assignment>
	) => {
		try {
			if (isNil(assignment.id)) {
				ToastService.danger(
					'Je kan een opdracht pas dupliceren nadat je hem hebt opgeslagen.'
				);
				return;
			}
			const duplicatedAssignment = await AssignmentService.duplicateAssignment(
				newTitle,
				assignment,
				user
			);

			setCurrentAssignment({});
			setLoadingInfo({ state: 'loading' });

			navigate(history, APP_PATH.ASSIGNMENT_EDIT.route, { id: duplicatedAssignment.id });
			ToastService.success(
				t(
					'assignment/views/assignment-edit___de-opdracht-is-succesvol-gedupliceerd-u-kijkt-nu-naar-het-duplicaat'
				)
			);
		} catch (err) {
			console.error('Failed to copy the assignment', err);
			ToastService.danger(
				t('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
			);
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

	const saveAssignment = async (assignment: Partial<Avo.Assignment.Assignment>) => {
		try {
			setIsSaving(true);
			// edit => update graphql
			await AssignmentService.updateAssignment(
				assignment,
				AssignmentLabelsService.getLabelsFromAssignment(initialAssignment),
				AssignmentLabelsService.getLabelsFromAssignment(currentAssignment)
			);
			setBothAssignments(assignment);
			ToastService.success(
				t('assignment/views/assignment-edit___de-opdracht-is-succesvol-geupdatet')
			);
			setIsSaving(false);
		} catch (err) {
			console.error(err);
			ToastService.danger(
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

	const renderContentLink = (content: Avo.Assignment.Content) => {
		const dutchLabel = get(
			content,
			'type.label',
			(currentAssignment.content_label || '').toLowerCase()
		) as DutchContentType;
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
			<div className="c-assignment-edit">
				<Navbar autoHeight>
					<Container mode="vertical" background="alt">
						<Container mode="horizontal">
							<Toolbar autoHeight className="c-toolbar--drop-columns-low-mq">
								<ToolbarLeft>
									<ToolbarItem grow>
										<Link
											className="c-return"
											to={buildLink(APP_PATH.WORKSPACE_TAB.route, {
												tabId: ASSIGNMENTS_ID,
											})}
										>
											<Icon name="chevron-left" size="small" type="arrows" />
											<Trans i18nKey="assignment/views/assignment-edit___mijn-opdrachten">
												Mijn opdrachten
											</Trans>
										</Link>
										<BlockHeading className="u-m-0" type="h2">
											{currentAssignment.title}
										</BlockHeading>
										{currentAssignment.id && (
											<Spacer margin="top-small">
												<Form type="inline">
													<FormGroup
														label={t(
															'assignment/views/assignment-edit___url'
														)}
													>
														<TextInput
															value={getAssignmentUrl()}
															disabled
														/>
													</FormGroup>
													<Spacer margin="left-small">
														<Button
															icon="copy"
															type="secondary"
															ariaLabel={t(
																'assignment/views/assignment-edit___kopieer-de-opdracht-url'
															)}
															title={t(
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
											<Button
												type="secondary"
												onClick={viewAsStudent}
												label={t(
													'assignment/views/assignment-edit___bekijk-als-leerling'
												)}
												title={t(
													'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
												)}
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
														ariaLabel={t(
															'assignment/views/assignment-edit___meer-opties'
														)}
														title={t(
															'assignment/views/assignment-edit___meer-opties'
														)}
													/>
												</DropdownButton>
												<DropdownContent>
													<MenuContent
														menuItems={[
															{
																icon: 'copy',
																id: 'duplicate',
																label: t(
																	'assignment/views/assignment-edit___dupliceer'
																),
															},
															{
																icon: 'archive',
																id: 'archive',
																label: initialAssignment.is_archived
																	? t(
																			'assignment/views/assignment-edit___dearchiveer'
																	  )
																	: t(
																			'assignment/views/assignment-edit___archiveer'
																	  ),
															},
															{
																icon: 'delete',
																id: 'delete',
																label: t(
																	'assignment/views/assignment-edit___verwijder'
																),
															},
														]}
														onClick={id =>
															handleExtraOptionClicked(
																id.toString() as any
															)
														}
													/>
												</DropdownContent>
											</Dropdown>
											<Button
												type="primary"
												label={t(
													'assignment/views/assignment-edit___opslaan'
												)}
												title={t(
													'assignment/views/assignment-edit___sla-de-opdracht-op'
												)}
												onClick={() => saveAssignment(currentAssignment)}
												disabled={isSaving}
											/>
											<InteractiveTour showButton />
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
							<FormGroup
								required
								label={t('assignment/views/assignment-edit___titel')}
							>
								<TextInput
									id="title"
									value={currentAssignment.title}
									onChange={title => setAssignmentProp('title', title)}
								/>
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___opdracht')}
								required
							>
								<WYSIWYG
									id="assignmentDescription"
									autogrow
									data={currentAssignment.description}
									onChange={description =>
										setAssignmentProp('description', description)
									}
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
										label={t(
											'assignment/views/assignment-edit___mediaspeler-met-beschrijving'
										)}
										name="content_layout"
										value={String(AssignmentLayout.PlayerAndText)}
										checked={
											currentAssignment.content_layout ===
											AssignmentLayout.PlayerAndText
										}
										onChange={isChecked =>
											isChecked &&
											setAssignmentProp(
												'content_layout',
												AssignmentLayout.PlayerAndText
											)
										}
									/>
									<RadioButton
										label={t(
											'assignment/views/assignment-edit___enkel-mediaspeler'
										)}
										name="content_layout"
										value={String(AssignmentLayout.OnlyPlayer)}
										checked={
											currentAssignment.content_layout ===
											AssignmentLayout.OnlyPlayer
										}
										onChange={isChecked =>
											isChecked &&
											setAssignmentProp(
												'content_layout',
												AssignmentLayout.OnlyPlayer
											)
										}
									/>
								</RadioButtonGroup>
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___klas-of-groep')}
								required
							>
								<TextInput
									id="class_room"
									value={currentAssignment.class_room || ''}
									onChange={classRoom =>
										setAssignmentProp('class_room', classRoom)
									}
								/>
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___vak-of-project')}
							>
								<AssignmentLabels
									labels={assignmentLabels}
									user={user}
									onChange={setAssignmentLabels}
								/>
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
										Waar geeft de leerling de antwoorden in? Voeg een optionele
										URL naar een ander platform toe.
									</Trans>
								</p>
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___beschikbaar-vanaf')}
							>
								<Flex>
									<DatePicker
										value={
											currentAssignment.available_at
												? new Date(currentAssignment.available_at)
												: now
										}
										onChange={(value: Date | null) =>
											setAssignmentProp(
												'available_at',
												value ? value.toISOString() : null
											)
										}
										showTimeInput
									/>
								</Flex>
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___deadline')}
								required
							>
								<Flex>
									<Spacer margin="right-small">
										<DatePicker
											value={
												currentAssignment.deadline_at
													? new Date(currentAssignment.deadline_at)
													: null
											}
											onChange={value =>
												setAssignmentProp('deadline_at', value)
											}
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
											De leerlingen zullen dus geen toegang hebben tot deze
											opdracht
										</Trans>
									</div>
								) : (
									<p className="c-form-help-text">
										<Trans i18nKey="assignment/views/assignment-edit___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen">
											Na deze datum kan de leerling de opdracht niet meer
											invullen.
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
										onChange={checked =>
											setAssignmentProp('is_collaborative', checked)
										}
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
										<a
											href="http://google.com"
											target="_blank"
											rel="noopener noreferrer"
										>
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
											title={t(
												'assignment/views/assignment-edit___sla-de-opdracht-op'
											)}
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
					title={t(
						'assignment/views/assignment-edit___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
					)}
					body={t(
						'assignment/views/assignment-edit___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
					isOpen={isDeleteModalOpen}
					onClose={() => setDeleteModalOpen(false)}
					deleteObjectCallback={deleteCurrentAssignment}
				/>

				<InputModal
					title={t('assignment/views/assignment-edit___dupliceer-taak')}
					inputLabel={t(
						'assignment/views/assignment-edit___geef-de-nieuwe-taak-een-naam'
					)}
					inputValue={currentAssignment.title}
					inputPlaceholder={t(
						'assignment/views/assignment-edit___titel-van-de-nieuwe-taak'
					)}
					isOpen={isDuplicateModalOpen}
					onClose={() => setDuplicateModalOpen(false)}
					inputCallback={(newTitle: string) =>
						attemptDuplicateAssignment(newTitle, currentAssignment)
					}
					emptyMessage={t(
						'assignment/views/assignment-edit___gelieve-een-opdracht-titel-in-te-geven'
					)}
				/>
			</div>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			dataObject={currentAssignment}
			render={renderAssignmentEditForm}
			loadingInfo={loadingInfo}
			notFoundError={t('assignment/views/assignment-edit___de-opdracht-is-niet-gevonden')}
		/>
	);
};

export default AssignmentEdit;
