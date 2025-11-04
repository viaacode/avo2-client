import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui/client';
import {
	Box,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	IconName,
	Select,
	type SelectOption,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import { cloneDeep, compact, get, isEmpty, map, orderBy } from 'lodash-es';
import React, {
	type FC,
	lazy,
	type Reducer,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { OrderDirection } from '../../../search/search.const';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { ROUTE_PARTS } from '../../../shared/constants';
import {
	type GetInteractiveTourByIdQuery,
	type GetInteractiveTourByIdQueryVariables,
} from '../../../shared/generated/graphql-db-operations';
import { GetInteractiveTourByIdDocument } from '../../../shared/generated/graphql-db-react-query';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { navigate } from '../../../shared/helpers/link';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { dataService } from '../../../shared/services/data-service';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import { ContentPicker } from '../../shared/components/ContentPicker/ContentPicker';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { type PickerItem } from '../../shared/types';
import { InteractiveTourAdd } from '../components/InteractiveTourStepAdd';
import {
	INTERACTIVE_TOUR_EDIT_INITIAL_STATE,
	type InteractiveTourAction,
	interactiveTourEditReducer,
} from '../helpers/reducers';
import {
	getInitialInteractiveTour,
	INTERACTIVE_TOUR_PATH,
	MAX_STEP_TEXT_LENGTH,
	MAX_STEP_TITLE_LENGTH,
} from '../interactive-tour.const';
import { InteractiveTourService } from '../interactive-tour.service';
import {
	type EditableInteractiveTour,
	type EditableStep,
	InteractiveTourEditActionType,
	type InteractiveTourEditFormErrorState,
	type InteractiveTourPageType,
	type InteractiveTourState,
	type InteractiveTourStep,
} from '../interactive-tour.types';

import { InteractiveTourEditStep } from './InteractiveTourEditStep';

import './InteractiveTourEdit.scss';

const BlockHeading = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.BlockHeading,
	}))
);

