import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Container, Flex, Icon, Spacer, Spinner, Tabs } from '@viaa/avo2-components';
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
import BeforeUnloadComponent from 'react-beforeunload-component';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { ItemsService } from '../../admin/items/items.service';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { CollectionService } from '../../collection/collection.service';
import { BlockList } from '../../collection/components';
import { GENERATE_SITE_TITLE } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import ConfirmModal from '../../shared/components/ConfirmModal/ConfirmModal';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { ROUTE_PARTS } from '../../shared/constants';
import { CustomError } from '../../shared/helpers';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	ASSIGNMENT_FORM_SCHEMA,
	NEW_ASSIGNMENT_BLOCK_ID_PREFIX,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentBlockType, AssignmentFormState } from '../assignment.types';
import AssignmentDetailsFormEditable from '../components/AssignmentDetailsFormEditable';
import AssignmentDetailsFormReadonly from '../components/AssignmentDetailsFormReadonly';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentPupilPreview from '../components/AssignmentPupilPreview';
import AssignmentTitle from '../components/AssignmentTitle';
import { ShareAssignmentWithPupil } from '../components/ShareAssignmentWithPupil';
import { backToOverview } from '../helpers/back-to-overview';
import { insertAtPosition, insertMultipleAtPosition } from '../helpers/insert-at-position';
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

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
}) => {
	const [t] = useTranslation();

	// Data
	const [original, setOriginal] = useState<Avo.Assignment.Assignment_v2 | null>(null);
	const [assignment, setAssignment] = useAssignmentForm(undefined);
	const [isConfirmSaveActionModalOpen, setIsConfirmSaveActionModalOpen] =
		useState<boolean>(false);
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
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, tab, setTab, onTabClick] = useAssignmentTeacherTabs();
	const [isViewAsPupilEnabled, setIsViewAsPupilEnabled] = useState<boolean>();

	const pastDeadline = useAssignmentPastDeadline(original);

	// HTTP

	// Get query string variables and fetch the existing object
	const fetchAssignment = useCallback(async () => {
		try {
			const id = match.params.id;
			const res = await AssignmentService.fetchAssignmentById(id);

			if (!res) {
				// Something went wrong during init/fetch
				throw new CustomError('Failed to load resource.');
			}

			if (
				!(await PermissionService.hasPermissions(
					[
						PermissionName.EDIT_ANY_ASSIGNMENTS,
						{ name: PermissionName.EDIT_ASSIGNMENTS, obj: res },
						{ name: PermissionName.EDIT_OWN_ASSIGNMENTS, obj: res },
					],
					user
				))
			) {
				history.push(`/${ROUTE_PARTS.assignments}/${id}`);
				ToastService.info(
					t(
						'assignment/views/assignment-edit___je-hebt-geen-rechten-om-deze-opdracht-te-bewerken-maar-je-kan-ze-wel-bekijken'
					)
				);
				return;
			}

			const hasPupilBlocks = await AssignmentService.hasPupilCollectionBlocks(id);

			setOriginal(res);
			setAssignment(res);
			setAssignmentHasResponses(res.responses.length > 0);
			setAssignmentHasPupilBlocks(hasPupilBlocks);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
				),
				icon: 'alert-triangle',
			});
		}
	}, [user, match.params, setLoadingInfo, t, history, setOriginal, setAssignment]);

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

	const onAddItem = async (itemExternalId: string) => {
		if (addBlockModal.entity == null) {
			return;
		}

		// fetch item details
		const item_meta = (await ItemsService.fetchItemByExternalId(itemExternalId)) || undefined;
		const blocks = insertAtPosition<AssignmentBlock>(assignment.blocks, {
			id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
			item_meta,
			type: AssignmentBlockType.ITEM,
			fragment_id: itemExternalId,
			position: addBlockModal.entity,
		} as AssignmentBlock);

		setAssignment((prev) => ({
			...prev,
			blocks,
		}));

		setValue('blocks', blocks, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const onAddCollection = async (collectionId: string, withDescription: boolean) => {
		if (addBlockModal.entity == null) {
			return;
		}

		// fetch collection details
		const collection = await CollectionService.fetchCollectionOrBundleById(
			collectionId,
			'collection',
			undefined,
			true
		);

		if (!collection) {
			ToastService.danger(
				t('assignment/views/assignment-edit___de-collectie-kon-niet-worden-opgehaald')
			);
			return;
		}

		if (collection.collection_fragments) {
			const blocks = collection.collection_fragments.map(
				(collectionItem, index): Partial<AssignmentBlock> => ({
					id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf() + index}`,
					item_meta: collectionItem.item_meta,
					type: collectionItem.type,
					fragment_id: collectionItem.external_id,
					position: (addBlockModal.entity || 0) + index,
					original_title: withDescription ? collectionItem.custom_title : null,
					original_description: withDescription
						? collectionItem.custom_description
						: null,
					custom_title: collectionItem.use_custom_fields
						? collectionItem.custom_title
						: null,
					custom_description: collectionItem.use_custom_fields
						? collectionItem.custom_description
						: null,
					use_custom_fields: collectionItem.use_custom_fields,
				})
			);
			const newAssignmentBlocks = insertMultipleAtPosition(
				assignment.blocks,
				blocks as unknown as AssignmentBlock[]
			);

			setAssignment((prev) => ({
				...prev,
				blocks: newAssignmentBlocks,
			}));

			setValue('blocks', newAssignmentBlocks, {
				shouldDirty: true,
				shouldTouch: true,
			});

			// Track import collection into assignment event
			if (assignment.id) {
				trackEvents(
					{
						object: assignment.id,
						object_type: 'avo_assignment',
						action: 'add',
						resource: {
							type: 'collection',
							id: collection.id,
						},
					},
					user
				);
			}
		}
	};

	const [renderedModals, confirmSliceModal, addBlockModal] = useBlockListModals(
		assignment.blocks,
		updateBlocksInAssignmentState,
		{
			confirmSliceConfig: {
				responses: original?.responses || [],
			},
			addBookmarkFragmentConfig: {
				user,
				addFragmentCallback: onAddItem,
			},
			addCollectionConfig: {
				user,
				addCollectionCallback: onAddCollection,
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
				<Button
					ariaLabel={t('assignment/views/assignment-detail___meer-opties')}
					disabled
					icon="more-horizontal"
					title={t('assignment/views/assignment-detail___meer-opties')}
					type="secondary"
				/>
				{original && (
					<ShareAssignmentWithPupil
						assignment={original} // Needs to be saved before you can share
						onContentLinkClicked={() => setTab(ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud)}
						onDetailLinkClicked={() => setTab(ASSIGNMENT_CREATE_UPDATE_TABS.Details)}
					/>
				)}
			</>
		),
		[t, original, setTab, setIsViewAsPupilEnabled]
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

	// Set the loading state when the form is ready
	useEffect(() => {
		if (loadingInfo.state !== 'loaded') {
			assignment && setLoadingInfo({ state: 'loaded' });
		}
	}, [assignment, loadingInfo, setLoadingInfo]);

	// Reset the form when the original changes
	useEffect(() => {
		original && reset();
	}, [original, reset]);

	// Render

	const renderEditAssignmentPage = () => (
		<div className="c-assignment-page c-assignment-page--edit c-sticky-save-bar__wrapper">
			<BeforeUnloadComponent
				blockRoute={isDirty}
				modalComponentHandler={({ handleModalLeave }: { handleModalLeave: () => void }) => {
					let body = t(
						'collection/components/collection-or-bundle-edit___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
					);

					if (assignmentHasPupilBlocks) {
						body = t(
							'assignment/views/assignment-edit___opgelet-er-bestaan-reeds-leerlingencollecties-binnen-deze-opdracht-ben-je-zeker-dat-je-deze-nieuwe-wijzigingen-wil-opslaan-en-de-leerlingencollecties-wil-verwijderen-voor-je-de-pagina-verlaat'
						);
					} else if (assignmentHasResponses) {
						body = t(
							'assignment/views/assignment-edit___opgelet-leerlingen-hebben-deze-opdracht-reeds-bekeken-ben-je-zeker-dat-je-deze-nieuwe-wijzigingen-wil-opslaan-voor-je-de-pagina-verlaat'
						);
					}

					return (
						<ConfirmModal
							isOpen={true}
							body={body}
							onClose={handleModalLeave}
							deleteObjectCallback={() => {
								handleSubmit(submit, console.error)();
								handleModalLeave();
							}}
							cancelLabel={t('assignment/views/assignment-edit___annuleer')}
							confirmLabel={t('assignment/views/assignment-edit___opslaan')}
							title={t(
								'assignment/views/assignment-edit___nieuwe-wijzigingen-opslaan'
							)}
							confirmButtonType="primary"
						/>
					);
				}}
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
			</BeforeUnloadComponent>

			{/* Must always be the second and last element inside the c-sticky-save-bar__wrapper */}
			<StickySaveBar isVisible={isDirty} onSave={handleOnSave} onCancel={() => reset()} />
		</div>
	);

	const renderPageContent = () => {
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

			<LoadingErrorLoadedComponent
				dataObject={assignment}
				render={renderPageContent}
				loadingInfo={loadingInfo}
				notFoundError={t('assignment/views/assignment-edit___de-opdracht-is-niet-gevonden')}
			/>
		</>
	);
};

export default AssignmentEdit;
