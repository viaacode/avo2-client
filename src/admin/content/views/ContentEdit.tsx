import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, Reducer, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	Header,
	HeaderButtons,
	Navbar,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId } from '../../../authentication/helpers/get-profile-info';
import { GET_CONTENT_PAGE_BY_PATH } from '../../../content-page/content-page.gql';
import { DeleteObjectModal } from '../../../shared/components';
import { navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { dataService } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';
import { CONTENT_BLOCK_INITIAL_STATE_MAP } from '../../content-block/content-block.const';
import { parseContentBlocks } from '../../content-block/helpers';
import { useContentBlocksByContentId } from '../../content-block/hooks';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';
import {
	ContentBlockConfig,
	ContentBlockStateOption,
	ContentBlockStateType,
	ContentBlockType,
} from '../../shared/types';

import { ContentEditForm } from '../components';
import { CONTENT_DETAIL_TABS, CONTENT_PATH } from '../content.const';
import { INSERT_CONTENT, UPDATE_CONTENT_BY_ID } from '../content.gql';
import * as ContentService from '../content.service';
import {
	ContentEditAction,
	ContentEditActionType,
	ContentEditFormErrors,
	ContentEditState,
	PageType,
} from '../content.types';
import { CONTENT_EDIT_INITIAL_STATE, contentEditReducer } from '../helpers/reducers';
import { useContentItem, useContentTypes } from '../hooks';
import ContentEditContentBlocks from './ContentEditContentBlocks';

import './ContentEdit.scss';

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

	const [t] = useTranslation();

	const [contentForm, setContentForm, isLoading] = useContentItem(history, id);
	const [contentTypes, isLoadingContentTypes] = useContentTypes();
	const [contentBlocks, isLoadingContentBlocks] = useContentBlocksByContentId(id);
	const [currentTab, setCurrentTab, tabs] = useTabs(CONTENT_DETAIL_TABS, 'inhoud');

	useEffect(() => {
		if (contentBlocks.length) {
			dispatch({
				type: ContentEditActionType.SET_CONTENT_BLOCK_CONFIGS,
				payload: parseContentBlocks(contentBlocks),
			});
		}
	}, [contentBlocks]);

	const [triggerContentInsert] = useMutation(INSERT_CONTENT);
	const [triggerContentUpdate] = useMutation(UPDATE_CONTENT_BY_ID);

	// Computed
	const pageType = id ? PageType.Edit : PageType.Create;
	const pageTitle =
		pageType === PageType.Create
			? t('admin/content/views/content-edit___content-toevoegen')
			: t('admin/content/views/content-edit___content-aanpassen');
	// TODO: clean up admin check
	const isAdminUser = get(user, 'role.name', null) === 'admin';

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

	const openDeleteModal = (configIndex: number) => {
		setIsDeleteModalOpen(true);
		setConfigToDelete(configIndex);
	};

	const handleResponse = (response: Partial<Avo.Content.Content> | null) => {
		setIsSaving(false);

		if (response) {
			toastService.success(
				t('admin/content/views/content-edit___het-content-item-is-succesvol-opgeslagen'),
				false
			);
			navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id: response.id });
		}
	};

	const handleSave = async () => {
		setIsSaving(true);

		// Validate form
		const isFormValid = await handleValidation();

		if (!isFormValid) {
			setIsSaving(false);
			toastService.danger(
				t('admin/content/views/content-edit___er-zijn-nog-fouten-in-het-metadata-formulier'),
				false
			);

			return;
		}

		const contentItem: Partial<Avo.Content.Content> | any = {
			title: contentForm.title,
			description: contentForm.description || null,
			is_protected: contentForm.isProtected,
			path: contentForm.path || null,
			content_type: contentForm.contentType,
			content_width: contentForm.contentWidth,
			publish_at: contentForm.publishAt || null,
			depublish_at: contentForm.depublishAt || null,
			user_group_ids: contentForm.userGroupIds,
		};

		if (pageType === PageType.Create) {
			const contentBody = { ...contentItem, user_profile_id: getProfileId(user) };
			const insertedContent = await ContentService.insertContent(
				contentBody,
				contentBlockConfigs,
				triggerContentInsert
			);

			handleResponse(insertedContent);
		} else {
			if (id) {
				const contentBody = {
					...contentItem,
					updated_at: new Date().toISOString(),
					id: parseInt(id, 10),
				};
				const updatedContent = await ContentService.updateContent(
					contentBody,
					contentBlocks,
					contentBlockConfigs,
					triggerContentUpdate
				);

				handleResponse(updatedContent);
			} else {
				toastService.danger(
					t('admin/content/views/content-edit___het-content-id-id-is-ongeldig', { id }),
					false
				);
				history.push(CONTENT_PATH.CONTENT);
			}
		}
	};

	const handleValidation = async (): Promise<boolean> => {
		const errors: ContentEditFormErrors = {};
		const hasPublicationAndDePublicationDates = contentForm.publishAt && contentForm.depublishAt;

		if (!contentForm.title) {
			errors.title = t('admin/content/views/content-edit___titel-is-verplicht');
		}

		if (!contentForm.contentType) {
			errors.contentType = t('admin/content/views/content-edit___content-type-is-verplicht');
		}

		if (!contentForm.path) {
			errors.path = t('Een url is verplicht');
		} else {
			// check if it is unique
			const response = await dataService.query({
				query: GET_CONTENT_PAGE_BY_PATH,
				variables: { path: contentForm.path },
			});
			const page: Avo.Content.Content | undefined = get(response, 'data.app_content[0]');
			if (page && String(page.id) !== id) {
				errors.path = t('Dit path is reeds gebruikt door pagina: {{pageTitle}}', {
					pageTitle: page.title,
				});
			}
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
						onAdd={addContentBlockConfig}
						addComponentToState={addComponentToState}
						removeComponentFromState={removeComponentFromState}
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
					/>
				);
			default:
				return null;
		}
	};

	return isLoading || isLoadingContentTypes || isLoadingContentBlocks ? (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	) : (
		<AdminLayout showBackButton>
			<AdminLayoutHeader>
				<Header category="audio" title={pageTitle} showMetaData={false}>
					<HeaderButtons>
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
					</HeaderButtons>
				</Header>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={setCurrentTab} />
					</Container>
				</Navbar>
			</AdminLayoutHeader>
			<AdminLayoutBody>
				{renderTabContent()}
				<DeleteObjectModal
					deleteObjectCallback={removeContentBlockConfig}
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentEdit;
