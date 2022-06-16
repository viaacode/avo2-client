import { yupResolver } from '@hookform/resolvers/yup';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
	BlockHeading,
	Button,
	Container,
	ContentInput,
	Flex,
	Icon,
	StickyEdgeBar,
	Tabs,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { buildLink, navigate } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { ASSIGNMENT_FORM_DEFAULT, ASSIGNMENT_FORM_SCHEMA } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import { AssignmentFormState } from '../assignment.types';
import AssignmentHeading from '../components/AssignmentHeading';
import { useAssignmentLesgeverTabs } from '../hooks';

import './AssignmentCreate.scss';
import './AssignmentPage.scss';

const AssignmentCreate: FunctionComponent<DefaultSecureRouteProps> = ({ user, history }) => {
	const [t] = useTranslation();

	// Data
	const [defaultValues] = useState<AssignmentFormState>(ASSIGNMENT_FORM_DEFAULT(t));
	const [assignment, setAssignment] = useState<AssignmentFormState>(defaultValues);

	const {
		setValue,
		control,
		getValues,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm<AssignmentFormState>({
		defaultValues,
		resolver: yupResolver(ASSIGNMENT_FORM_SCHEMA(t)),
	});

	// UI
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tabs, , , onTabClick] = useAssignmentLesgeverTabs();

	// Effects

	// Synchronise the React state that triggers renders with the useForm hook
	useEffect(() => {
		Object.keys(assignment).forEach((key) => {
			const cast = key as keyof AssignmentFormState;
			setValue(cast, assignment[cast]);
		});
	}, [assignment, setValue]);

	// Set the loading state when the form is ready
	useEffect(() => {
		if (loadingInfo.state !== 'loaded') {
			assignment && setLoadingInfo({ state: 'loaded' });
		}
	}, [assignment, loadingInfo, setLoadingInfo]);

	// Events

	const submit = async () => {
		try {
			const created = await AssignmentService.insertAssignment({
				...assignment,
				owner_profile_id: user.profile?.id,
			});

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
		setAssignment(defaultValues);
		resetForm();
	}, [resetForm, setAssignment, defaultValues]);

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
									placeholder={t('placeholder')}
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
		[t, control]
	);

	// These actions are just UI, they are disabled because they can't be used during creation
	const renderActions = useMemo(
		() => (
			<>
				<Button
					disabled
					label={t('assignment/views/assignment-edit___bekijk-als-leerling')}
					title={t(
						'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
					)}
					ariaLabel={t(
						'assignment/views/assignment-edit___bekijk-de-opdracht-zoals-een-leerling-die-zal-zien'
					)}
					type="secondary"
				/>
				<Button
					disabled
					icon="more-horizontal"
					type="secondary"
					ariaLabel={t('assignment/views/assignment-detail___meer-opties')}
					title={t('assignment/views/assignment-detail___meer-opties')}
				/>
				<Button
					ariaLabel={t('assignment/views/assignment-create___delen-met-leerlingen')}
					title={t('assignment/views/assignment-create___delen-met-leerlingen')}
					label={t('assignment/views/assignment-create___delen-met-leerlingen')}
					disabled
				/>
			</>
		),
		[t]
	);

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick}></Tabs>, [
		tabs,
		onTabClick,
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
				<p>state: {JSON.stringify(assignment)}</p>

				<p>form: {JSON.stringify(getValues())}</p>

				<p style={{ color: 'red' }}>errors: {JSON.stringify(errors)}</p>

				<StickyEdgeBar>
					<p>
						<strong>{t('Opdracht opslaan?')}</strong>
					</p>

					<Button label={t('Annuleer')} onClick={() => reset()} />

					<Button
						type="tertiary"
						label={t('Opslaan')}
						onClick={handleSubmit(submit, (...args) => console.error(args))}
					/>
				</StickyEdgeBar>
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

export default AssignmentCreate;
