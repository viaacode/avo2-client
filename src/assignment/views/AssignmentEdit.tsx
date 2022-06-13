import { yupResolver } from '@hookform/resolvers/yup';
import { get, isEmpty, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Icon,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

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
import { buildLink, CustomError, navigate } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import i18n from '../../shared/translations/i18n';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import { AssignmentFormState } from '../assignment.types';

import './AssignmentEdit.scss';

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	history,
	match,
	user,
}) => {
	const [t] = useTranslation();

	// Data
	const formHook = useForm<AssignmentFormState>({
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA()),
		defaultValues: {
			title: 'Nieuwe opdracht', // TODO: i18n
			description: undefined,
		},
	});

	console.info({ formHook });

	const [currentAssignment, setCurrentAssignment] = useState<
		Partial<Avo.Assignment.Assignment_v2>
	>({});
	const [initialAssignment, setInitialAssignment] = useState<
		Partial<Avo.Assignment.Assignment_v2>
	>({});

	// UI
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isExtraOptionsMenuOpen, setExtraOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [isDuplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);

	const [assignmentContent, setAssignmentContent] = useState<Avo.Assignment.Block[] | null>(null);

	const setBothAssignments = useCallback(
		(assignment: Partial<Avo.Assignment.Assignment_v2>) => {
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

			// Determine if this is an edit or create page and initialize or fetch the assignment
			const tempAssignment: Partial<
				Avo.Assignment.Assignment_v2
			> | null = await AssignmentService.fetchAssignmentById(assignmentId);

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
			let tempAssignmentContent: Avo.Assignment.Block[] | null = null;
			try {
				tempAssignmentContent = await AssignmentService.fetchAssignmentBlocks(assignmentId);

				setAssignmentContent(tempAssignmentContent);
			} catch (err: any) {
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
			currentAssignment.id
		}`;
	};

	// const copyAssignmentUrl = () => {
	// 	copyToClipboard(getAssignmentUrl());

	// 	trackEvents(
	// 		{
	// 			object: String(currentAssignment.id),
	// 			object_type: 'assignment',
	// 			action: 'share',
	// 			resource: {
	// 				object_type: 'link',
	// 			},
	// 		},
	// 		user
	// 	);

	// 	ToastService.success(
	// 		t('assignment/views/assignment-edit___de-url-is-naar-het-klembord-gekopieerd')
	// 	);

	// 	if (currentAssignment.id) {
	// 		trackEvents(
	// 			{
	// 				object: String(currentAssignment.id),
	// 				object_type: 'assignment',
	// 				action: 'view',
	// 			},
	// 			user
	// 		);
	// 	}
	// };

	const viewAsStudent = () => history.push(getAssignmentUrl(false));

	const handleExtraOptionClicked = async (itemId: 'duplicate' | 'archive' | 'delete') => {
		setExtraOptionsMenuOpen(false);

		switch (itemId) {
			case 'duplicate':
				setDuplicateModalOpen(true);
				break;

			case 'delete':
				setDeleteModalOpen(true);
				break;
			default:
				return null;
		}
	};

	const onDeleteAssignment = async () => {
		try {
			if (isNil(currentAssignment.id)) {
				throw new CustomError('Assignment does not have an id', null, {
					assignment: currentAssignment,
				});
			}
			await AssignmentService.deleteAssignment(currentAssignment.id);

			trackEvents(
				{
					object: String(currentAssignment.id),
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
					object: String(currentAssignment.id),
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
				<Container background="alt" mode="vertical" size="small">
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

									<Flex center className="u-spacer-top">
										<Icon name="clipboard" size="large" />

										<BlockHeading className="u-spacer-left" type="h2">
											{currentAssignment.title}
										</BlockHeading>
									</Flex>
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
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>

				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Toolbar className="c-toolbar--no-height">
							<ToolbarLeft>TODO: tabs</ToolbarLeft>

							<ToolbarRight>
								<InteractiveTour showButton />
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Navbar>

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
