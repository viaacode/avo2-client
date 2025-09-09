import {
	Button,
	ButtonToolbar,
	Container,
	Form,
	FormGroup,
	Select,
	TextInput,
} from '@viaa/avo2-components';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { GENERATE_SITE_TITLE } from '../../../constants';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
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
import { useCreateRedirectDetail } from '../hooks/useCreateRedirectDetail';
import { useUpdateRedirectDetail } from '../hooks/useUpdateRedirectDetail';
import { REDIRECT_DETAIL_PATH, REDIRECT_DETAIL_TYPE_OPTIONS } from '../redirect-detail.const';
import { RedirectDetailService } from '../redirect-detail.service';
import {
	type RedirectDetail,
	type RedirectDetailEditFormErrorState,
	RedirectDetailType,
} from '../redirect-detail.types';

const RedirectDetailEdit: FC<DefaultSecureRouteProps<{ id: string }>> = ({ match, history }) => {
	const { tText, tHtml } = useTranslation();

	const [initialRedirectDetail, setInitialRedirectDetail] = useState<RedirectDetail | null>(null);
	const [redirectDetail, setRedirectDetail] = useState<RedirectDetail | null>(null);

	const [formErrors, setFormErrors] = useState<RedirectDetailEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);
	const redirectDetailId = parseInt(match.params.id);

	const { mutateAsync: createRedirectDetail } = useCreateRedirectDetail();
	const { mutateAsync: updateRedirectDetail } = useUpdateRedirectDetail();

	const initOrFetchRedirectDetail = useCallback(async () => {
		if (isCreatePage) {
			const redirectDetail: RedirectDetail = {
				oldPath: '/',
				newPath: '/',
				type: RedirectDetailType.MARCOM,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			} as unknown as RedirectDetail;
			setInitialRedirectDetail(redirectDetail);
			setRedirectDetail(redirectDetail);
		} else {
			try {
				const redirectDetail =
					await RedirectDetailService.fetchRedirectDetail(redirectDetailId);
				setInitialRedirectDetail(redirectDetail);
				setRedirectDetail(redirectDetail);
			} catch (err) {
				console.error(
					new CustomError('Failed to get redirect detail by id', err, {
						redirectDetailId,
					})
				);
				setLoadingInfo({
					state: 'error',
					message: tText('Het ophalen van de redirect is mislukt'),
				});
			}
		}
	}, [isCreatePage, redirectDetailId, tText]);

	useEffect(() => {
		initOrFetchRedirectDetail();
	}, [initOrFetchRedirectDetail]);

	useEffect(() => {
		if (redirectDetail) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [redirectDetail]);

	const navigateBack = () => {
		history.push(REDIRECT_DETAIL_PATH.REDIRECT_OVERVIEW);
	};

	const getFormErrors = (): RedirectDetailEditFormErrorState | null => {
		if (!redirectDetail?.oldPath) {
			return {
				old_path: tText('Een oude url is verplicht'),
			};
		} else if (!redirectDetail.oldPath.startsWith('/')) {
			return {
				old_path: tText('De url moet starten met /'),
			};
		}

		if (!redirectDetail?.newPath) {
			return {
				new_path: tText('Een nieuwe url is verplicht'),
			};
		} else if (
			redirectDetail.newPath.startsWith('{{PROXY_URL}}') &&
			redirectDetail.type === RedirectDetailType.TECHNICAL
		) {
			// Technical types can start with {{PROXY_URL}}
			return null;
		} else if (!redirectDetail.newPath.startsWith('/')) {
			return {
				new_path: tText('De url moet starten met /'),
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

			if (!initialRedirectDetail || !redirectDetail) {
				ToastService.danger(
					tHtml(
						'Het opslaan van de redirect is mislukt om de redirect nog niet is geladen'
					)
				);
				return;
			}

			setIsSaving(true);

			if (isCreatePage) {
				await createRedirectDetail(redirectDetail);
			} else {
				await updateRedirectDetail(redirectDetail);
			}

			redirectToClientPage(buildLink(REDIRECT_DETAIL_PATH.REDIRECT_OVERVIEW), history);
			ToastService.success(tHtml('De redirect is opgeslagen'));
		} catch (err) {
			console.error(
				new CustomError('Failed to save redirect detail', err, {
					redirectDetail,
					initialRedirectDetail,
				})
			);

			ToastService.danger(tHtml('Het opslaan van de redirect is mislukt'));
		}
		setIsSaving(false);
	};

	const renderEditPage = () => {
		if (!redirectDetail) {
			return;
		}
		return (
			<Container size="medium">
				<Form>
					<FormGroup label={tText('Oude url')} error={formErrors.old_path} required>
						<TextInput
							value={redirectDetail.oldPath || ''}
							onChange={(newValue: string) =>
								setRedirectDetail({
									...redirectDetail,
									oldPath: newValue,
								})
							}
						/>
					</FormGroup>
					<FormGroup label={tText('Nieuwe url')} error={formErrors.new_path} required>
						<TextInput
							value={redirectDetail.newPath || ''}
							onChange={(newValue: string) =>
								setRedirectDetail({
									...redirectDetail,
									newPath: newValue,
								})
							}
						/>
					</FormGroup>
					<FormGroup label={tText('Redirect type')} error={formErrors.type}>
						<Select
							options={REDIRECT_DETAIL_TYPE_OPTIONS()}
							value={redirectDetail.type}
							onChange={(newContentType) =>
								setRedirectDetail({
									...redirectDetail,
									type: newContentType as RedirectDetailType,
								})
							}
						/>
					</FormGroup>
				</Form>
			</Container>
		);
	};

	// Render
	const renderPage = () => (
		<AdminLayout
			onClickBackButton={() => navigate(history, ADMIN_PATH.REDIRECT_OVERVIEW)}
			pageTitle={isCreatePage ? tText('Redirect aanmaken') : tText('Redirect aanpassen')}
			size="full-width"
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button label={tText('Annuleer')} onClick={navigateBack} type="secondary" />
					<Button
						disabled={isSaving}
						label={tText('Opslaan')}
						onClick={handleSave}
						type="primary"
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>{renderEditPage()}</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						isCreatePage
							? tText('redirect detail beheer aanmaak pagina titel')
							: tText('redirect detail beheer bewerk pagina titel')
					)}
				</title>
				<meta
					name="description"
					content={
						isCreatePage
							? tText('redirect detail beheer aanmaak pagina beschrijving')
							: tText('redirect detail beheer bewerk pagina beschrijving')
					}
				/>
			</Helmet>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={redirectDetail}
				render={renderPage}
			/>
		</>
	);
};

export default RedirectDetailEdit;
