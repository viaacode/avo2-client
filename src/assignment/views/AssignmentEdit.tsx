import { yupResolver } from '@hookform/resolvers/yup';
import { isPast } from 'date-fns/esm';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
	Alert,
	BlockHeading,
	Button,
	Container,
	ContentInput,
	Flex,
	Icon,
	Spacer,
	StickyEdgeBar,
	Tabs,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { ROUTE_PARTS } from '../../shared/constants';
import { buildLink, CustomError, navigate } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_CREATE_UPDATE_TABS,
	ASSIGNMENT_FORM_FIELDS,
	ASSIGNMENT_FORM_SCHEMA,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentFormState } from '../assignment.types';
import AssignmentDetailsForm from '../components/AssignmentDetailsForm';
import AssignmentHeading from '../components/AssignmentHeading';
import { useAssignmentForm, useAssignmentLesgeverTabs } from '../hooks';

import './AssignmentEdit.scss';
import './AssignmentPage.scss';

const AssignmentEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	user,
	history,
}) => {
	const [t] = useTranslation();

	// Data
	const [original, setOriginal] = useState<AssignmentFormState | undefined>(undefined);
	const [assignment, setAssignment, defaultValues] = useAssignmentForm(undefined);

	const form = useForm<AssignmentFormState>({
		defaultValues: original,
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

	// UI
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, tab, , onTabClick] = useAssignmentLesgeverTabs();

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

	/**
	 *  Get query string variables and fetch the existing object
	 */
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

	// Events

	const submit = async () => {
		try {
			const created = await AssignmentService.updateAssignment(
				{
					...assignment,
					owner_profile_id: user.profile?.id,
					labels: [],
				},
				(original?.labels || []).map((item) => item.assignment_label),
				assignment.labels.map((item) => item.assignment_label)
			);

			if (created) {
				trackEvents(
					{
						object: String(created.id),
						object_type: 'assignment',
						action: 'create',
					},
					user
				);

				ToastService.success(
					t('assignment/views/assignment-edit___de-opdracht-is-succesvol-aangemaakt')
				);

				// Disable while dev
				console.info(() =>
					navigate(history, APP_PATH.ASSIGNMENT_EDIT.route, { id: created.id })
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
					></Controller>
				</BlockHeading>
			</Flex>
		),
		[t, control, setAssignment]
	);

	// These actions are just UI, they are disabled because they can't be used during creation
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

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick}></Tabs>, [
		tabs,
		onTabClick,
	]);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_CREATE_UPDATE_TABS.Inhoud:
				return 'inhoud';

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
	}, [tab, defaultValues, assignment, setAssignment, fields]);

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
					<Spacer margin={['top-large', 'bottom-large']}>
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
