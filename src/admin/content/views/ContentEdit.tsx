import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, Flex, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { selectLogin } from '../../../authentication/store/selectors';
import { navigate } from '../../../shared/helpers';
import { fetchContentItemById } from '../../../shared/services/content-service';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import { ValueOf } from '../../../shared/types';
import { AppState } from '../../../store';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { ContentEditForm } from '../components';
import { CONTENT_PATH, INITIAL_CONTENT_FORM } from '../content.const';
import { INSERT_CONTENT, UPDATE_CONTENT_BY_ID } from '../content.gql';
import { ContentEditFormState, PageType } from '../content.types';
import { useContentTypes } from '../hooks/useContentTypes';

interface ContentEditProps extends RouteComponentProps<{ id?: string }> {
	loginState: Avo.Auth.LoginResponse | null;
}

const ContentEdit: FunctionComponent<ContentEditProps> = ({ history, loginState, match }) => {
	// Hooks
	const [contentForm, setContentForm] = useState<ContentEditFormState>(INITIAL_CONTENT_FORM);
	const [formErrors, setFormErrors] = useState<Partial<ContentEditFormState>>({});
	const [initialContent, setInitialContent] = useState<Avo.Content.Content | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [pageType, setPageType] = useState<PageType | undefined>();

	const { contentTypes, isLoadingContentTypes } = useContentTypes();

	const [triggerContentInsert] = useMutation(INSERT_CONTENT);
	const [triggerContentUpdate] = useMutation(UPDATE_CONTENT_BY_ID);

	const { id } = match.params;
	const pageTitle = `Content ${pageType === PageType.Create ? 'toevoegen' : 'aanpassen'}`;
	const contentTypeOptions = contentTypes.map(contentType => ({
		label: contentType.value,
		value: contentType.value,
	}));

	useEffect(() => {
		if (id) {
			setPageType(PageType.Edit);
			setIsLoading(true);

			fetchContentItemById(Number(id))
				.then((contentItem: Avo.Content.Content | null) => {
					if (contentItem) {
						setInitialContent(contentItem);
						setContentForm({
							title: contentItem.title,
							description: contentItem.description || '',
							contentType: contentItem.content_type,
							publishAt: contentItem.publish_at || '',
							depublishAt: contentItem.depublish_at || '',
						});
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		} else {
			setPageType(PageType.Create);
		}
	}, [id]);

	// Methods
	const handleChange = (key: keyof ContentEditFormState, value: ValueOf<ContentEditFormState>) => {
		setContentForm({
			...contentForm,
			[key]: value,
		});
	};

	const handleResponse = () => {
		// show toast message
		// navigate to detail
		setIsSaving(false);
	};

	const handleSave = () => {
		setIsSaving(true);

		// Validate form
		const isFormValid = handleValidation();

		if (!isFormValid) {
			setIsSaving(false);

			return;
		}

		const contentItem: Partial<Avo.Content.Content> = {
			title: contentForm.title,
			description: contentForm.description,
			publish_at: contentForm.publishAt,
			depublish_at: contentForm.depublishAt,
		};

		if (pageType === PageType.Create) {
			triggerContentInsert({
				variables: {
					contentItem: {
						...contentItem,
						user_profile_id: get(loginState, 'userInfo.id', null),
					},
				},
				update: ApolloCacheManager.clearContentCache,
			})
				.then(() => handleResponse())
				.catch(err => handleResponse());
		} else {
			triggerContentUpdate({
				variables: {
					id,
					contentItem: {
						...initialContent,
						...contentItem,
						updated_at: new Date().toISOString(),
					},
				},
				update: ApolloCacheManager.clearContentCache,
			})
				.then(() => handleResponse())
				.catch(err => handleResponse());
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
			navigate(history, CONTENT_PATH.CONTENT, { id });
		}
	};

	// Render
	return isLoading || isLoadingContentTypes ? (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	) : (
		<AdminLayout pageTitle={pageTitle} navigateBack={navigateBack}>
			<AdminLayoutBody>
				<ContentEditForm
					contentTypeOptions={contentTypeOptions}
					formErrors={formErrors}
					formState={contentForm}
					onChange={handleChange}
				/>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button disabled={isSaving} label="Opslaan" onClick={handleSave} />
				<Button label="Annuleer" onClick={navigateBack} type="tertiary" />
			</AdminLayoutActions>
		</AdminLayout>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(ContentEdit));