export const InteractiveTourEdit: FC = () => {
	const { tText, tHtml } = useTranslation();
	const location = useLocation();
	const navigateFunc = useNavigate();

	const { id: interactiveTourId } = useParams<{ id: string }>();

	// Hooks
	const [formErrors, setFormErrors] = useState<InteractiveTourEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [selectedPageType, setSelectedPageType] = useState<InteractiveTourPageType>('static');

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);

	const [interactiveTourState, changeInteractiveTourState] = useReducer<
		Reducer<InteractiveTourState, InteractiveTourAction>
	>(interactiveTourEditReducer, INTERACTIVE_TOUR_EDIT_INITIAL_STATE());

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
			[OrderDirection.asc]
		);
	}, []);

	const getPageType = useCallback(
		(pageId: string): InteractiveTourPageType => {
			const staticPageIds = getPageOptions().map((pageOption) => pageOption.value);
			return staticPageIds.includes(pageId) ? 'static' : 'content';
		},
		[getPageOptions]
	);

	const initOrFetchInteractiveTour = useCallback(async () => {
		if (isCreatePage) {
			changeInteractiveTourState({
				type: InteractiveTourEditActionType.UPDATE_INTERACTIVE_TOUR,
				newInteractiveTour: getInitialInteractiveTour(),
				updateInitialInteractiveTour: true,
			});
		} else {
			try {
				if (!interactiveTourId) {
					return;
				}
				const response = await dataService.query<
					GetInteractiveTourByIdQuery,
					GetInteractiveTourByIdQueryVariables
				>({
					query: GetInteractiveTourByIdDocument,
					variables: { id: parseInt(interactiveTourId) },
				});

				const interactiveTourObj = response.app_interactive_tour[0];

				if (!interactiveTourObj) {
					setLoadingInfo({
						state: 'error',
						icon: IconName.search,
						message: tHtml(
							'admin/interactive-tour/views/interactive-tour-edit___deze-interactieve-tour-werd-niet-gevonden'
						),
					});
					return;
				}

				changeInteractiveTourState({
					type: InteractiveTourEditActionType.UPDATE_INTERACTIVE_TOUR,
					newInteractiveTour: interactiveTourObj,
					updateInitialInteractiveTour: true,
				});
				setSelectedPageType(getPageType(interactiveTourObj.page_id));
			} catch (err) {
				console.error(
					new CustomError('Failed to get interactive tour by id', err, {
						query: 'GET_INTERACTIVE_TOUR_BY_ID',
						variables: { id: interactiveTourId },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'admin/interactive-tour/views/interactive-tour-edit___het-ophalen-van-de-interactive-tour-is-mislukt'
					),
				});
			}
		}
	}, [
		setLoadingInfo,
		changeInteractiveTourState,
		tHtml,
		isCreatePage,
		getPageType,
		interactiveTourId,
	]);

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
			navigateFunc(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW);
		} else {
			navigate(navigateFunc, INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL, {
				id: interactiveTourId,
			});
		}
	};

	const getFormErrors = (): InteractiveTourEditFormErrorState | null => {
		const errors: InteractiveTourEditFormErrorState = {};
		if (
			!interactiveTourState.currentInteractiveTour ||
			!interactiveTourState.currentInteractiveTour.name
		) {
			errors.name = tText(
				'admin/interactive-tour/views/interactive-tour-edit___een-naam-is-verplicht'
			);
		}
		if (
			!interactiveTourState.currentInteractiveTour ||
			!interactiveTourState.currentInteractiveTour.page_id
		) {
			errors.page_id = tText(
				'admin/interactive-tour/views/interactive-tour-edit___een-pagina-is-verplicht'
			);
		}
		get(interactiveTourState.currentInteractiveTour, 'steps', []).forEach(
			(step: InteractiveTourStep, index: number) => {
				if (step.title.length > MAX_STEP_TITLE_LENGTH) {
					errors.steps = errors.steps || [];
					errors.steps[index] = {
						...(errors.steps[index] || {}),
						title: tText(
							'admin/interactive-tour/views/interactive-tour-edit___de-titel-is-te-lang'
						),
					};
				}
				if (step.title.length > MAX_STEP_TEXT_LENGTH) {
					errors.steps = errors.steps || [];
					errors.steps[index] = {
						...(errors.steps[index] || {}),
						content: tText(
							'admin/interactive-tour/views/interactive-tour-edit___de-tekst-is-te-lang'
						),
					};
				}
			}
		);
		return isEmpty(errors) ? null : errors;
	};

	const convertTourContentToHtml = async (
		tour: EditableInteractiveTour
	): Promise<EditableInteractiveTour> => {
		const clonedTour = cloneDeep(tour);
		clonedTour.steps.forEach((step: EditableStep) => {
			if (step.contentState) {
				step.content = sanitizeHtml(step.contentState.toHTML(), SanitizePreset.link);
				delete step.contentState;
			}
		});
		return clonedTour;
	};

	const handleSave = async () => {
		try {
			if (!interactiveTourId) {
				return;
			}
			const errors = getFormErrors();
			setFormErrors(errors || {});
			if (errors) {
				ToastService.danger(
					tHtml(
						'admin/interactive-tour/views/interactive-tour-edit___de-invoer-is-ongeldig'
					)
				);
				return;
			}

			if (
				!interactiveTourState.initialInteractiveTour ||
				!interactiveTourState.currentInteractiveTour
			) {
				ToastService.danger(
					tHtml(
						'admin/interactive-tour/views/interactive-tour-edit___het-opslaan-van-de-interactive-tour-is-mislukt-omdat-de-interactive-tour-nog-niet-is-geladen'
					)
				);
				return;
			}

			setIsSaving(true);

			// Convert rich text editor state back to html before we save to database
			const tour: EditableInteractiveTour = await convertTourContentToHtml(
				interactiveTourState.currentInteractiveTour
			);

			let tempInteractiveTourId: number | string;
			if (isCreatePage) {
				// insert the interactive tour
				tempInteractiveTourId = await InteractiveTourService.insertInteractiveTour(tour);
			} else {
				// Update existing interactive tour
				await InteractiveTourService.updateInteractiveTour(tour);
				tempInteractiveTourId = interactiveTourId;
			}

			redirectToClientPage(
				buildLink(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL, {
					id: tempInteractiveTourId,
				}),
				navigateFunc
			);
			ToastService.success(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-edit___de-interactive-tour-is-opgeslagen'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to save interactive tour', err, {
					currentInteractiveTour: interactiveTourState.currentInteractiveTour,
					initialInteractiveTour: interactiveTourState.initialInteractiveTour,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-edit___het-opslaan-van-de-interactive-tour-is-mislukt'
				)
			);
		}
		setIsSaving(false);
	};

	const handleContentPageSelect = (item: PickerItem | null) => {
		if (!item) {
			return;
		}
		changeInteractiveTourState({
			type: InteractiveTourEditActionType.UPDATE_INTERACTIVE_TOUR_PROP,
			interactiveTourProp: 'page_id',
			interactiveTourPropValue: item.value,
		});
	};

	const handleStaticPageSelect = (newPageId: string) => {
		changeInteractiveTourState({
			type: InteractiveTourEditActionType.UPDATE_INTERACTIVE_TOUR_PROP,
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

	const renderStep = (step: EditableStep, index: number) => {
		if (!interactiveTourState.currentInteractiveTour) {
			return null;
		}

		return (
			<div key={`step_${step.target}_${step.id}`}>
				<InteractiveTourEditStep
					step={step}
					index={index}
					changeInteractiveTourState={changeInteractiveTourState}
					numberOfSteps={
						get(interactiveTourState, 'currentInteractiveTour.steps.length') || 1
					}
					stepErrors={get(formErrors, ['steps', index])}
				/>
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
									label={tText(
										'admin/interactive-tour/views/interactive-tour-edit___naam'
									)}
									error={formErrors.name}
									required
								>
									<TextInput
										value={
											interactiveTourState.currentInteractiveTour.name || ''
										}
										onChange={(newName) =>
											changeInteractiveTourState({
												type: InteractiveTourEditActionType.UPDATE_INTERACTIVE_TOUR_PROP,
												interactiveTourProp: 'name',
												interactiveTourPropValue: newName,
											})
										}
									/>
								</FormGroup>
								<FormGroup
									label={tText(
										'admin/interactive-tour/views/interactive-tour-edit___pagina'
									)}
									error={formErrors.page_id}
									required
								>
									<Flex>
										<FlexItem>
											<Select
												options={[
													{
														value: 'static',
														label: tText(
															'admin/interactive-tour/views/interactive-tour-edit___statische-pagina'
														),
													},
													{
														value: 'content',
														label: tText(
															'admin/interactive-tour/views/interactive-tour-edit___content-pagina'
														),
													},
												]}
												value={selectedPageType}
												onChange={(value) =>
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
					{tText('admin/interactive-tour/views/interactive-tour-edit___stappen')}
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
			onClickBackButton={() => navigate(navigateFunc, ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW)}
			pageTitle={tText(
				'admin/interactive-tour/views/interactive-tour-edit___interactive-tour-aanpassen'
			)}
			size="large"
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						label={tText(
							'admin/interactive-tour/views/interactive-tour-edit___annuleer'
						)}
						onClick={navigateBack}
						type="tertiary"
					/>
					<Button
						disabled={isSaving}
						label={tText(
							'admin/interactive-tour/views/interactive-tour-edit___opslaan'
						)}
						onClick={handleSave}
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>{renderEditPage()}</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<>
			<PermissionGuard permissions={[PermissionName.EDIT_INTERACTIVE_TOURS]}>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							get(interactiveTourState.currentInteractiveTour, 'name'),
							isCreatePage
								? tText(
										'admin/interactive-tour/views/interactive-tour-edit___interactieve-rondleiding-beheer-aanmaak-pagina-titel'
								  )
								: tText(
										'admin/interactive-tour/views/interactive-tour-edit___interactieve-rondleiding-beheer-bewerk-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCreatePage
								? tText(
										'admin/interactive-tour/views/interactive-tour-edit___interactieve-rondleiding-beheer-aanmaak-pagina-beschrijving'
								  )
								: tText(
										'admin/interactive-tour/views/interactive-tour-edit___interactieve-rondleiding-beheer-bewerk-pagina-beschrijving'
								  )
						}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={interactiveTourState.currentInteractiveTour}
					render={renderPage}
				/>
			</PermissionGuard>
		</>
	);
};

export default InteractiveTourEdit;
