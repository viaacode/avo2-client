import { get, has, isFunction, isNil, kebabCase, set, without } from 'lodash-es';
import React, { FunctionComponent, Reducer, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Navbar,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId } from '../../../authentication/helpers/get-profile-info';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { DeleteObjectModal } from '../../../shared/components';
import { CustomError, navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { ToastService } from '../../../shared/services';
import { CONTENT_BLOCK_INITIAL_STATE_MAP } from '../../content-block/content-block.const';
import { parseContentBlocks } from '../../content-block/helpers';
import { useContentBlocksByContentId } from '../../content-block/hooks';
import { validateContentBlockField } from '../../shared/helpers';
import {
	AdminLayout,
	AdminLayoutBody,
	AdminLayoutHeader,
	AdminLayoutTopBarRight,
} from '../../shared/layouts';
import {
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockErrors,
	ContentBlockStateOption,
	ContentBlockStateType,
	ContentBlockType,
} from '../../shared/types';
import { ContentEditForm } from '../components';
import { CONTENT_PATH, GET_CONTENT_DETAIL_TABS } from '../content.const';
import { ContentService } from '../content.service';
import {
	ContentEditAction,
	ContentEditActionType,
	ContentEditFormErrors,
	ContentEditState,
	PageType,
} from '../content.types';
import { CONTENT_EDIT_INITIAL_STATE, contentEditReducer } from '../helpers/reducers';
import { useContentPage, useContentTypes } from '../hooks';

import './ContentEdit.scss';
import ContentEditContentBlocks from './ContentEditContentBlocks';

interface ContentEditProps extends DefaultSecureRouteProps<{ id?: string }> {}

const ContentEdit: FunctionComponent<ContentEditProps> = ({ history, match, user }) => {
	const { id } = match.params;

	// Hooks
	const [{ contentBlockConfigs }, dispatch] = useReducer<
		Reducer<ContentEditState, ContentEditAction>
	>(contentEditReducer, CONTENT_EDIT_INITIAL_STATE());

	const [formErrors, setFormErrors] = useState<ContentEditFormErrors>({});
	const [configToDelete, setConfigToDelete] = useState<number>();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

	const [t] = useTranslation();

	const [initialContentForm, contentForm, setContentForm, isLoading] = useContentPage(
		history,
		id
	);
	const [contentTypes, isLoadingContentTypes] = useContentTypes();
	const [contentBlocks, isLoadingContentBlocks] = useContentBlocksByContentId(id);
	const [currentTab, setCurrentTab, tabs] = useTabs(GET_CONTENT_DETAIL_TABS(), 'inhoud');

	useEffect(() => {
		if (contentBlocks.length) {
			dispatch({
				type: ContentEditActionType.SET_CONTENT_BLOCK_CONFIGS,
				payload: parseContentBlocks(contentBlocks),
			});
		}
	}, [contentBlocks]);

	// Computed
	const pageType = id ? PageType.Edit : PageType.Create;
	let pageTitle = t('admin/content/views/content-edit___content-toevoegen');
	if (pageType !== PageType.Create) {
		pageTitle = `${t('admin/content/views/content-edit___content-aanpassen')}: ${get(
			contentForm,
			'title',
			''
		)}`;
	}
	const isAdminUser = PermissionService.hasPerm(user, PermissionName.EDIT_PROTECTED_PAGE_STATUS);

	// Methods
	const addContentBlockConfig = (newConfig: ContentBlockConfig) => {
		dispatch({
			type: ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG,
			payload: newConfig,
		});
	};

	const removeContentBlockConfig = () => {
		dispatch({
			type: ContentEditActionType.REMOVE_CONTENT_BLOCK_CONFIG,
			payload: configToDelete,
		});
	};

	const reorderContentBlockConfig = (configIndex: number, indexUpdate: number) => {
		dispatch({
			type: ContentEditActionType.REORDER_CONTENT_BLOCK_CONFIG,
			payload: { configIndex, indexUpdate },
		});
	};

	const setContentBlockConfigError = (configIndex: number, errors: ContentBlockErrors) => {
		dispatch({
			type: ContentEditActionType.SET_CONTENT_BLOCK_ERROR,
			payload: { configIndex, errors },
		});
	};

	const openDeleteModal = (configIndex: number) => {
		setIsDeleteModalOpen(true);
		setConfigToDelete(configIndex);
	};

	const getPathOrDefault = (): string => contentForm.path || `/${kebabCase(contentForm.title)}`;

	const handleSave = async () => {
		try {
			setIsSaving(true);
			setHasSubmitted(true);

			// Validate form
			const isFormValid = await handleValidation();
			let areConfigsValid = true;

			if (!hasSubmitted) {
				setHasSubmitted(true);
			}

			// Remove rich text editor states, since they are also saved as html,
			// and we don't want those states to end up in the database
			const blockConfigs: ContentBlockConfig[] = ContentService.convertRichTextEditorStatesToHtml(
				contentBlockConfigs
			);

			// Run validators on to check untouched inputs
			blockConfigs.forEach((config, configIndex) => {
				const { fields, state } = config.components;
				const keysToValidate = Object.keys(fields).filter(key => fields[key].validator);
				let newErrors: ContentBlockErrors = {};

				if (keysToValidate.length > 0) {
					keysToValidate.forEach(key => {
						const validator = fields[key].validator;

						if (validator && isFunction(validator)) {
							if (Array.isArray(state) && state.length > 0) {
								state.forEach((singleState, stateIndex) => {
									newErrors = validateContentBlockField(
										key,
										validator,
										newErrors,
										singleState[key as keyof ContentBlockComponentState],
										stateIndex
									);
								});
							} else if (has(state, key)) {
								newErrors = validateContentBlockField(
									key,
									validator,
									newErrors,
									state[key as keyof ContentBlockComponentState]
								);
							}
						}
					});
					areConfigsValid = Object.keys(newErrors).length === 0;
					setContentBlockConfigError(configIndex, newErrors);
				}
			});

			if (!isFormValid || !areConfigsValid) {
				setIsSaving(false);
				if (!isFormValid) {
					ToastService.danger(
						t(
							'admin/content/views/content-edit___er-zijn-nog-fouten-in-het-metadata-formulier'
						),
						false
					);
				}
				if (!areConfigsValid) {
					ToastService.danger(
						t(
							'admin/content/views/content-edit___er-zijn-nog-fouten-in-de-content-blocks'
						),
						false
					);
				}

				return;
			}

			const contentItem: Partial<Avo.Content.Content> | any = {
				thumbnail_path: contentForm.thumbnail_path,
				title: contentForm.title,
				description: contentForm.descriptionState
					? contentForm.descriptionState.toHTML()
					: contentForm.descriptionHtml || null,
				// We'll default to description when the page is rendered
				// To avoid defaulting to description once and then having to manually update this field evey time
				// This also avoids storing the description twice
				seo_description: (contentForm.seoDescription || '').trim() || null,
				is_protected: contentForm.isProtected,
				path: getPathOrDefault(),
				content_type: contentForm.contentType,
				content_width: contentForm.contentWidth,
				publish_at: contentForm.publishAt || null,
				depublish_at: contentForm.depublishAt || null,
				user_group_ids: contentForm.userGroupIds,
			};

			let insertedOrUpdatedContent: Partial<Avo.Content.Content> | null;
			if (pageType === PageType.Create) {
				const contentBody = { ...contentItem, user_profile_id: getProfileId(user) };
				insertedOrUpdatedContent = await ContentService.insertContentPage(
					contentBody,
					blockConfigs
				);
			} else {
				if (!isNil(id)) {
					const contentBody = {
						...contentItem,
						updated_at: new Date().toISOString(),
						id: parseInt(id, 10),
					};
					insertedOrUpdatedContent = await ContentService.updateContentPage(
						contentBody,
						contentBlocks,
						blockConfigs
					);
				} else {
					throw new CustomError(
						'failed to update content page because the id is undefined',
						null,
						{
							contentItem,
							contentForm,
							id,
						}
					);
				}
			}

			if (!insertedOrUpdatedContent || isNil(insertedOrUpdatedContent.id)) {
				throw new CustomError(
					'Failed to save labels because no response or response does not contain a valid id',
					null,
					{
						contentItem,
						contentForm,
						insertedOrUpdatedContent,
						isCreatePage: pageType === PageType.Create,
					}
				);
			}

			// Save content labels
			const initialLabelIds = initialContentForm.labels.map(
				(label: any) => label.id as number
			);
			const labelIds = contentForm.labels.map((label: any) => label.id as number);
			const addedLabelIds = without(labelIds, ...initialLabelIds);
			const removedLabelIds = without(initialLabelIds, ...labelIds);
			await Promise.all([
				ContentService.insertContentLabelsLinks(insertedOrUpdatedContent.id, addedLabelIds),
				ContentService.deleteContentLabelsLinks(
					insertedOrUpdatedContent.id,
					removedLabelIds
				),
			]);

			ToastService.success(
				t('admin/content/views/content-edit___het-content-item-is-succesvol-opgeslagen'),
				false
			);
			navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id: insertedOrUpdatedContent.id });
		} catch (err) {
			console.error(new CustomError('Failed to save content page ', err));
			ToastService.danger(
				t(
					'admin/content/views/content-edit___het-opslaan-van-de-content-pagina-is-mislukt'
				),
				false
			);
		}

		setIsSaving(false);
	};

	const handleValidation = async (): Promise<boolean> => {
		const errors: ContentEditFormErrors = {};
		const hasPublicationAndDePublicationDates =
			contentForm.publishAt && contentForm.depublishAt;

		if (!contentForm.title) {
			errors.title = t('admin/content/views/content-edit___titel-is-verplicht');
		}

		if (!contentForm.contentType) {
			errors.contentType = t('admin/content/views/content-edit___content-type-is-verplicht');
		}

		// check if the path is unique
		const path = getPathOrDefault();

		const page: Avo.Content.Content | null = await ContentService.fetchContentPageByPath(path);
		if (page && String(page.id) !== id) {
			errors.path = t(
				'admin/content/views/content-edit___dit-path-is-reeds-gebruikt-door-pagina-page-title',
				{
					pageTitle: page.title,
				}
			);
		}

		if (
			hasPublicationAndDePublicationDates &&
			new Date(contentForm.depublishAt) < new Date(contentForm.publishAt)
		) {
			errors.depublishAt = t(
				'admin/content/views/content-edit___depublicatie-moet-na-publicatie-datum'
			);
		}

		setFormErrors(errors);

		return Object.keys(errors).length === 0;
	};

	const navigateBack = () => {
		if (pageType === PageType.Create) {
			history.push(CONTENT_PATH.CONTENT);
		} else {
			navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id });
		}
	};

	const addComponentToState = (index: number, blockType: ContentBlockType) => {
		dispatch({
			type: ContentEditActionType.ADD_COMPONENTS_STATE,
			payload: {
				index,
				formGroupState: CONTENT_BLOCK_INITIAL_STATE_MAP[blockType](),
			},
		});
	};

	const removeComponentFromState = (index: number, stateIndex: number) => {
		dispatch({
			type: ContentEditActionType.REMOVE_COMPONENTS_STATE,
			payload: {
				index,
				stateIndex,
			},
		});
	};

	const handleStateSave = (
		index: number,
		formGroupType: ContentBlockStateType,
		formGroupState: ContentBlockStateOption,
		stateIndex?: number
	) => {
		dispatch({
			type:
				formGroupType === 'block'
					? ContentEditActionType.SET_BLOCK_STATE
					: ContentEditActionType.SET_COMPONENTS_STATE,
			payload: {
				index,
				stateIndex,
				formGroupType,
				formGroupState: Array.isArray(formGroupState) ? formGroupState[0] : formGroupState,
			},
		});
	};

	// Render
	const renderTabContent = () => {
		switch (currentTab) {
			case 'inhoud':
				return (
					<ContentEditContentBlocks
						contentBlockConfigs={contentBlockConfigs}
						contentWidth={contentForm.contentWidth}
						hasSubmitted={hasSubmitted}
						addComponentToState={addComponentToState}
						removeComponentFromState={removeComponentFromState}
						onAdd={addContentBlockConfig}
						onError={setContentBlockConfigError}
						onRemove={openDeleteModal}
						onReorder={reorderContentBlockConfig}
						onSave={handleStateSave}
					/>
				);
			case 'metadata':
				return (
					<ContentEditForm
						contentTypes={contentTypes}
						formErrors={formErrors}
						formState={contentForm}
						isAdminUser={isAdminUser}
						onChange={setContentForm}
						user={user}
					/>
				);
			default:
				return null;
		}
	};

	const onPasteContentBlock = (e: any) => {
		try {
			if (e.clipboardData && e.clipboardData.getData) {
				const pastedText = e.clipboardData.getData('text/plain');

				if (pastedText.startsWith('{"block":')) {
					const newConfig = JSON.parse(pastedText).block;
					delete newConfig.id;
					// Ensure block is added at the bottom of the page
					set(newConfig, 'block.state.position', contentBlockConfigs.length);
					dispatch({
						type: ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG,
						payload: newConfig,
					});

					ToastService.success(
						t('admin/content/views/content-edit___de-blok-is-toegevoegd'),
						false
					);
				}
			}
		} catch (err) {
			console.error(new CustomError('Failed to paste content block', err));
			ToastService.danger(
				t('admin/content/views/content-edit___het-plakken-van-het-content-blok-is-mislukt'),
				false
			);
		}
	};

	return isLoading || isLoadingContentTypes || isLoadingContentBlocks ? (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	) : (
		<div onPaste={onPasteContentBlock}>
			<AdminLayout showBackButton pageTitle={pageTitle}>
				<AdminLayoutTopBarRight>
					<ButtonToolbar>
						<Button
							label={t('admin/content/views/content-edit___annuleer')}
							onClick={navigateBack}
							type="tertiary"
						/>
						<Button
							disabled={isSaving}
							label={t('admin/content/views/content-edit___opslaan')}
							onClick={handleSave}
						/>
					</ButtonToolbar>
				</AdminLayoutTopBarRight>
				<AdminLayoutHeader>
					<Navbar background="alt" placement="top" autoHeight>
						<Container mode="horizontal">
							<Tabs tabs={tabs} onClick={setCurrentTab} />
						</Container>
					</Navbar>
				</AdminLayoutHeader>
				<AdminLayoutBody>
					<MetaTags>
						<title>
							{GENERATE_SITE_TITLE(
								get(contentForm, 'title'),
								pageType === PageType.Create
									? t(
											'admin/content/views/content-edit___content-beheer-aanmaak-pagina-titel'
									  )
									: t(
											'admin/content/views/content-edit___content-beheer-bewerk-pagina-titel'
									  )
							)}
						</title>
						<meta name="description" content={get(contentForm, 'description')} />
					</MetaTags>
					{renderTabContent()}
					<DeleteObjectModal
						deleteObjectCallback={removeContentBlockConfig}
						isOpen={isDeleteModalOpen}
						onClose={() => setIsDeleteModalOpen(false)}
					/>
				</AdminLayoutBody>
			</AdminLayout>
		</div>
	);
};

export default ContentEdit;
