import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Flex,
	Form,
	FormGroup,
	Grid,
	IconName,
	Select,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import React, { type FC, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { navigate } from '../../../shared/helpers/link';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { PROXY_PATH_SHORTCUT } from '../helpers/replace-proxy-url-template-with-url';
import { useCreateUrlRedirect } from '../hooks/useCreateUrlRedirect';
import { useGetUrlRedirectById } from '../hooks/useGetUrlRedirectById';
import { useUpdateUrlRedirect } from '../hooks/useUpdateUrlRedirect';
import {
	INITIAL_URL_REDIRECT,
	URL_REDIRECT_PATH,
	URL_REDIRECT_PATTERN_OPTIONS,
} from '../url-redirects.const';
import {
	type UrlRedirect,
	type UrlRedirectEditFormErrorState,
	type UrlRedirectPathPattern,
} from '../url-redirects.types';

const UrlRedirectEdit: FC<DefaultSecureRouteProps<{ id: string }>> = ({ match, history }) => {
	const { tText, tHtml } = useTranslation();

	const [formErrors, setFormErrors] = useState<UrlRedirectEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [updatedUrlRedirect, setUpdatedUrlRedirect] = useState<UrlRedirect>(
		INITIAL_URL_REDIRECT()
	);

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);
	const urlRedirectId = parseInt(match.params.id);

	const { mutateAsync: createUrlRedirect } = useCreateUrlRedirect();
	const { mutateAsync: updateUrlRedirect } = useUpdateUrlRedirect();
	const { data: loadedUrlRedirect, isLoading, error } = useGetUrlRedirectById(urlRedirectId);

	useEffect(() => {
		if (loadedUrlRedirect) {
			setUpdatedUrlRedirect(loadedUrlRedirect);
		}
	}, [loadedUrlRedirect]);

	const navigateBack = () => {
		history.push(URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW);
	};

	const getFormErrors = (): UrlRedirectEditFormErrorState | null => {
		if (!updatedUrlRedirect?.oldPath) {
			return {
				old_path: tText('Een oude url is verplicht'),
			};
		} else if (!updatedUrlRedirect.oldPath.startsWith('/')) {
			return {
				old_path: tText('De url moet starten met /'),
			};
		}

		if (!updatedUrlRedirect?.newPath) {
			return {
				new_path: tText('Een nieuwe url is verplicht'),
			};
		} else if (
			!(
				updatedUrlRedirect.newPath.startsWith('/') ||
				updatedUrlRedirect.newPath.startsWith(PROXY_PATH_SHORTCUT)
			)
		) {
			return {
				new_path: tText('De url moet starten met / of {{PROXY_URL}}'),
			};
		}
		return null;
	};

	const handleSave = async () => {
		try {
			const errors = getFormErrors();
			setFormErrors(errors || {});
			if (errors) {
				ToastService.danger(tHtml('De invoer is ongeldig'));
				return;
			}

			setIsSaving(true);

			if (isCreatePage) {
				await createUrlRedirect(updatedUrlRedirect);
			} else {
				await updateUrlRedirect(updatedUrlRedirect);
			}

			redirectToClientPage(buildLink(URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW), history);
			ToastService.success(tHtml('De url redirect is opgeslagen'));
		} catch (err) {
			console.error(
				new CustomError('Failed to save url redirect', err, {
					updatedUrlRedirect,
				})
			);

			ToastService.danger(
				(err as CustomError)?.additionalInfo?.errorMessage ||
					tHtml('Het opslaan van de url redirect is mislukt')
			);
		}
		setIsSaving(false);
	};

	const renderEditPage = () => {
		if (isLoading) {
			return (
				<Spacer margin={['top-large', 'bottom-large']}>
					<Flex center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}

		if (error || !loadedUrlRedirect) {
			return (
				<ErrorView
					message={tHtml('Het ophalen van de url redirect is mislukt')}
					icon={IconName.alertTriangle}
				/>
			);
		}

		return (
			<Container size="medium">
				<Form>
					<Grid>
						<Column size="7">
							<FormGroup
								label={tText('Oude url')}
								error={formErrors.old_path}
								required
							>
								<TextInput
									value={updatedUrlRedirect.oldPath || ''}
									onChange={(newValue: string) =>
										setUpdatedUrlRedirect({
											...updatedUrlRedirect,
											oldPath: newValue,
										})
									}
								/>
							</FormGroup>
						</Column>
						<Column size="5">
							<FormGroup
								label={tText('Oude url patroon')}
								error={formErrors.oldPathPattern}
							>
								<Select
									options={URL_REDIRECT_PATTERN_OPTIONS()}
									value={updatedUrlRedirect.oldPathPattern}
									onChange={(newContentType) =>
										setUpdatedUrlRedirect({
											...updatedUrlRedirect,
											oldPathPattern:
												newContentType as UrlRedirectPathPattern,
										})
									}
								/>
							</FormGroup>
						</Column>
					</Grid>
					<FormGroup label={tText('Nieuwe url')} error={formErrors.new_path} required>
						<TextInput
							value={updatedUrlRedirect.newPath || ''}
							onChange={(newValue: string) =>
								setUpdatedUrlRedirect({
									...updatedUrlRedirect,
									newPath: newValue,
								})
							}
						/>
					</FormGroup>
				</Form>
			</Container>
		);
	};

	// Render
	const renderPage = () => {
		return (
			<AdminLayout
				onClickBackButton={() => navigate(history, ADMIN_PATH.URL_REDIRECT_OVERVIEW)}
				pageTitle={
					isCreatePage ? tText('Url redirect aanmaken') : tText('Url redirect aanpassen')
				}
				size="full-width"
			>
				<AdminLayoutTopBarRight>
					<ButtonToolbar>
						<Button label={tText('Annuleer')} onClick={navigateBack} type="secondary" />
						<Button
							disabled={isLoading || !!error || isSaving}
							label={tText('Opslaan')}
							onClick={handleSave}
							type="primary"
						/>
					</ButtonToolbar>
				</AdminLayoutTopBarRight>
				<AdminLayoutBody>{renderEditPage()}</AdminLayoutBody>
			</AdminLayout>
		);
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						isCreatePage
							? tText('url redirect beheer aanmaak pagina titel')
							: tText('url redirect beheer bewerk pagina titel')
					)}
				</title>
				<meta
					name="description"
					content={
						isCreatePage
							? tText('url redirect beheer aanmaak pagina beschrijving')
							: tText('url redirect beheer bewerk pagina beschrijving')
					}
				/>
			</Helmet>
			{renderPage()}
		</>
	);
};

export default UrlRedirectEdit;
