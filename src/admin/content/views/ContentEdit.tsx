import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
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
import { navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import toastService from '../../../shared/services/toast-service';
import { ValueOf } from '../../../shared/types';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { ContentEditForm } from '../components';
import { CONTENT_DETAIL_TABS, CONTENT_PATH, INITIAL_CONTENT_FORM } from '../content.const';
import { INSERT_CONTENT, UPDATE_CONTENT_BY_ID } from '../content.gql';
import { fetchContentItemById, insertContent, updateContent } from '../content.services';
import { ContentEditFormState, PageType } from '../content.types';
import { useContentTypes } from '../hooks/useContentTypes';
import ContentEditContentBlocks from './ContentEditContentBlocks';

import './ContentEdit.scss';

interface ContentEditProps extends DefaultSecureRouteProps<{ id?: string }> {}

const ContentEdit: FunctionComponent<ContentEditProps> = ({ history, match, user }) => {
	const [t] = useTranslation();

	const { id } = match.params;

	// Hooks
	const [contentForm, setContentForm] = useState<ContentEditFormState>(INITIAL_CONTENT_FORM);
	const [formErrors, setFormErrors] = useState<Partial<ContentEditFormState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [pageType, setPageType] = useState<PageType | undefined>();

	const { contentTypes, isLoadingContentTypes } = useContentTypes();
	const [currentTab, setCurrentTab, tabs] = useTabs(CONTENT_DETAIL_TABS, 'inhoud');

	const [triggerContentInsert] = useMutation(INSERT_CONTENT);
	const [triggerContentUpdate] = useMutation(UPDATE_CONTENT_BY_ID);

	// Computed
	const pageTitle = `Content ${pageType === PageType.Create ? 'toevoegen' : 'aanpassen'}`;
	const contentTypeOptions = [
		{ label: 'Kies een content type', value: '', disabled: true },
		...contentTypes.map(contentType => ({
			label: contentType.value,
			value: contentType.value,
		})),
	];

	useEffect(() => {
		if (id) {
			setPageType(PageType.Edit);
			setIsLoading(true);

			fetchContentItemById(Number(id))
				.then((contentItem: Avo.Content.Content | null) => {
					if (contentItem) {
						setContentForm({
							title: contentItem.title,
							description: contentItem.description || '',
							contentType: contentItem.content_type,
							publishAt: contentItem.publish_at || '',
							depublishAt: contentItem.depublish_at || '',
						});
					} else {
						toastService.danger(
							`Er ging iets mis tijdens het ophalen van de content met id: ${id}`,
							false
						);
						history.push(CONTENT_PATH.CONTENT);
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		} else {
			setPageType(PageType.Create);
		}
	}, [id, history]);

	// Methods
	const handleChange = (key: keyof ContentEditFormState, value: ValueOf<ContentEditFormState>) => {
		setContentForm({
			...contentForm,
			[key]: value,
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
			const insertedContent = await insertContent(triggerContentInsert, {
				...contentItem,
				user_profile_id: getProfileId(user),
			});

			handleResponse(insertedContent);
		} else {
			if (id) {
				const updatedContent = await updateContent(triggerContentUpdate, {
					...contentItem,
					updated_at: new Date().toISOString(),
					id: parseInt(id, 10),
				});

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
				return <ContentEditContentBlocks />;
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
							<Button
								disabled={isSaving}
								label={t('admin/content/views/content-edit___opslaan')}
								onClick={handleSave}
							/>
							<Button
								label={t('admin/content/views/content-edit___annuleer')}
								onClick={navigateBack}
								type="tertiary"
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
			<AdminLayoutBody>{renderTabContent()}</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentEdit;
