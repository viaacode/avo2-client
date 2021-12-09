import { get, isEmpty, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Form,
	FormGroup,
	Icon,
	Navbar,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { RichEditorState } from '@viaa/avo2-components/dist/esm/wysiwyg';
import { Avo } from '@viaa/avo2-types';
import { AssignmentContent } from '@viaa/avo2-types/types/assignment';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName } from '../../authentication/helpers/permission-names';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import {
	DeleteObjectModal,
	InputModal,
	InteractiveTour,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import MoreOptionsDropdown from '../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import {
	buildLink,
	copyToClipboard,
	CustomError,
	isMobileWidth,
	navigate,
	sanitizeHtml,
} from '../../shared/helpers';
import { AssignmentLabelsService, ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import i18n from '../../shared/translations/i18n';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';

import './AssignmentEdit.scss';

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	history,
	match,
	user,
}) => {
	const [t] = useTranslation();

	const [assignmentContent, setAssignmentContent] = useState<Avo.Assignment.Content | null>(null);
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
		},
		[setCurrentAssignment, setInitialAssignment]
	);

	/**
	 *  Get query string variables and store them into the assignment state object
	 */
	const checkPermissionsAndGetAssignment = useCallback(async () => {
		try {
			// Redirect if id is a legacy numeric assignment id instead of a guid
			const assignmentId = match.params.id;

			if (AssignmentService.isLegacyAssignmentId(assignmentId)) {
				const assignmentUuid:
					| string
					| undefined = await AssignmentService.getAssignmentUuidFromLegacyId(
					assignmentId
				);
				if (!assignmentUuid) {
					console.error(
						new CustomError(
							'The assignment id appears to be a legacy assignment id, but the matching uuid could not be found in the database',
							null,
							{ legacyId: assignmentId }
						)
					);
					setLoadingInfo({
						state: 'error',
						message: t(
							'assignment/views/assignment-edit___de-opdracht-kon-niet-worden-gevonden'
						),
						icon: 'search',
					});
					return;
				}
				history.replace(buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignmentUuid }));
				return;
			}

			// Determine if this is an edit or create page and initialize or fetch the assignment
			const tempAssignment: Partial<
				Avo.Assignment.Assignment
			> | null = await AssignmentService.fetchAssignmentByUuid(assignmentId);

			if (!tempAssignment) {
				// Something went wrong during init/fetch
				return;
			}

			if (
				!(await PermissionService.hasPermissions(
					[
						PermissionName.EDIT_ANY_ASSIGNMENTS,
						{ name: PermissionName.EDIT_ASSIGNMENTS, obj: tempAssignment },
						{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: tempAssignment },
					],
					user
				))
			) {
				history.push(`/${ROUTE_PARTS.assignments}/${assignmentId}`);
				ToastService.info(
					t(
						'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken-maar-je-kan-ze-wel-bekijken'
					)
				);
				return;
			}

			// Fetch the content if the assignment has content
			let tempAssignmentContent: AssignmentContent | null = null;
			try {
				tempAssignmentContent = await AssignmentService.fetchAssignmentContent(
					tempAssignment
				);

				setAssignmentContent(tempAssignmentContent);
			} catch (err) {
				if (err.message !== 'NOT_FOUND') {
					console.error(
						new CustomError('Failed to fetch assignment content', err, {
							assignment: tempAssignment,
						})
					);
					ToastService.danger(
						t(
							'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-inhoud-is-mislukt'
						)
					);
				}

				setAssignmentContent(null);
			}

			setBothAssignments({
				...tempAssignment,
				title: tempAssignment.title || get(tempAssignmentContent, 'title', ''),
			});
			setAssignmentLabels(AssignmentLabelsService.getLabelsFromAssignment(tempAssignment));
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: 'alert-triangle',
			});
		}
	}, [user, match.params, setLoadingInfo, t, setBothAssignments, history]);

	useEffect(() => {
		checkPermissionsAndGetAssignment();
	}, [checkPermissionsAndGetAssignment]);

	useEffect(() => {
		if (!isEmpty(initialAssignment) && !isEmpty(currentAssignment)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [initialAssignment, currentAssignment, assignmentContent]);

	const getAssignmentUrl = (absolute: boolean = true) => {
		return `${absolute ? window.location.origin : ''}/${ROUTE_PARTS.assignments}/${
			currentAssignment.uuid
		}`;
	};

	const copyAssignmentUrl = () => {
		copyToClipboard(getAssignmentUrl());

		trackEvents(
			{
				object: String(currentAssignment.uuid),
				object_type: 'assignment',
				action: 'share',
				resource: {
					object_type: 'link',
				},
			},
			user
		);

		ToastService.success(
			t('assignment/views/assignment-edit___de-url-is-naar-het-klembord-gekopieerd')
		);

		if (currentAssignment.uuid) {
			trackEvents(
				{
					object: String(currentAssignment.uuid),
					object_type: 'avo_assignment',
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

	const handleExtraOptionClicked = async (itemId: 'duplicate' | 'archive' | 'delete') => {
		setExtraOptionsMenuOpen(false);
		switch (itemId) {
			case 'duplicate':
				setDuplicateModalOpen(true);
				break;

			case 'archive':
				await archiveAssignment(!initialAssignment.is_archived);
				break;

			case 'delete':
				setDeleteModalOpen(true);
				break;
			default:
				return null;
		}
	};

	const setAssignmentProp = (
		property: keyof Avo.Assignment.Assignment | 'descriptionRichEditorState',
		value: any
	) => {
		const newAssignment = {
			...currentAssignment,
			[property]: value,
		};
		setCurrentAssignment(newAssignment);
	};

	const saveAssignment = async (assignment: Partial<Avo.Assignment.Assignment>) => {
		try {
			setIsSaving(true);

			// copy description to assignment
			const descriptionRichEditorState: RichEditorState | undefined = (assignment as any)[
				'descriptionRichEditorState'
			];
			assignment.description = sanitizeHtml(
				descriptionRichEditorState
					? descriptionRichEditorState.toHTML()
					: assignment.description || '',
				'full'
			);
			delete (assignment as any)['descriptionRichEditorState'];

			// edit => update graphql
			await AssignmentService.updateAssignment(
				assignment,
				AssignmentLabelsService.getLabelsFromAssignment(initialAssignment),
				assignmentLabels
			);
			setBothAssignments(assignment);

			trackEvents(
				{
					object: String(assignment.uuid),
					object_type: 'assignment',
					action: 'edit',
				},
				user
			);

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

	const onDeleteAssignment = async () => {
		try {
			if (isNil(currentAssignment.uuid)) {
				throw new CustomError('Assignment does not have an uuid', null, {
					assignment: currentAssignment,
				});
			}
			await AssignmentService.deleteAssignment(currentAssignment.uuid);

			trackEvents(
				{
					object: String(currentAssignment.uuid),
					object_type: 'assignment',
					action: 'delete',
				},
				user
			);

			navigate(history, APP_PATH.WORKSPACE_TAB.route, { tabId: ASSIGNMENTS_ID });
			ToastService.success(
				i18n.t('assignment/views/assignment-edit___de-opdracht-is-verwijderd')
			);

			trackEvents(
				{
					object: String(currentAssignment.uuid),
					object_type: 'assignment',
					action: 'delete',
				},
				user
			);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				i18n.t(
					'assignment/views/assignment-edit___het-verwijderen-van-de-opdracht-is-mislukt'
				)
			);
		}
	};

	const renderAssignmentEditForm = () => {
		return (
			<div className="c-assignment-create-and-edit">
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
										{currentAssignment.uuid && (
											<Spacer margin="top-small">
												<Form
													type={isMobileWidth() ? 'standard' : 'inline'}
												>
													<FormGroup
														label={t(
															'assignment/views/assignment-edit___url'
														)}
													>
														<Flex>
															<TextInput
																value={getAssignmentUrl()}
																disabled
															/>
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
														</Flex>
													</FormGroup>
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
											<MoreOptionsDropdown
												isOpen={isExtraOptionsMenuOpen}
												onOpen={() => setExtraOptionsMenuOpen(true)}
												onClose={() => setExtraOptionsMenuOpen(false)}
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
												onOptionClicked={(id: string | number) =>
													handleExtraOptionClicked(id.toString() as any)
												}
											/>
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
				{AssignmentHelper.renderAssignmentForm(
					currentAssignment,
					assignmentContent,
					assignmentLabels,
					user,
					setAssignmentProp,
					setAssignmentLabels
				)}
				<Container background="alt" mode="vertical">
					<Container size="small" mode="horizontal" className="c-last-vertical-container">
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
					deleteObjectCallback={onDeleteAssignment}
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
						AssignmentHelper.attemptDuplicateAssignment(
							newTitle,
							currentAssignment,
							setCurrentAssignment,
							setLoadingInfo,
							user,
							history
						)
					}
					emptyMessage={t(
						'assignment/views/assignment-edit___gelieve-een-opdracht-titel-in-te-geven'
					)}
				/>
			</div>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(
							currentAssignment,
							'title',
							t(
								'assignment/views/assignment-edit___collectie-bewerken-pagina-titel-fallback'
							)
						)
					)}
				</title>
				<meta name="description" content={get(currentAssignment, 'description') || ''} />
			</MetaTags>
			<LoadingErrorLoadedComponent
				dataObject={currentAssignment}
				render={renderAssignmentEditForm}
				loadingInfo={loadingInfo}
				notFoundError={t('assignment/views/assignment-edit___de-opdracht-is-niet-gevonden')}
			/>
		</>
	);
};

export default AssignmentEdit;
