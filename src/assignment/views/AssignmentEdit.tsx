import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Container, Icon, Spacer, StickyEdgeBar, Tabs } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { isPast } from 'date-fns/esm';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { ItemsService } from '../../admin/items/items.service';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { CollectionService } from '../../collection/collection.service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { ROUTE_PARTS } from '../../shared/constants';
import { buildLink, CustomError } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	ASSIGNMENT_FORM_SCHEMA,
	NEW_ASSIGNMENT_BLOCK_ID_PREFIX,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentBlockType, AssignmentFormState } from '../assignment.types';
import AssignmentHeading from '../components/AssignmentHeading';
import AssignmentTitle from '../components/AssignmentTitle';
import { insertAtPosition, insertMultipleAtPosition } from '../helpers/insert-at-position';
import {
	useAssignmentBlocks,
	useAssignmentBlocksList,
	useAssignmentContentModals,
	useAssignmentDetailsForm,
	useAssignmentForm,
	useAssignmentTeacherTabs,
} from '../hooks';
import { useAssignmentBlockChangeHandler } from '../hooks/assignment-block-change-handler';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
}) => {
	const [t] = useTranslation();

	// Data
	const [original, setOriginal] = useState<Avo.Assignment.Assignment_v2 | undefined>(undefined);
	const [assignment, setAssignment, defaultValues] = useAssignmentForm(undefined);

	const form = useForm<AssignmentFormState>({
		defaultValues: useMemo(() => original, [original]),
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(t)),
	});
	const {
		control,
		formState: { isDirty },
		handleSubmit,
		reset: resetForm,
		setValue,
		trigger,
	} = form;

	const setBlock = useAssignmentBlockChangeHandler(assignment, setAssignment, setValue);

	// UI
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, tab, , onTabClick] = useAssignmentTeacherTabs();

	const pastDeadline = useMemo(
		() => original?.deadline_at && isPast(new Date(original.deadline_at)),
		[original]
	);

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

			setOriginal(res);
			setAssignment(res);
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

	const renderBlockContent = useAssignmentBlocks(setBlock);

	const onAddItem = async (itemExternalId: string) => {
		if (addBlockModal.entity == null) {
			return;
		}

		// fetch item details
		const item_meta = await ItemsService.fetchItemByExternalId(itemExternalId);
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
			undefined
		);

		if (!collection) {
			ToastService.danger(
				t('assignment/views/assignment-edit___de-collectie-kon-niet-worden-opgehaald')
			);
			return;
		}

		if (collection.collection_fragments) {
			const blocks = collection.collection_fragments.map((collectionItem, index) => ({
				id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf() + index}`,
				item: collectionItem.item_meta,
				type: collectionItem.type,
				fragment_id: collectionItem.external_id,
				position: (addBlockModal.entity || 0) + index,
				original_title: withDescription ? collectionItem.custom_title : null,
				original_description: withDescription ? collectionItem.custom_description : null,
				custom_title: collectionItem.use_custom_fields ? collectionItem.custom_title : null,
				custom_description: collectionItem.use_custom_fields
					? collectionItem.custom_description
					: null,
				use_custom_fields: collectionItem.use_custom_fields,
			}));
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
		}
	};

	const [renderedModals, confirmSliceModal, addBlockModal] = useAssignmentContentModals(
		assignment,
		setAssignment,
		setValue,
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

	const [renderedDetailForm] = useAssignmentDetailsForm(assignment, setAssignment, setValue, {
		initial: defaultValues,
	});

	const [renderedListSorter] = useAssignmentBlocksList(assignment, setAssignment, setValue, {
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
			<Link
				className="c-return"
				to={buildLink(APP_PATH.WORKSPACE_TAB.route, {
					tabId: ASSIGNMENTS_ID,
				})}
			>
				<Icon name="chevron-left" size="small" type="arrows" />

				{t('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[t]
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
					disabled
					label={t('assignment/views/assignment-edit___bekijk-als-leerling')}
					title={t(
						'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
					)}
					type="secondary"
				/>
				<Button
					ariaLabel={t('assignment/views/assignment-detail___meer-opties')}
					disabled
					icon="more-horizontal"
					title={t('assignment/views/assignment-detail___meer-opties')}
					type="secondary"
				/>
				<Button
					ariaLabel={t('assignment/views/assignment-create___delen-met-leerlingen')}
					disabled
					label={t('assignment/views/assignment-create___delen-met-leerlingen')}
					title={t('assignment/views/assignment-create___delen-met-leerlingen')}
				/>
			</>
		),
		[t]
	);

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick} />, [tabs, onTabClick]);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud:
				return <div className="c-assignment-contents-tab">{renderedListSorter}</div>;

			case ASSIGNMENT_CREATE_UPDATE_TABS.Details:
				return <div className="c-assignment-details-tab">{renderedDetailForm}</div>;

			default:
				return tab;
		}
	}, [tab, renderedDetailForm, renderedListSorter]);

	const render = () => (
		<div className="c-assignment-page c-assignment-page--create">
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

				<Spacer margin={['top-large', 'bottom-large']}>{renderTabContent}</Spacer>

				{isDirty && (
					<StickyEdgeBar>
						<p>
							<strong>
								{t('assignment/views/assignment-edit___wijzigingen-opslaan')}
							</strong>
						</p>

						<Button
							label={t('assignment/views/assignment-edit___annuleer')}
							onClick={() => reset()}
						/>

						<Button
							type="tertiary"
							label={t('assignment/views/assignment-edit___opslaan')}
							onClick={handleSubmit(submit, (...args) => console.error(args))}
						/>
					</StickyEdgeBar>
				)}
			</Container>

			{renderedModals}
		</div>
	);

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
				render={render}
				loadingInfo={loadingInfo}
				notFoundError={t('assignment/views/assignment-edit___de-opdracht-is-niet-gevonden')}
			/>
		</>
	);
};

export default AssignmentEdit;
