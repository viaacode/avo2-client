import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useReducer, useState } from 'react';

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
import { navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import toastService from '../../../shared/services/toast-service';
import { ValueOf } from '../../../shared/types';
import {
	ContentBlockConfig,
	ContentBlockFormStates,
} from '../../content-block/content-block.types';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { ContentEditForm } from '../components';
import { CONTENT_DETAIL_TABS, CONTENT_PATH } from '../content.const';
import { INSERT_CONTENT, UPDATE_CONTENT_BY_ID } from '../content.gql';
import * as ContentService from '../content.services';
import { ContentEditActionType, ContentEditFormState, PageType } from '../content.types';
import { CONTENT_EDIT_INITIAL_STATE, contentEditReducer } from '../helpers/reducer';
import { useContentItem, useContentTypes } from '../hooks';
import ContentEditContentBlocks from './ContentEditContentBlocks';

import './ContentEdit.scss';

interface ContentEditProps extends DefaultSecureRouteProps<{ id?: string }> {}

const ContentEdit: FunctionComponent<ContentEditProps> = ({ history, match, user }) => {
	const { id } = match.params;
	const initialState = CONTENT_EDIT_INITIAL_STATE();

	// Hooks
	const [{ cbConfigs }, dispatch] = useReducer(contentEditReducer(initialState), initialState);

	const [formErrors, setFormErrors] = useState<Partial<ContentEditFormState>>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [contentForm, setContentForm, isLoading] = useContentItem(history, id);
	const [contentTypes, isLoadingContentTypes] = useContentTypes();
	const [currentTab, setCurrentTab, tabs] = useTabs(CONTENT_DETAIL_TABS, 'inhoud');

	const [triggerContentInsert] = useMutation(INSERT_CONTENT);
	const [triggerContentUpdate] = useMutation(UPDATE_CONTENT_BY_ID);

	// Computed
	const pageType = id ? PageType.Edit : PageType.Create;
	const pageTitle = `Content ${pageType === PageType.Create ? 'toevoegen' : 'aanpassen'}`;
	const contentTypeOptions = [
		{ label: 'Kies een content type', value: '', disabled: true },
		...contentTypes.map(contentType => ({
			label: contentType.value,
			value: contentType.value,
		})),
	];

	// Methods
	const addCbConfig = (newConfig: ContentBlockConfig) => {
		dispatch({
			type: ContentEditActionType.ADD_CB_CONFIG,
			payload: newConfig,
		});
	};

	const handleChange = (key: keyof ContentEditFormState, value: ValueOf<ContentEditFormState>) => {
		setContentForm({
			...contentForm,
			[key]: value,
		});
	};

	const handleCbConfigChange = (index: number, formState: Partial<ContentBlockFormStates>) => {
		dispatch({
			type: ContentEditActionType.SET_FORM_STATE,
			payload: { formState, index },
		});
	};

	const handleResponse = (response: Partial<Avo.Content.Content> | null) => {
		setIsSaving(false);

		if (response) {
			toastService.success('Het content item is succesvol opgeslagen', false);
			navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id: response.id });
		} else {
			toastService.danger('Er ging iets mis tijden het opslaan van het content item', false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);

		// Validate form
		const isFormValid = handleValidation();

		if (!isFormValid) {
			setIsSaving(false);

			return;
		}

		const contentItem: Partial<Avo.Content.Content> = {
			title: contentForm.title,
			description: contentForm.description || null,
			content_type: contentForm.contentType,
			publish_at: contentForm.publishAt || null,
			depublish_at: contentForm.depublishAt || null,
		};

		if (pageType === PageType.Create) {
			const contentBody = { ...contentItem, user_profile_id: getProfileId(user) };
			const insertedContent = await ContentService.insertContent(
				contentBody,
				cbConfigs,
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
					cbConfigs,
					triggerContentUpdate
				);

				handleResponse(updatedContent);
			} else {
				toastService.danger(`Het content id: ${id} is ongeldig.`, false);
				history.push(CONTENT_PATH.CONTENT);
			}
		}
	};

	const handleValidation = () => {
		const errors: Partial<ContentEditFormState> = {};

		if (!contentForm.title) {
			errors.title = 'Titel is verplicht';
		}

		if (!contentForm.contentType) {
			errors.contentType = 'Content type is verplicht';
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

	// Render
	const renderTabContent = () => {
		switch (currentTab) {
			case 'inhoud':
				return (
					<ContentEditContentBlocks
						cbConfigs={cbConfigs}
						onAdd={addCbConfig}
						onChange={handleCbConfigChange}
					/>
				);
			case 'metadata':
				return (
					<ContentEditForm
						contentTypeOptions={contentTypeOptions}
						formErrors={formErrors}
						formState={contentForm}
						onChange={handleChange}
					/>
				);
			default:
				return null;
		}
	};

	return isLoading || isLoadingContentTypes ? (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	) : (
		<AdminLayout navigateBack={navigateBack}>
			<AdminLayoutHeader>
				<Header category="audio" title={pageTitle} showMetaData={false}>
					<HeaderButtons>
						<ButtonToolbar>
							<Button disabled={isSaving} label="Opslaan" onClick={handleSave} />
							<Button label="Annuleer" onClick={navigateBack} type="tertiary" />
						</ButtonToolbar>
					</HeaderButtons>
				</Header>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={setCurrentTab} />
					</Container>
				</Navbar>
			</AdminLayoutHeader>
			<AdminLayoutBody>{renderTabContent()}</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentEdit;
