import { cloneDeep, get, map } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useReducer, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Step } from 'react-joyride';

import {
	BlockHeading,
	Box,
	Button,
	Container,
	Form,
	FormGroup,
	Icon,
	IconName,
	Panel,
	PanelBody,
	PanelHeader,
	Select,
	SelectOption,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	WYSIWYG,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink, CustomError, navigate } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { ValueOf } from '../../../shared/types';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import InteractiveTourAdd from '../components/InteractiveTourStepAdd';
import { INITIAL_INTERACTIVE_TOUR, INTERACTIVE_TOUR_PATH } from '../interactive-tour.const';
import { GET_INTERACTIVE_TOUR_BY_ID } from '../interactive-tour.gql';
import { InteractiveTourService } from '../interactive-tour.service';
import { InteractiveTour, InteractiveTourEditFormErrorState } from '../interactive-tour.types';

type StepPropUpdateAction = {
	type: 'UPDATE_STEP_PROP';
	stepIndex: number;
	stepProp: keyof Step;
	stepPropValue: ValueOf<Step>;
};

type StepSwapAction = {
	type: 'SWAP_STEPS';
	index: number;
	direction: 'up' | 'down';
};

type StepRemoveAction = {
	type: 'REMOVE_STEP';
	index: number;
};

type InteractiveTourUpdateAction = {
	type: 'UPDATE_INTERACTIVE_TOUR';
	newInteractiveTour: InteractiveTour | null;
	updateInitialInteractiveTour?: boolean;
};

type InteractiveTourPropUpdateAction = {
	type: 'UPDATE_INTERACTIVE_TOUR_PROP';
	interactiveTourProp: keyof InteractiveTour;
	interactiveTourPropValue: ValueOf<InteractiveTour>;
	updateInitialInteractiveTour?: boolean;
};

export type InteractiveTourAction =
	| StepPropUpdateAction
	| StepSwapAction
	| StepRemoveAction
	| InteractiveTourUpdateAction
	| InteractiveTourPropUpdateAction;

interface InteractiveTourState {
	currentInteractiveTour: InteractiveTour | null;
	initialInteractiveTour: InteractiveTour | null;
}

interface InteractiveTourEditProps extends DefaultSecureRouteProps<{ id: string }> {}

