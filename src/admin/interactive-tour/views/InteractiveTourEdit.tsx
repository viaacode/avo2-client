import { cloneDeep, compact, get, map, orderBy } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Box,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FlexItem,
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
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink, CustomError, navigate, sanitize } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { ValueOf } from '../../../shared/types';
import { ContentPicker } from '../../shared/components/ContentPicker/ContentPicker';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import InteractiveTourAdd from '../components/InteractiveTourStepAdd';
import { getInitialInteractiveTour, INTERACTIVE_TOUR_PATH } from '../interactive-tour.const';
import { GET_INTERACTIVE_TOUR_BY_ID } from '../interactive-tour.gql';
import { InteractiveTourService } from '../interactive-tour.service';
import {
	InteractiveTourEditFormErrorState,
	InteractiveTourPageType,
} from '../interactive-tour.types';

import './InteractiveTourEdit.scss';

type StepPropUpdateAction = {
	type: 'UPDATE_STEP_PROP';
	stepIndex: number;
	stepProp: keyof Avo.InteractiveTour.Step;
	stepPropValue: ValueOf<Avo.InteractiveTour.Step>;
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
	newInteractiveTour: Avo.InteractiveTour.InteractiveTour | null;
	updateInitialInteractiveTour?: boolean;
};

type InteractiveTourPropUpdateAction = {
	type: 'UPDATE_INTERACTIVE_TOUR_PROP';
	interactiveTourProp: keyof Avo.InteractiveTour.InteractiveTour;
	interactiveTourPropValue: ValueOf<Avo.InteractiveTour.InteractiveTour>;
	updateInitialInteractiveTour?: boolean;
};

export type InteractiveTourAction =
	| StepPropUpdateAction
	| StepSwapAction
	| StepRemoveAction
	| InteractiveTourUpdateAction
	| InteractiveTourPropUpdateAction;

interface InteractiveTourState {
	currentInteractiveTour: Avo.InteractiveTour.InteractiveTour | null;
	initialInteractiveTour: Avo.InteractiveTour.InteractiveTour | null;
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
	const [selectedPageType, setSelectedPageType] = useState<InteractiveTourPageType>('static');

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

		const newCurrentInteractiveTour: Avo.InteractiveTour.InteractiveTour | null = cloneDeep(
			interactiveTourState.currentInteractiveTour
		);
		const newInitialInteractiveTour: Avo.InteractiveTour.InteractiveTour | null = cloneDeep(
			interactiveTourState.initialInteractiveTour
		);

		if (!newCurrentInteractiveTour) {
			ToastService.danger(
				t(
					'admin/interactive-tour/views/interactive-tour-edit___de-interactieve-tour-is-nog-niet-geladen'
				)
			);
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
					ToastService.danger(
						t(
							'admin/interactive-tour/views/interactive-tour-edit___deze-interactive-tour-lijkt-geen-stappen-te-bevatten'
						)
					);
					return interactiveTourState;
				}

				const delta = action.direction === 'up' ? -1 : 1;

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

	/**
	 * Returns a list op select options for all pages that can have an interactive tour sorted by label
	 */
	const getPageOptions = useCallback((): SelectOption<string>[] => {
		return orderBy(
			compact(
				map(APP_PATH, (routeInfo, routeId): SelectOption<string> | null => {
					if (routeInfo.showForInteractiveTour) {
						return {
							label: routeInfo.route,
							value: routeId,
						};
					}
					return null;
				})
			),
			['label'],
			['asc']
		);
	}, []);

	const getPageType = useCallback(
		(pageId: string): InteractiveTourPageType => {
			const staticPageIds = getPageOptions().map(pageOption => pageOption.value);
			return staticPageIds.includes(pageId) ? 'static' : 'content';
		},
		[getPageOptions]
	);

