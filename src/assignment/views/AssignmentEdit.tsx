import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	BlockHeading,
	Button,
	Container,
	ContentInput,
	convertToHtml,
	Flex,
	Icon,
	Spacer,
	StickyEdgeBar,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import { isPast } from 'date-fns/esm';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import {
	AssignmentBlockListSorter,
	FlowPlayerWrapper,
	ListSorterItem,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import { CustomiseItemForm } from '../../shared/components/CustomiseItemForm';
import { TitleDescriptionForm } from '../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import {
	ROUTE_PARTS,
	SEARCH_FILTER_STATE_SERIES_PROP,
	WYSIWYG_OPTIONS_AUTHOR,
} from '../../shared/constants';
import { buildLink, CustomError, formatDate, isRichTextEmpty } from '../../shared/helpers';
import { useSingleEntityModal } from '../../shared/hooks';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	ASSIGNMENT_FORM_FIELDS,
	ASSIGNMENT_FORM_SCHEMA,
	EDIT_ASSIGNMENT_BLOCK_ICONS,
	EDIT_ASSIGNMENT_BLOCK_LABELS,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentBlockType, AssignmentFormState } from '../assignment.types';
import AssignmentDetailsForm from '../components/AssignmentDetailsForm';
import AssignmentHeading from '../components/AssignmentHeading';
import { insertAtPosition } from '../helpers/insert-at-position';
import { switchAssignmentBlockPositions } from '../helpers/switch-positions';
import { useAssignmentForm, useAssignmentTeacherTabs } from '../hooks';
import AddBlockModal from '../modals/AddBlockModal';
import ConfirmSliceModal from '../modals/ConfirmSliceModal';

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

	const setBlock = useCallback(
		(block: AssignmentBlock, update: Partial<AssignmentBlock>) => {
			const blocks = [
				...assignment.blocks.filter((b) => b.id !== block.id),
				{
					...block,
					...update,
				},
			];

			setAssignment((prev) => ({
				...prev,
				blocks,
			}));

			setValue('blocks', blocks, { shouldDirty: true });
		},
		[assignment.blocks, setAssignment, setValue]
	);

	// UI
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, tab, , onTabClick] = useAssignmentTeacherTabs();
	const [
		isConfirmSliceModalOpen,
		setConfirmSliceModalOpen,
		getConfirmSliceModalBlock,
		setConfirmSliceModalBlock,
	] = useSingleEntityModal<Pick<AssignmentBlock, 'id'>>();
	const [
		isAddBlockModalOpen,
		setAddBlockModalOpen,
		getAddBlockModalPosition,
		setAddBlockModalPosition,
	] = useSingleEntityModal<number>();

	const pastDeadline = useMemo(
		() => original?.deadline_at && isPast(new Date(original.deadline_at)),
		[original]
	);

	const fields = useMemo(() => {
		const unmapped = ASSIGNMENT_FORM_FIELDS(t);
		const mapped: Record<string, any> = {};

		Object.keys(unmapped).forEach((key) => {
			const cast = key as keyof typeof unmapped;
			const field = unmapped[cast];

			// Enrich each field with an onChange event to mark them
			mapped[cast] = {
				...field,
				onChange: () => {
					switch (cast) {
						case 'classrooms':
							setValue('labels', assignment.labels, { shouldDirty: true });
							break;

						default:
							setValue(cast, assignment[cast], { shouldDirty: true });
							break;
					}
				},
			};
		});

		return mapped as typeof unmapped;
	}, [t, assignment, setValue]);

	const listSorterItems = useMemo(() => {
		return assignment.blocks.map((block) => {
			const mapped: AssignmentBlock & ListSorterItem = {
				...block,
				icon: EDIT_ASSIGNMENT_BLOCK_ICONS()[block.type],
				onPositionChange: (item, delta) => {
					const blocks = switchAssignmentBlockPositions(assignment.blocks, item, delta);

					setAssignment((prev) => ({
						...prev,
						blocks,
					}));

					setValue('blocks', blocks, { shouldDirty: true, shouldTouch: true });
				},
				onSlice: (item) => {
					setConfirmSliceModalBlock(item);
					setConfirmSliceModalOpen(true);
				},
			};

			return mapped;
		});
	}, [
		assignment.blocks,
		setAssignment,
		setValue,
		setConfirmSliceModalBlock,
		setConfirmSliceModalOpen,
	]);

	const fragmentSwitchButtons = useCallback(
		(block: AssignmentBlock) => [
			{
				active: !block.use_custom_fields,
				label: t('assignment/views/assignment-edit___origineel'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: false,
					});
				},
			},
			{
				active: block.use_custom_fields && !isRichTextEmpty(block.custom_description),
				label: t('assignment/views/assignment-edit___aangepast'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: true,
						custom_title: block.original_title || block.item?.title,
						custom_description: block.original_description || block.item?.description,
					});
				},
			},
			{
				active: block.use_custom_fields && isRichTextEmpty(block.custom_description),
				label: t('assignment/views/assignment-edit___geen-beschrijving'),
				onClick: () => {
					setBlock(block, {
						use_custom_fields: true,
						custom_title: block.original_title || block.item?.title,
						custom_description: '',
					});
				},
			},
		],
		[setBlock, t]
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
		() => (
			<Flex center className="u-spacer-top-l">
				<Icon name="clipboard" size="large" />

				<BlockHeading className="u-spacer-left" type="h2">
					<Controller
						name="title"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<>
								<ContentInput
									{...field}
									placeholder={t(
										'assignment/views/assignment-edit___placeholder'
									)}
									nodeCancel={<Icon name="x" size="small" />}
									nodeSubmit={<Icon name="check" size="small" />}
									onChange={(title) => {
										field.onChange(title);
										setAssignment((previous) => {
											return {
												...previous,
												title,
											};
										});
									}}
								/>

								{error && <span className="c-floating-error">{error.message}</span>}
							</>
						)}
					/>
				</BlockHeading>
			</Flex>
		),
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

	const renderMeta = useCallback(
		(block: AssignmentBlock) => {
			const organisation = block.item?.organisation?.name;
			const publishedAt = block.item?.published_at;
			const series = block.item?.series; // TODO: determine & configure corresponding meta field

			return organisation || publishedAt || series ? (
				<section className="u-spacer-bottom">
					{organisation && (
						<div>
							{t('assignment/views/assignment-edit___uitzender')}:{` ${organisation}`}
						</div>
					)}

					{publishedAt && (
						<div>
							{t('assignment/views/assignment-edit___uitgezonden')}:
							{` ${formatDate(publishedAt)}`}
						</div>
					)}

					{series && (
						<div>
							{t('assignment/views/assignment-edit___reeks')}:{' '}
							<Link
								target="_blank"
								to={buildLink(APP_PATH.SEARCH.route, undefined, {
									filters: JSON.stringify({
										[SEARCH_FILTER_STATE_SERIES_PROP]: [series],
									}),
								})}
							>
								{series}
							</Link>
						</div>
					)}
				</section>
			) : null;
		},
		[t]
	);

	const renderBlockContent = useCallback(
		(block: AssignmentBlock) => {
			switch (block.type) {
				case AssignmentBlockType.TEXT:
					return (
						<TitleDescriptionForm
							className="u-padding-l"
							id={block.id}
							title={{
								label: t('assignment/views/assignment-edit___titel'),
								placeholder: t(
									'assignment/views/assignment-edit___instructies-of-omschrijving'
								),
								value: block.custom_title,
								onChange: (value) => setBlock(block, { custom_title: value }),
							}}
							description={{
								placeholder: t(
									'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
								),
								initialHtml: convertToHtml(block.custom_description),
								controls: WYSIWYG_OPTIONS_AUTHOR,
								onChange: (value) =>
									setBlock(block, {
										custom_description: value.toHTML(),
									}),
							}}
						/>
					);

				case AssignmentBlockType.ITEM:
					if (!block.item) {
						return null;
					}

					return (
						<CustomiseItemForm
							className="u-padding-l"
							id={block.item.id}
							preview={() => {
								const item = block.item as ItemSchema;

								return (
									<FlowPlayerWrapper
										item={item}
										poster={item.thumbnail_path}
										external_id={item.external_id}
										duration={item.duration}
										title={item.title}
										cuePoints={{
											start: block.start_oc,
											end: block.end_oc,
										}}
									/>
								);
							}}
							buttons={{
								label: t(
									'assignment/views/assignment-edit___titel-en-beschrijving'
								),
								items: fragmentSwitchButtons(block),
							}}
							title={{
								label: t('assignment/views/assignment-edit___titel-fragment'),
								placeholder: t(
									'assignment/views/assignment-edit___instructies-of-omschrijving'
								),
								value: !block.use_custom_fields
									? block.original_title || block.item?.title
									: block.custom_title,
								disabled: !block.use_custom_fields,
								onChange: (value) => setBlock(block, { custom_title: value }),
							}}
							description={
								!isRichTextEmpty(block.custom_description) ||
								!block.use_custom_fields
									? {
											label: t(
												'assignment/views/assignment-edit___beschrijving-fragment'
											),
											initialHtml: convertToHtml(
												!block.use_custom_fields
													? block.original_description ||
															block.item?.description
													: block.custom_description
											),
											controls: WYSIWYG_OPTIONS_AUTHOR,
											disabled: !block.use_custom_fields,
											onChange: (value) =>
												setBlock(block, {
													custom_description: value.toHTML(),
												}),
									  }
									: undefined
							}
						>
							{renderMeta(block)}
						</CustomiseItemForm>
					);

				default:
					break;
			}
		},
		[t, setBlock, fragmentSwitchButtons, renderMeta]
	);

	const renderTabs = useMemo(
		() => <Tabs tabs={tabs} onClick={onTabClick}></Tabs>,
		[tabs, onTabClick]
	);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud:
				return (
					<div className="c-assignment-contents-tab">
						<AssignmentBlockListSorter
							heading={(item) => item && EDIT_ASSIGNMENT_BLOCK_LABELS(t)[item.type]}
							divider={(item) => (
								<Button
									icon="plus"
									type="secondary"
									onClick={() => {
										setAddBlockModalPosition(item?.position);
										setAddBlockModalOpen(true);
									}}
								/>
							)}
							content={(item) => item && renderBlockContent(item)}
							items={listSorterItems}
						/>
					</div>
				);

			case ASSIGNMENT_CREATE_UPDATE_TABS.Details:
				// This form receives its parent's state because we don't care about rerender performance here
				return (
					<div className="c-assignment-details-tab">
						<AssignmentDetailsForm
							state={[assignment, setAssignment]}
							initial={defaultValues}
							{...fields}
						/>
					</div>
				);

			default:
				return tab;
		}
	}, [
		tab,
		defaultValues,
		assignment,
		setAssignment,
		fields,
		listSorterItems,
		t,
		renderBlockContent,
		setAddBlockModalOpen,
		setAddBlockModalPosition,
	]);

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

			{original && (
				<ConfirmSliceModal
					isOpen={!!isConfirmSliceModalOpen}
					assignment={original}
					block={getConfirmSliceModalBlock as AssignmentBlock}
					onClose={() => setConfirmSliceModalOpen(false)}
					onConfirm={() => {
						const blocks = assignment.blocks.filter(
							(item) => item.id !== getConfirmSliceModalBlock?.id
						);

						setAssignment((prev) => ({
							...prev,
							blocks,
						}));

						setValue('blocks', blocks, { shouldDirty: true, shouldTouch: true });
						setConfirmSliceModalOpen(false);
					}}
				/>
			)}

			{assignment && (
				<AddBlockModal
					isOpen={!!isAddBlockModalOpen}
					assignment={assignment}
					onClose={() => setAddBlockModalOpen(false)}
					onConfirm={(type) => {
						if (getAddBlockModalPosition === undefined) {
							return;
						}

						switch (type) {
							case AssignmentBlockType.TEXT:
							case AssignmentBlockType.ZOEK:
								const blocks = insertAtPosition(assignment.blocks, {
									type,
									position: getAddBlockModalPosition,
								} as AssignmentBlock); // TODO: avoid cast

								setAssignment((prev) => ({
									...prev,
									blocks,
								}));

								setValue('blocks', blocks, {
									shouldDirty: true,
									shouldTouch: true,
								});
								break;

							default:
								break;
						}

						setAddBlockModalOpen(false);
					}}
				/>
			)}
		</div>
	);

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