const InteractiveTourEdit: FunctionComponent<InteractiveTourEditProps> = ({
	history,
	match,
	location,
}) => {
	const [t] = useTranslation();

	// Hooks
	const [formErrors, setFormErrors] = useState<InteractiveTourEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);

	// Main interactiveTour reducer
	function currentInteractiveTourReducer(
		interactiveTourState: InteractiveTourState,
		action: InteractiveTourAction
	): InteractiveTourState {
		if (action.type === 'UPDATE_INTERACTIVE_TOUR') {
			return {
				currentInteractiveTour: action.newInteractiveTour,
				initialInteractiveTour: cloneDeep(action.newInteractiveTour),
			};
		}

		const newCurrentInteractiveTour: InteractiveTour | null = cloneDeep(
			interactiveTourState.currentInteractiveTour
		);
		const newInitialInteractiveTour: InteractiveTour | null = cloneDeep(
			interactiveTourState.initialInteractiveTour
		);

		if (!newCurrentInteractiveTour) {
			ToastService.danger(t('De interactieve tour is nog niet geladen'));
			return interactiveTourState;
		}

		switch (action.type) {
			case 'UPDATE_STEP_PROP':
				newCurrentInteractiveTour.steps[action.stepIndex] = {
					...newCurrentInteractiveTour.steps[action.stepIndex],
					[action.stepProp]: action.stepPropValue,
				};
				break;

			case 'SWAP_STEPS':
				if (!newCurrentInteractiveTour.steps || !newCurrentInteractiveTour.steps.length) {
					ToastService.danger(t('Deze interactive tour lijkt geen stappen te bevatten'));
					return interactiveTourState;
				}

				const delta = action.direction === 'up' ? 1 : -1;

				newCurrentInteractiveTour.steps = InteractiveTourService.swapStepPositions(
					newCurrentInteractiveTour.steps || [],
					action.index,
					delta
				);
				break;

			case 'REMOVE_STEP':
				const newSteps = newCurrentInteractiveTour.steps;
				newSteps.splice(action.index, 1);
				newCurrentInteractiveTour.steps = newSteps;
				break;

			case 'UPDATE_INTERACTIVE_TOUR_PROP':
				(newCurrentInteractiveTour as any)[action.interactiveTourProp] =
					action.interactiveTourPropValue;
				if (action.updateInitialInteractiveTour) {
					(newInitialInteractiveTour as any)[action.interactiveTourProp] =
						action.interactiveTourPropValue;
				}
				break;
		}

		return {
			currentInteractiveTour: newCurrentInteractiveTour,
			initialInteractiveTour: newInitialInteractiveTour,
		};
	}

	const [interactiveTourState, changeInteractiveTourState] = useReducer<
		React.Reducer<InteractiveTourState, InteractiveTourAction>
	>(currentInteractiveTourReducer, {
		currentInteractiveTour: null,
		initialInteractiveTour: null,
	});

	const initOrFetchInteractiveTour = useCallback(async () => {
		if (isCreatePage) {
			changeInteractiveTourState({
				type: 'UPDATE_INTERACTIVE_TOUR',
				newInteractiveTour: INITIAL_INTERACTIVE_TOUR,
				updateInitialInteractiveTour: true,
			});
		} else {
			try {
				const response = await dataService.query({
					query: GET_INTERACTIVE_TOUR_BY_ID,
					variables: { id: match.params.id },
				});

				const interactiveTourObj = get(response, 'data.app_interactive_tour[0]');

				if (!interactiveTourObj) {
					setLoadingInfo({
						state: 'error',
						icon: 'search',
						message: t('Deze interactieve tour werd niet gevonden'),
					});
					return;
				}

				changeInteractiveTourState({
					type: 'UPDATE_INTERACTIVE_TOUR',
					newInteractiveTour: interactiveTourObj,
					updateInitialInteractiveTour: true,
				});
			} catch (err) {
				console.error(
					new CustomError('Failed to get interactive tour by id', err, {
						query: 'GET_INTERACTIVE_TOUR_BY_ID',
						variables: { id: match.params.id },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t('Het ophalen van de interactive tour is mislukt'),
				});
			}
		}
	}, [setLoadingInfo, changeInteractiveTourState, t, isCreatePage, match.params.id]);

	useEffect(() => {
		initOrFetchInteractiveTour();
	}, [initOrFetchInteractiveTour]);

	useEffect(() => {
		if (interactiveTourState.currentInteractiveTour) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [interactiveTourState.currentInteractiveTour, setLoadingInfo]);

	const navigateBack = () => {
		if (isCreatePage) {
			history.push(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW);
		} else {
			navigate(history, INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL, {
				id: match.params.id,
			});
		}
	};

	const getFormErrors = (): InteractiveTourEditFormErrorState | null => {
		if (
			!interactiveTourState.currentInteractiveTour ||
			!interactiveTourState.currentInteractiveTour.name
		) {
			return {
				name: t('Een naam is verplicht'),
			};
		}
		if (
			!interactiveTourState.currentInteractiveTour ||
			!interactiveTourState.currentInteractiveTour.page
		) {
			return {
				page: t('Een pagina is verplicht'),
			};
		}
		return null;
	};

	const handleSave = async () => {
		try {
			const errors = getFormErrors();
			setFormErrors(errors || {});
			if (errors) {
				ToastService.danger(t('De invoer is ongeldig'), false);
				return;
			}

			if (
				!interactiveTourState.initialInteractiveTour ||
				!interactiveTourState.currentInteractiveTour
			) {
				ToastService.danger(
					t(
						'Het opslaan van de interactive tour is mislukt omdat de interactive tour nog niet is geladen'
					),
					false
				);
				return;
			}

			setIsSaving(true);

			let interactiveTourId: number | string;
			if (isCreatePage) {
				// insert the permission group
				interactiveTourId = await InteractiveTourService.insertInteractiveTour(
					interactiveTourState.currentInteractiveTour
				);
			} else {
				// Update existing permission group
				await InteractiveTourService.updateInteractiveTour(
					interactiveTourState.currentInteractiveTour
				);
				interactiveTourId = match.params.id;
			}

			if (isCreatePage) {
				redirectToClientPage(
					buildLink(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT, {
						id: interactiveTourId,
					}),
					history
				);
			} else {
				await initOrFetchInteractiveTour();
			}
			ToastService.success(t('De Interactive tour is opgeslagen'), false);
		} catch (err) {
			console.error(
				new CustomError('Failed to save interactive tour', err, {
					currentInteractiveTour: interactiveTourState.currentInteractiveTour,
					initialInteractiveTour: interactiveTourState.initialInteractiveTour,
				})
			);
			ToastService.danger(t('Het opslaan van de interactive tour is mislukt'), false);
		}
		setIsSaving(false);
	};

	const renderReorderButton = (step: Step, direction: 'up' | 'down', disabled: boolean) => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			onClick={() => {
				console.info(step);
			}}
			disabled={disabled}
		/>
	);

	const renderStep = (step: Step, index: number) => {
		if (!interactiveTourState.currentInteractiveTour) {
			return null;
		}
		return (
			<>
				<Panel>
					<PanelHeader>
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<div className="c-button-toolbar">
										{renderReorderButton(step, 'up', index === 0)}
										{renderReorderButton(
											step,
											'down',
											index ===
												(
													interactiveTourState.currentInteractiveTour
														.steps || []
												).length -
													1
										)}
									</div>
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<Button
										icon="trash-2"
										type="danger"
										onClick={() => {
											changeInteractiveTourState({
												type: 'REMOVE_STEP',
												index,
											});
										}}
										ariaLabel={t('Verwijder stap')}
										title={t('Verwijder stap')}
									/>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</PanelHeader>
					<PanelBody>
						<Form>
							<FormGroup label={t('Titel')}>
								<TextInput
									value={(step.title || '').toString()}
									onChange={newTitle => {
										changeInteractiveTourState({
											type: 'UPDATE_STEP_PROP',
											stepIndex: index,
											stepProp: 'title',
											stepPropValue: newTitle,
										});
									}}
								/>
							</FormGroup>
							<FormGroup label={t('Tekst')} required>
								<WYSIWYG
									data={(step.content || '').toString()}
									onChange={newContent => {
										changeInteractiveTourState({
											type: 'UPDATE_STEP_PROP',
											stepIndex: index,
											stepProp: 'content',
											stepPropValue: newContent,
										});
									}}
									id={`content_editor_${index}`}
									placeholder={t('Vul een stap tekst in')}
								/>
							</FormGroup>

							<FormGroup label={t('Element css selector')}>
								<TextInput
									value={(step.target || '').toString()}
									onChange={newTarget => {
										changeInteractiveTourState({
											type: 'UPDATE_STEP_PROP',
											stepIndex: index,
											stepProp: 'target',
											stepPropValue: newTarget,
										});
									}}
								/>
								<Tooltip position="top">
									<TooltipTrigger>
										<span>
											<Icon
												className="a-info-icon"
												name="info"
												size="small"
											/>
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											<Trans>
												Je kan een element selector kopieren door:
												<ul>
													<li>
														* Klik rechts op een element op de website
													</li>
													<li>* Kies "element inspecteren"</li>
													<li>
														* Klik rechts op de geselecteerde html code
														in het nieuwe venster
													</li>
													<li>
														* Klik rechts op de geselecteerde html code
														in het nieuwe venster
													</li>
													<li>
														* Kies kopieer => kopieer element selector
													</li>
													<li>* Plak de waarde in dit tekst veld</li>
												</ul>
											</Trans>
										</p>
									</TooltipContent>
								</Tooltip>
							</FormGroup>
						</Form>
					</PanelBody>
				</Panel>
				<InteractiveTourAdd
					index={index + 1}
					interactiveTour={interactiveTourState.currentInteractiveTour}
					changeInteractiveTourState={changeInteractiveTourState}
				/>
			</>
		);
	};

	const renderEditPage = () => {
		if (!interactiveTourState.currentInteractiveTour) {
			return;
		}
		return (
			<>
				<Container size="medium">
					<Spacer margin="bottom-extra-large">
						<Box backgroundColor="gray">
							<Form>
								<FormGroup label={t('Naam')} error={formErrors.name}>
									<TextInput
										value={
											interactiveTourState.currentInteractiveTour.name || ''
										}
										onChange={newName =>
											changeInteractiveTourState({
												type: 'UPDATE_INTERACTIVE_TOUR_PROP',
												interactiveTourProp: 'name',
												interactiveTourPropValue: newName,
											})
										}
									/>
								</FormGroup>
								<FormGroup label={t('Pagina')} error={formErrors.page}>
									<Select
										options={map(
											APP_PATH,
											(route, routeId): SelectOption => ({
												label: route.route,
												value: routeId,
											})
										)}
										value={
											interactiveTourState.currentInteractiveTour.page || ''
										}
										onChange={newPage =>
											changeInteractiveTourState({
												type: 'UPDATE_INTERACTIVE_TOUR_PROP',
												interactiveTourProp: 'page',
												interactiveTourPropValue: newPage,
											})
										}
									/>
								</FormGroup>
							</Form>
						</Box>
					</Spacer>
				</Container>
				<BlockHeading type="h3">{t('Stappen')}</BlockHeading>
				<InteractiveTourAdd
					index={0}
					interactiveTour={interactiveTourState.currentInteractiveTour}
					changeInteractiveTourState={changeInteractiveTourState}
				/>
				{(interactiveTourState.currentInteractiveTour.steps || []).map(renderStep)}
			</>
		);
	};

	// Render
	const renderPage = () => (
		<AdminLayout showBackButton pageTitle={t('Interactive tour aanpassen')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">{renderEditPage()}</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button label={t('Annuleer')} onClick={navigateBack} type="tertiary" />
				<Button disabled={isSaving} label={t('Opslaan')} onClick={handleSave} />
			</AdminLayoutActions>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={interactiveTourState.currentInteractiveTour}
			render={renderPage}
		/>
	);
};

export default InteractiveTourEdit;