	const initOrFetchInteractiveTour = useCallback(async () => {
		if (isCreatePage) {
			changeInteractiveTourState({
				type: 'UPDATE_INTERACTIVE_TOUR',
				newInteractiveTour: getInitialInteractiveTour(),
				updateInitialInteractiveTour: true,
			});
		} else {
			try {
				const response = await dataService.query({
					query: GET_INTERACTIVE_TOUR_BY_ID,
					variables: { id: match.params.id },
				});

				const interactiveTourObj: Avo.InteractiveTour.InteractiveTour | undefined = get(
					response,
					'data.app_interactive_tour[0]'
				);

				if (!interactiveTourObj) {
					setLoadingInfo({
						state: 'error',
						icon: 'search',
						message: t(
							'admin/interactive-tour/views/interactive-tour-edit___deze-interactieve-tour-werd-niet-gevonden'
						),
					});
					return;
				}

				changeInteractiveTourState({
					type: 'UPDATE_INTERACTIVE_TOUR',
					newInteractiveTour: interactiveTourObj,
					updateInitialInteractiveTour: true,
				});
				setSelectedPageType(getPageType(interactiveTourObj.page_id));
			} catch (err) {
				console.error(
					new CustomError('Failed to get interactive tour by id', err, {
						query: 'GET_INTERACTIVE_TOUR_BY_ID',
						variables: { id: match.params.id },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t(
						'admin/interactive-tour/views/interactive-tour-edit___het-ophalen-van-de-interactive-tour-is-mislukt'
					),
				});
			}
		}
	}, [setLoadingInfo, changeInteractiveTourState, t, isCreatePage, getPageType, match.params.id]);

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
				name: t(
					'admin/interactive-tour/views/interactive-tour-edit___een-naam-is-verplicht'
				),
			};
		}
		if (
			!interactiveTourState.currentInteractiveTour ||
			!interactiveTourState.currentInteractiveTour.page_id
		) {
			return {
				page_id: t(
					'admin/interactive-tour/views/interactive-tour-edit___een-pagina-is-verplicht'
				),
			};
		}
		return null;
	};

	const handleSave = async () => {
		try {
			const errors = getFormErrors();
			setFormErrors(errors || {});
			if (errors) {
				ToastService.danger(
					t('admin/interactive-tour/views/interactive-tour-edit___de-invoer-is-ongeldig'),
					false
				);
				return;
			}

			if (
				!interactiveTourState.initialInteractiveTour ||
				!interactiveTourState.currentInteractiveTour
			) {
				ToastService.danger(
					t(
						'admin/interactive-tour/views/interactive-tour-edit___het-opslaan-van-de-interactive-tour-is-mislukt-omdat-de-interactive-tour-nog-niet-is-geladen'
					),
					false
				);
				return;
			}

			setIsSaving(true);

			let interactiveTourId: number | string;
			if (isCreatePage) {
				// insert the interactive tour
				interactiveTourId = await InteractiveTourService.insertInteractiveTour(
					interactiveTourState.currentInteractiveTour
				);
			} else {
				// Update existing interactive tour
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
			ToastService.success(
				t(
					'admin/interactive-tour/views/interactive-tour-edit___de-interactive-tour-is-opgeslagen'
				),
				false
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to save interactive tour', err, {
					currentInteractiveTour: interactiveTourState.currentInteractiveTour,
					initialInteractiveTour: interactiveTourState.initialInteractiveTour,
				})
			);
			ToastService.danger(
				t(
					'admin/interactive-tour/views/interactive-tour-edit___het-opslaan-van-de-interactive-tour-is-mislukt'
				),
				false
			);
		}
		setIsSaving(false);
	};

	const handleContentPageSelect = (item: PickerItem | null) => {
		if (!item) {
			return;
		}
		changeInteractiveTourState({
			type: 'UPDATE_INTERACTIVE_TOUR_PROP',
			interactiveTourProp: 'page_id',
			interactiveTourPropValue: item.value,
		});
	};

	const handleStaticPageSelect = (newPageId: string) => {
		changeInteractiveTourState({
			type: 'UPDATE_INTERACTIVE_TOUR_PROP',
			interactiveTourProp: 'page_id',
			interactiveTourPropValue: newPageId,
		});
	};

	const getContentPickerInitialValue = (): PickerItem | undefined => {
		if (selectedPageType === 'content' && interactiveTourState.currentInteractiveTour) {
			return {
				value: interactiveTourState.currentInteractiveTour.page_id,
				label: interactiveTourState.currentInteractiveTour.page_id,
				type: 'CONTENT_PAGE',
			};
		}
		return undefined;
	};

	const renderReorderButton = (index: number, direction: 'up' | 'down', disabled: boolean) => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			title={
				direction === 'up'
					? t('admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-boven')
					: t('admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-onder')
			}
			ariaLabel={
				direction === 'up'
					? t('admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-boven')
					: t('admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-onder')
			}
			onClick={() => {
				changeInteractiveTourState({
					direction,
					index,
					type: 'SWAP_STEPS',
				});
			}}
			disabled={disabled}
		/>
	);

	const renderStep = (step: Avo.InteractiveTour.Step, index: number) => {
		if (!interactiveTourState.currentInteractiveTour) {
			return null;
		}
		return (
			<div key={`step_${step.id}`}>
				<Panel>
					<PanelHeader>
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<div className="c-button-toolbar">
										{renderReorderButton(index, 'up', index === 0)}
										{renderReorderButton(
											index,
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
												index,
												type: 'REMOVE_STEP',
											});
										}}
										ariaLabel={t(
											'admin/interactive-tour/views/interactive-tour-edit___verwijder-stap'
										)}
										title={t(
											'admin/interactive-tour/views/interactive-tour-edit___verwijder-stap'
										)}
									/>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</PanelHeader>
					<PanelBody>
						<Form>
							<FormGroup
								label={t(
									'admin/interactive-tour/views/interactive-tour-edit___titel'
								)}
							>
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
							<FormGroup
								label={t(
									'admin/interactive-tour/views/interactive-tour-edit___tekst'
								)}
								required
							>
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
									placeholder={t(
										'admin/interactive-tour/views/interactive-tour-edit___vul-een-stap-tekst-in'
									)}
								/>
							</FormGroup>

							<FormGroup
								label={t(
									'admin/interactive-tour/views/interactive-tour-edit___element-css-selector'
								)}
							>
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
										<Spacer padding="small">
											<div
												dangerouslySetInnerHTML={{
													__html: sanitize(
														t(
															'admin/interactive-tour/views/interactive-tour-edit___hoe-kopieer-je-een-css-selector'
														)
													),
												}}
											/>
										</Spacer>
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
			</div>
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
								<FormGroup
									label={t(
										'admin/interactive-tour/views/interactive-tour-edit___naam'
									)}
									error={formErrors.name}
								>
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
								<FormGroup
									label={t(
										'admin/interactive-tour/views/interactive-tour-edit___pagina'
									)}
									error={formErrors.page_id}
								>
									<Flex>
										<FlexItem>
											<Select
												options={[
													{
														value: 'static',
														label: t(
															'admin/interactive-tour/views/interactive-tour-edit___statische-pagina'
														),
													},
													{
														value: 'content',
														label: t(
															'admin/interactive-tour/views/interactive-tour-edit___content-pagina'
														),
													},
												]}
												value={selectedPageType}
												onChange={value =>
													setSelectedPageType(
														value as InteractiveTourPageType
													)
												}
											/>
										</FlexItem>
										<FlexItem>
											<Spacer margin="left-small">
												{selectedPageType === 'static' && (
													<Select
														options={getPageOptions()}
														value={
															interactiveTourState
																.currentInteractiveTour.page_id ||
															''
														}
														onChange={handleStaticPageSelect}
													/>
												)}
												{selectedPageType === 'content' && (
													<ContentPicker
														initialValue={getContentPickerInitialValue()}
														onSelect={handleContentPageSelect}
														allowedTypes={['CONTENT_PAGE']}
														hideTypeDropdown
													/>
												)}
											</Spacer>
										</FlexItem>
									</Flex>
								</FormGroup>
							</Form>
						</Box>
					</Spacer>
				</Container>
				<BlockHeading type="h3">
					{t('admin/interactive-tour/views/interactive-tour-edit___stappen')}
				</BlockHeading>
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
		<AdminLayout
			showBackButton
			pageTitle={t(
				'admin/interactive-tour/views/interactive-tour-edit___interactive-tour-aanpassen'
			)}
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						label={t('admin/interactive-tour/views/interactive-tour-edit___annuleer')}
						onClick={navigateBack}
						type="tertiary"
					/>
					<Button
						disabled={isSaving}
						label={t('admin/interactive-tour/views/interactive-tour-edit___opslaan')}
						onClick={handleSave}
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Container mode="vertical" size="small" className="m-interactive-tour-edit-view">
					<Container mode="horizontal">{renderEditPage()}</Container>
				</Container>
			</AdminLayoutBody>
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
