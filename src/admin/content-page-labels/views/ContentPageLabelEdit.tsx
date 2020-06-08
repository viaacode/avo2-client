import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Box,
	Button,
	ButtonToolbar,
	Container,
	Form,
	FormGroup,
	Select,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink, CustomError, navigate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import { useContentTypes } from '../../content/hooks';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { CONTENT_PAGE_LABEL_PATH } from '../content-page-label.const';
import { ContentPageLabelService } from '../content-page-label.service';
import { ContentPageLabel, ContentPageLabelEditFormErrorState } from '../content-page-label.types';

interface ContentPageLabelEditProps extends DefaultSecureRouteProps<{ id: string }> {}

const ContentPageLabelEdit: FunctionComponent<ContentPageLabelEditProps> = ({
	history,
	match,
	location,
}) => {
	const [t] = useTranslation();

	// Hooks
	const [initialContentPageLabel, setInitialContentPageLabel] = useState<ContentPageLabel | null>(
		null
	);
	const [contentPageLabel, setContentPageLabel] = useState<ContentPageLabel | null>(null);

	const [formErrors, setFormErrors] = useState<ContentPageLabelEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [contentTypes] = useContentTypes();

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);

	const initOrFetchContentPageLabel = useCallback(async () => {
		if (isCreatePage) {
			const contentLabel = ({
				label: '',
				content_type: 'PAGINA',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				permissions: [],
			} as unknown) as ContentPageLabel;
			setInitialContentPageLabel(contentLabel);
			setContentPageLabel(contentLabel);
		} else {
			try {
				const contentLabel = await ContentPageLabelService.fetchContentPageLabel(
					match.params.id
				);
				setInitialContentPageLabel(contentLabel);
				setContentPageLabel(contentLabel);
			} catch (err) {
				console.error(
					new CustomError('Failed to get content page label by id', err, {
						query: 'GET_CONTENT_PAGE_LABEL_BY_ID',
						variables: { id: match.params.id },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t('Het ophalen van de content pagina label is mislukt'),
				});
			}
		}
	}, [isCreatePage, match.params.id, setLoadingInfo, setContentPageLabel, t]);

	useEffect(() => {
		initOrFetchContentPageLabel();
	}, [initOrFetchContentPageLabel]);

	useEffect(() => {
		if (contentPageLabel) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [contentPageLabel, setLoadingInfo]);

	const navigateBack = () => {
		if (isCreatePage) {
			history.push(CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW);
		} else {
			navigate(history, CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL, {
				id: match.params.id,
			});
		}
	};

	const getFormErrors = (): ContentPageLabelEditFormErrorState | null => {
		if (!contentPageLabel || !contentPageLabel.label) {
			return {
				label: t('Een label is verplicht'),
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

			if (!initialContentPageLabel || !contentPageLabel) {
				ToastService.danger(
					t(
						'Het opslaan van de permissie groep is mislukt omdat de permissie groep nog niet is geladen'
					),
					false
				);
				return;
			}

			setIsSaving(true);

			let contentPageLabelId: number | string;
			if (isCreatePage) {
				// insert the content page label
				contentPageLabelId = await ContentPageLabelService.insertContentPageLabel(
					contentPageLabel
				);
			} else {
				// Update existing content page label
				await ContentPageLabelService.updateContentPageLabel(contentPageLabel);
				contentPageLabelId = match.params.id;
			}

			ToastService.success(t('De content pagina label is opgeslagen'), false);
			if (isCreatePage) {
				redirectToClientPage(
					buildLink(ADMIN_PATH.CONTENT_PAGE_LABEL_EDIT, { id: contentPageLabelId }),
					history
				);
			} else {
				redirectToClientPage(
					buildLink(ADMIN_PATH.CONTENT_PAGE_LABEL_DETAIL, { id: contentPageLabelId }),
					history
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to save content page label', err, {
					contentPageLabel,
					initialContentPageLabel,
				})
			);
			ToastService.danger(t('Het opslaan van de permissiegroep is mislukt'), false);
		}
		setIsSaving(false);
	};

	const renderEditPage = () => {
		if (!contentPageLabel) {
			return;
		}
		return (
			<>
				<Container size="medium">
					<Spacer margin="bottom-extra-large">
						<Box backgroundColor="gray">
							<Form>
								<FormGroup label={t('Label')} error={formErrors.label} required>
									<TextInput
										value={contentPageLabel.label || ''}
										onChange={newLabel =>
											setContentPageLabel({
												...contentPageLabel,
												label: newLabel,
											})
										}
									/>
								</FormGroup>
								<FormGroup
									label={t('Content pagina type')}
									error={formErrors.content_type}
								>
									<Select
										options={contentTypes}
										value={contentPageLabel.content_type}
										onChange={newContentType =>
											setContentPageLabel({
												...contentPageLabel,
												content_type: newContentType as Avo.ContentPage.Type,
											})
										}
									/>
								</FormGroup>
							</Form>
						</Box>
					</Spacer>
				</Container>
			</>
		);
	};

	// Render
	const renderPage = () => (
		<AdminLayout
			showBackButton
			pageTitle={
				isCreatePage
					? t('Content pagina label aanmaken')
					: t('Content pagina label aanpassen')
			}
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button label={t('Annuleer')} onClick={navigateBack} type="tertiary" />
					<Button disabled={isSaving} label={t('Opslaan')} onClick={handleSave} />
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">{renderEditPage()}</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						isCreatePage
							? t('Permissiegroep beheer aanmaak pagina titel')
							: t('Permissiegroep beheer bewerk pagina titel')
					)}
				</title>
				<meta
					name="description"
					content={
						isCreatePage
							? t('Permissiegroep beheer aanmaak pagina beschrijving')
							: t('Permissiegroep beheer bewerk pagina beschrijving')
					}
				/>
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={contentPageLabel}
				render={renderPage}
			/>
		</>
	);
};

export default ContentPageLabelEdit;
