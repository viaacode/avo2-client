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
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink, CustomError, navigate } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import { ContentPageType } from '../../content/content.types';
import { useContentTypes } from '../../content/hooks';
import { ContentPicker } from '../../shared/components/ContentPicker/ContentPicker';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { CONTENT_PAGE_LABEL_PATH } from '../content-page-label.const';
import { ContentPageLabelService } from '../content-page-label.service';
import { ContentPageLabel, ContentPageLabelEditFormErrorState } from '../content-page-label.types';

type ContentPageLabelEditProps = DefaultSecureRouteProps<{ id: string }>;

const ContentPageLabelEdit: FunctionComponent<ContentPageLabelEditProps> = ({
	history,
	match,
	location,
}) => {
	const { tText, tHtml } = useTranslation();

	// Hooks
	const [initialContentPageLabel, setInitialContentPageLabel] = useState<ContentPageLabel | null>(
		null
	);
	const [contentPageLabelInfo, setContentPageLabelInfo] = useState<ContentPageLabel | null>(null);

	const [formErrors, setFormErrors] = useState<ContentPageLabelEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [contentTypes] = useContentTypes();

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);

	const initOrFetchContentPageLabel = useCallback(async () => {
		if (isCreatePage) {
			const contentLabel = {
				label: '',
				content_type: 'PAGINA',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				permissions: [],
			} as unknown as ContentPageLabel;
			setInitialContentPageLabel(contentLabel);
			setContentPageLabelInfo(contentLabel);
		} else {
			try {
				const contentLabel = await ContentPageLabelService.fetchContentPageLabel(
					parseInt(match.params.id)
				);
				setInitialContentPageLabel(contentLabel);
				setContentPageLabelInfo(contentLabel);
			} catch (err) {
				console.error(
					new CustomError('Failed to get content page label by id', err, {
						query: 'GET_CONTENT_PAGE_LABEL_BY_ID',
						variables: { id: match.params.id },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: tText(
						'admin/content-page-labels/views/content-page-label-edit___het-ophalen-van-de-content-pagina-label-is-mislukt'
					),
				});
			}
		}
	}, [isCreatePage, match.params.id, setLoadingInfo, setContentPageLabelInfo, tText]);

	useEffect(() => {
		initOrFetchContentPageLabel();
	}, [initOrFetchContentPageLabel]);

	useEffect(() => {
		if (contentPageLabelInfo) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [contentPageLabelInfo, setLoadingInfo]);

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
		if (!contentPageLabelInfo || !contentPageLabelInfo.label) {
			return {
				label: tText(
					'admin/content-page-labels/views/content-page-label-edit___een-label-is-verplicht'
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
					tHtml(
						'admin/content-page-labels/views/content-page-label-edit___de-invoer-is-ongeldig'
					)
				);
				return;
			}

			if (!initialContentPageLabel || !contentPageLabelInfo) {
				ToastService.danger(
					tHtml(
						'admin/content-page-labels/views/content-page-label-edit___het-opslaan-van-het-content-pagina-label-is-mislukt-omdat-het-label-nog-niet-is-geladen'
					)
				);
				return;
			}

			setIsSaving(true);

			let contentPageLabelId: number | string;
			if (isCreatePage) {
				// insert the content page label
				contentPageLabelId = await ContentPageLabelService.insertContentPageLabel(
					contentPageLabelInfo
				);
			} else {
				// Update existing content page label
				await ContentPageLabelService.updateContentPageLabel(contentPageLabelInfo);
				contentPageLabelId = match.params.id;
			}

			ToastService.success(
				tHtml(
					'admin/content-page-labels/views/content-page-label-edit___de-content-pagina-label-is-opgeslagen'
				)
			);
			redirectToClientPage(
				buildLink(ADMIN_PATH.CONTENT_PAGE_LABEL_DETAIL, { id: contentPageLabelId }),
				history
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to save content page label', err, {
					contentPageLabelInfo,
					initialContentPageLabel,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/content-page-labels/views/content-page-label-edit___het-opslaan-van-de-permissiegroep-is-mislukt'
				)
			);
		}
		setIsSaving(false);
	};

	const renderEditPage = () => {
		if (!contentPageLabelInfo) {
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
										'admin/content-page-labels/views/content-page-label-edit___label'
									)}
									error={formErrors.label}
									required
								>
									<TextInput
										value={contentPageLabelInfo.label || ''}
										onChange={(newLabel) =>
											setContentPageLabelInfo({
												...contentPageLabelInfo,
												label: newLabel,
											})
										}
									/>
								</FormGroup>
								<FormGroup
									label={tText(
										'admin/content-page-labels/views/content-page-label-edit___content-pagina-type'
									)}
									error={formErrors.content_type}
								>
									<Select
										options={contentTypes}
										value={contentPageLabelInfo.content_type}
										onChange={(newContentType) =>
											setContentPageLabelInfo({
												...contentPageLabelInfo,
												content_type: newContentType as ContentPageType,
											})
										}
									/>
								</FormGroup>
								<FormGroup
									label={tText(
										'admin/content-page-labels/views/content-page-label-edit___link-naar'
									)}
									error={formErrors.link_to}
								>
									<ContentPicker
										allowedTypes={[
											'CONTENT_PAGE',
											'ITEM',
											'COLLECTION',
											'BUNDLE',
											'INTERNAL_LINK',
											'EXTERNAL_LINK',
										]}
										onSelect={(newLinkTo) =>
											setContentPageLabelInfo({
												...contentPageLabelInfo,
												link_to: newLinkTo,
											})
										}
										initialValue={contentPageLabelInfo.link_to || undefined}
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
			onClickBackButton={() => navigate(history, ADMIN_PATH.CONTENT_PAGE_LABEL_OVERVIEW)}
			pageTitle={
				isCreatePage
					? tText(
							'admin/content-page-labels/views/content-page-label-edit___content-pagina-label-aanmaken'
					  )
					: tText(
							'admin/content-page-labels/views/content-page-label-edit___content-pagina-label-aanpassen'
					  )
			}
			size="large"
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						label={tText(
							'admin/content-page-labels/views/content-page-label-edit___annuleer'
						)}
						onClick={navigateBack}
						type="tertiary"
					/>
					<Button
						disabled={isSaving}
						label={tText(
							'admin/content-page-labels/views/content-page-label-edit___opslaan'
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
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						isCreatePage
							? tText(
									'admin/content-page-labels/views/content-page-label-edit___permissiegroep-beheer-aanmaak-pagina-titel'
							  )
							: tText(
									'admin/content-page-labels/views/content-page-label-edit___permissiegroep-beheer-bewerk-pagina-titel'
							  )
					)}
				</title>
				<meta
					name="description"
					content={
						isCreatePage
							? tText(
									'admin/content-page-labels/views/content-page-label-edit___permissiegroep-beheer-aanmaak-pagina-beschrijving'
							  )
							: tText(
									'admin/content-page-labels/views/content-page-label-edit___permissiegroep-beheer-bewerk-pagina-beschrijving'
							  )
					}
				/>
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={contentPageLabelInfo}
				render={renderPage}
			/>
		</>
	);
};

export default ContentPageLabelEdit;
