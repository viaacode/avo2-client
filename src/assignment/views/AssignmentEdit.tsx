import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	Icon,
	Spacer,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, {
	Dispatch,
	FunctionComponent,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { BlockList } from '../../collection/components';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ErrorViewQueryParams } from '../../error/views/ErrorView';
import ConfirmModal from '../../shared/components/ConfirmModal/ConfirmModal';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENT_CREATE_UPDATE_TABS, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentFormState } from '../assignment.types';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentDetailsFormReadonly from '../components/AssignmentDetailsFormReadonly';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentPupilPreview from '../components/AssignmentPupilPreview';
import AssignmentTitle from '../components/AssignmentTitle';
import AssignmentUnload from '../components/AssignmentUnload';
import DeleteAssignmentButton from '../components/DeleteAssignmentButton';
import DuplicateAssignmentButton from '../components/DuplicateAssignmentButton';
import { ShareAssignmentWithPupil } from '../components/ShareAssignmentWithPupil';
import { backToOverview, toAssignmentDetail } from '../helpers/links';
import {
	useAssignmentBlockChangeHandler,
	useAssignmentForm,
	useAssignmentTeacherTabs,
	useBlockListModals,
	useBlocksList,
	useEditBlocks,
} from '../hooks';
import { useAssignmentPastDeadline } from '../hooks/assignment-past-deadline';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';
import { NO_RIGHTS_ERROR_MESSAGE } from '../../shared/services/data-service';

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
}) => {
	const [t] = useTranslation();

	// Data
	const [original, setOriginal] = useState<Avo.Assignment.Assignment_v2 | null>(null);
	const [assignmentLoading, setAssigmentLoading] = useState(false);
	const [assignmentError, setAssigmentError] = useState<Partial<ErrorViewQueryParams> | null>(
		null
	);
	const [assignment, setAssignment] = useAssignmentForm(undefined);
	const [assignmentHasPupilBlocks, setAssignmentHasPupilBlocks] = useState<boolean>();
	const [assignmentHasResponses, setAssignmentHasResponses] = useState<boolean>();

	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
	} = useForm<AssignmentFormState>({
		defaultValues: useMemo(() => original || undefined, [original]),
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(t)),
	});

	const updateBlocksInAssignmentState = (newBlocks: Avo.Core.BlockItemBase[]) => {
		setAssignment((prev) => ({ ...prev, blocks: newBlocks as AssignmentBlock[] }));
		setValue('blocks', newBlocks as AssignmentBlock[], { shouldDirty: true });
	};
	const setBlock = useAssignmentBlockChangeHandler(
		assignment.blocks,
		updateBlocksInAssignmentState
	);

	// UI
	const [tabs, tab, setTab, onTabClick] = useAssignmentTeacherTabs();
	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>(false);
	const [isOverflowDropdownOpen, setOverflowDropdownOpen] = useState<boolean>(false);
	const [isConfirmSaveActionModalOpen, setIsConfirmSaveActionModalOpen] =
		useState<boolean>(false);

	const pastDeadline = useAssignmentPastDeadline(original);

	// HTTP

	// Get query string variables and fetch the existing object
	const fetchAssignment = useCallback(async () => {
		try {
			setAssigmentLoading(true);
			setAssigmentError(null);
			const id = match.params.id;
			let tempAssignment;

			try {
				tempAssignment = await AssignmentService.fetchAssignmentById(id);
			} catch (err) {
				if (JSON.stringify(err).includes(NO_RIGHTS_ERROR_MESSAGE)) {
					setAssigmentError({
						message: t(
							'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
						),
						icon: 'lock',
					});
					setAssigmentLoading(false);
					return;
				}
				setAssigmentError({
					message: t(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: 'alert-triangle',
				});
				setAssigmentLoading(false);
				return;
			}

			if (!tempAssignment) {
				setAssigmentError({
					message: t(
						'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-is-mislukt'
					),
					icon: 'alert-triangle',
				});
				setAssigmentLoading(false);
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
				setAssigmentError({
					message: t(
						'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken'
					),
					icon: 'lock',
				});
				setAssigmentLoading(false);
				return;
			}

			const hasPupilBlocks = await AssignmentService.hasPupilCollectionBlocks(id);

			setOriginal(tempAssignment);
			setAssignment(tempAssignment);
			setAssignmentHasResponses(tempAssignment.responses.length > 0);
			setAssignmentHasPupilBlocks(hasPupilBlocks);
		} catch (err) {
			setAssigmentError({
				message: t(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: 'alert-triangle',
			});
		}
		setAssigmentLoading(false);
	}, [user, match.params, t, history, setOriginal, setAssignment]);

	// Events

	const handleOnSave = async () => {
		if (!user.profile?.id || !original) {
			return;
		}

		if (assignmentHasResponses) {
			setIsConfirmSaveActionModalOpen(true);
			return;
		}

		handleSubmit(submit, (...args) => console.error(args))();
	};

	const submit = async () => {
		try {
			if (!user.profile?.id || !original) {
				return;
			}

			const updated = await AssignmentService.updateAssignment(
				{
					...original,
					owner_profile_id: user.profile?.id,
				},
				{
					...original,
					...assignment,
				}
			);

			if (updated) {
				trackEvents(
					{
						object: String(assignment.id),
						object_type: 'assignment',
						action: 'edit',
					},
					user
				);

				// Re-fetch
				await fetchAssignment();

				ToastService.success(
					t('assignment/views/assignment-edit___de-opdracht-is-succesvol-aangepast')
				);
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t('assignment/views/assignment-edit___het-opslaan-van-de-opdracht-is-mislukt')
			);
		}
	};

	const reset = useCallback(() => {
		original && setAssignment(original);
		resetForm();
	}, [resetForm, setAssignment, original]);

	// Render

	const renderBlockContent = useEditBlocks(setBlock);

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment.blocks,
		updateBlocksInAssignmentState,
		{
			confirmSliceConfig: {
				responses: original?.responses || [],
			},
			addCollectionConfig: {
				addCollectionCallback: (id) => {
					// Track import collection into assignment event
					trackEvents(
						{
							object: `${assignment.id}`,
							object_type: 'avo_assignment',
							action: 'add',
							resource: {
								id,
								type: 'collection',
							},
						},
						user
					);
				},
			},
		}
	);

	const [draggableListButton, draggableListModal] = useDraggableListModal({
		modal: {
			items: assignment.blocks,
			onClose: (update?: AssignmentBlock[]) => {
				if (update) {
					const blocks = update.map((item, i) => ({
						...item,
						position: assignment.blocks[i].position,
					}));

					setAssignment((prev) => ({
						...prev,
						blocks,
					}));

					setValue('blocks', blocks, { shouldDirty: true });
				}
			},
		},
	});

	const [renderedListSorter] = useBlocksList(assignment?.blocks, updateBlocksInAssignmentState, {
		listSorter: {
			content: (item) => item && renderBlockContent(item),
			divider: (item) => (
				<Button
					icon="plus"
					type="secondary"
					onClick={() => {
						addBlockModal.setEntity(item?.position);
						addBlockModal.setOpen(true);
					}}
				/>
			),
		},
		listSorterItem: {
			onSlice: (item) => {
				confirmSliceModal.setEntity(item);
				confirmSliceModal.setOpen(true);
			},
		},
	});

	const renderBackButton = useMemo(
		() => (
			<Link className="c-return" to={backToOverview()}>
				<Icon name="chevron-left" size="small" type="arrows" />
				{t('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[t, backToOverview]
	);

	const renderTitle = useMemo(
		() => <AssignmentTitle control={control} setAssignment={setAssignment} />,
		[t, control, setAssignment]
	);

	// These actions are just UI, they are disabled because they need to be implemented in a AssignmentActions component
	const renderActions = useMemo(
		() => (
			<>
				<Button
					ariaLabel={t(
						'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
					)}
					label={t('assignment/views/assignment-edit___bekijk-als-leerling')}
					title={t(
						'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
					)}
					type="secondary"
					onClick={() => setIsViewAsPupilEnabled(true)}
				/>
				{original && (
					<>
						<div className="c-assignment-heading__dropdown-wrapper">
							<Dropdown
								isOpen={isOverflowDropdownOpen}
								icon="more-horizontal"
								buttonType="secondary"
								placement="bottom-end"
							>
								<DropdownButton>
									<Button
										ariaLabel={t(
											'assignment/views/assignment-detail___meer-opties'
										)}
										icon="more-horizontal"
										title={t(
											'assignment/views/assignment-detail___meer-opties'
										)}
										type="secondary"
										onClick={() =>
											setOverflowDropdownOpen(!isOverflowDropdownOpen)
										}
									/>
								</DropdownButton>
								<DropdownContent>
									<DuplicateAssignmentButton
										assignment={original}
										onClick={(_e, duplicated) => {
											duplicated &&
												redirectToClientPage(
													toAssignmentDetail(duplicated),
													history
												);

											setOverflowDropdownOpen(false);
										}}
									/>
									<DeleteAssignmentButton
										assignment={original}
										modal={{
											deleteObjectCallback: () => {
												redirectToClientPage(backToOverview(), history);
											},
										}}
									/>
								</DropdownContent>
							</Dropdown>
						</div>

						<div className="c-assignment-heading__dropdown-wrapper">
							<ShareAssignmentWithPupil
								assignment={original} // Needs to be saved before you can share
								onContentLinkClicked={() =>
									setTab(ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud)
								}
								onDetailLinkClicked={() =>
									setTab(ASSIGNMENT_CREATE_UPDATE_TABS.Details)
								}
							/>
						</div>
					</>
				)}
			</>
		),
		[t, original, setTab, setIsViewAsPupilEnabled, isOverflowDropdownOpen]
	);

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick} />, [tabs, onTabClick]);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud:
				if (pastDeadline) {
					return <BlockList blocks={assignment.blocks} />;
				}
				return (
					<div className="c-assignment-contents-tab">
						{assignment.blocks.length > 0 && !pastDeadline && (
							<Spacer
								margin={['bottom-large']}
								className="c-assignment-page__reorder-container"
							>
								{draggableListButton}
							</Spacer>
						)}
						{renderedListSorter}
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.Details:
				if (pastDeadline) {
					if (!assignment) {
						if (!assignment) {
							return (
								<Spacer margin="top-extra-large">
									<Flex orientation="horizontal" center>
										<Spinner size="large" />
									</Flex>
								</Spacer>
							);
						}
					}
					return (
						<div className="c-assignment-details-tab">
							<AssignmentDetailsFormReadonly
								assignment={assignment as Avo.Assignment.Assignment_v2}
							/>
						</div>
					);
				}
				return (
					<div className="c-assignment-details-tab">
						<AssignmentDetailsFormEditable
							assignment={assignment as Avo.Assignment.Assignment_v2}
							setAssignment={
								setAssignment as Dispatch<
									SetStateAction<Avo.Assignment.Assignment_v2>
								>
							}
							setValue={setValue}
						/>
					</div>
				);

			default:
				return tab;
		}
	}, [tab, renderedListSorter]);

	// Effects

	// Fetch initial data
	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment]);

	// Synchronise the React state that triggers renders with the useForm hook
	useEffect(() => {
		Object.keys(assignment).forEach((key) => {
			const cast = key as keyof AssignmentFormState;
			setValue(cast, assignment[cast]);
		});

		trigger();
	}, [assignment, setValue, trigger]);

	// Reset the form when the original changes
	useEffect(() => {
		original && reset();
	}, [original, reset]);

	// Render

	const renderEditAssignmentPage = () => (
		<div className="c-assignment-page c-assignment-page--edit c-sticky-save-bar__wrapper">
			<AssignmentUnload
				blockRoute={isDirty}
				hasBlocks={assignmentHasPupilBlocks}
				hasResponses={assignmentHasResponses}
			>
				<div>
					<AssignmentHeading
						back={renderBackButton}
						title={renderTitle}
						actions={renderActions}
						tabs={renderTabs}
					/>

					<Container mode="horizontal">
						{pastDeadline && (
							<Spacer margin={['top-large']}>
								<Alert type="info">
									{t(
										'assignment/views/assignment-edit___deze-opdracht-is-afgelopen-en-kan-niet-langer-aangepast-worden-maak-een-duplicaat-aan-om-dit-opnieuw-te-delen-met-leerlingen'
									)}
								</Alert>
							</Spacer>
						)}

						<Spacer margin={['top-large', 'bottom-extra-large']}>
							{renderTabContent}
						</Spacer>

						{renderedModals}
						{draggableListModal}

						<ConfirmModal
							isOpen={isConfirmSaveActionModalOpen}
							onClose={() => setIsConfirmSaveActionModalOpen(false)}
							deleteObjectCallback={() => {
								setIsConfirmSaveActionModalOpen(false);
								handleSubmit(submit, (...args) => console.error(args))();
							}}
							title={t(
								'assignment/views/assignment-edit___nieuwe-wijzigingen-opslaan'
							)}
							body={t(
								'assignment/views/assignment-edit___p-strong-opgelet-strong-leerlingen-hebben-deze-opdracht-reeds-bekeken-p-p-ben-je-zeker-dat-je-deze-nieuwe-wijzigingen-wil-opslaan-p'
							)}
							confirmLabel={t('assignment/views/assignment-edit___opslaan')}
							cancelLabel={t('assignment/views/assignment-edit___annuleer')}
							confirmButtonType="primary"
						/>
					</Container>
				</div>
			</AssignmentUnload>

			{/* Must always be the second and last element inside the c-sticky-save-bar__wrapper */}
			<StickySaveBar isVisible={isDirty} onSave={handleOnSave} onCancel={() => reset()} />
		</div>
	);

	const renderPageContent = () => {
		if (assignmentLoading) {
			if (!assignment) {
				return (
					<Spacer margin="top-extra-large">
						<Flex orientation="horizontal" center>
							<Spinner size="large" />
						</Flex>
					</Spacer>
				);
			}
		}
		if (assignmentError) {
			return <ErrorView {...assignmentError} />;
		}
		if (isViewAsPupilEnabled) {
			return (
				<AssignmentPupilPreview
					assignment={assignment}
					onClose={() => setIsViewAsPupilEnabled(false)}
				/>
			);
		}
		return renderEditAssignmentPage();
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t('assignment/views/assignment-create___maak-opdracht-pagina-titel')
					)}
				</title>

				<meta
					name="description"
					content={t(
						'assignment/views/assignment-create___maak-opdracht-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			{renderPageContent()}
		</>
	);
};

export default AssignmentEdit;
