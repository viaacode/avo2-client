import {
	Button,
	ButtonToolbar,
	Container,
	HeaderButtons,
	Spacer,
	Table,
} from '@viaa/avo2-components';
import { get } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useMatch, useNavigate } from 'react-router';

import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { navigate } from '../../../shared/helpers/link';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { INTERACTIVE_TOUR_PATH } from '../interactive-tour.const';
import { InteractiveTourService } from '../interactive-tour.service';
import { type InteractiveTour } from '../interactive-tour.types';

export const InteractiveTourDetail: FC = () => {
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL);

	const interactiveTourId = match?.params.id;

	// Hooks
	const [interactiveTour, setInteractiveTour] = useState<InteractiveTour | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

	const { tText, tHtml } = useTranslation();

	const fetchInteractiveTourById = useCallback(async () => {
		try {
			if (!interactiveTourId) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'admin/interactive-tour/views/interactive-tour-detail___het-ophalen-van-de-interactive-tour-is-mislukt'
					),
				});
				return;
			}
			setInteractiveTour(
				await InteractiveTourService.fetchInteractiveTour(interactiveTourId)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to get interactive tour by id', err, {
					query: 'GET_INTERACTIVE_TOUR_BY_ID',
					variables: {
						id: interactiveTourId,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'admin/interactive-tour/views/interactive-tour-detail___het-ophalen-van-de-interactive-tour-is-mislukt'
				),
			});
		}
	}, [interactiveTourId, tHtml]);

	useEffect(() => {
		fetchInteractiveTourById();
	}, [fetchInteractiveTourById]);

	useEffect(() => {
		if (interactiveTour) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [interactiveTour, setLoadingInfo]);

	const handleDelete = async () => {
		try {
			setIsConfirmModalOpen(false);
			if (!interactiveTour || !interactiveTour.id) {
				console.error(
					new CustomError(
						'Failed to delete interactive tour because the tour or its id is not set',
						null,
						{ interactiveTour }
					)
				);
				ToastService.danger(
					tHtml(
						'admin/interactive-tour/views/interactive-tour-detail___het-verwijderen-van-de-interactive-tour-is-mislukt'
					)
				);
				return;
			}
			await InteractiveTourService.deleteInteractiveTour(interactiveTour.id);
			ToastService.success(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-detail___de-interactive-tour-is-verwijdert'
				)
			);
			redirectToClientPage(ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW, navigateFunc);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete interactive tour', err, { interactiveTour })
			);
			ToastService.danger(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-detail___het-verwijderen-van-de-interactive-tour-is-mislukt'
				)
			);
		}
	};

	const renderInteractiveTourDetail = () => {
		if (!interactiveTour) {
			console.error(
				new CustomError(
					'Failed to render interactive tour detail because render function is called before interactive tour was fetched'
				)
			);
			return;
		}
		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Spacer margin="bottom-extra-large">
						<Table horizontal variant="invisible" className="c-table_detail-page">
							<tbody>
								{renderSimpleDetailRows(interactiveTour, [
									[
										'name',
										tText(
											'admin/interactive-tour/views/interactive-tour-detail___naam'
										),
									],
								])}
								{renderDetailRow(
									get(APP_PATH, [interactiveTour.page_id, 'route'], '-'),
									tText(
										'admin/interactive-tour/views/interactive-tour-detail___pagina'
									)
								)}
								{renderDateDetailRows(interactiveTour, [
									[
										'created_at',
										tText(
											'admin/interactive-tour/views/interactive-tour-detail___aangemaakt-op'
										),
									],
									[
										'updated_at',
										tText(
											'admin/interactive-tour/views/interactive-tour-detail___aangepast-op'
										),
									],
								])}
							</tbody>
						</Table>
					</Spacer>
				</Container>
			</Container>
		);
	};

	const renderInteractiveTourDetailPage = () => (
		<AdminLayout
			onClickBackButton={() => navigate(navigateFunc, ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW)}
			pageTitle={tText(
				'admin/interactive-tour/views/interactive-tour-detail___interactive-tour-details'
			)}
			size="large"
		>
			<AdminLayoutTopBarRight>
				<HeaderButtons>
					<ButtonToolbar>
						<Button
							type="primary"
							label={tText(
								'admin/interactive-tour/views/interactive-tour-detail___bewerk'
							)}
							title={tText(
								'admin/interactive-tour/views/interactive-tour-detail___bewerk-deze-rondleiding'
							)}
							ariaLabel={tText(
								'admin/interactive-tour/views/interactive-tour-detail___bewerk-deze-rondleiding'
							)}
							onClick={() => {
								redirectToClientPage(
									buildLink(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT, {
										id: interactiveTourId,
									}),
									navigateFunc
								);
							}}
						/>
						<Button
							type="danger"
							label={tText(
								'admin/interactive-tour/views/interactive-tour-detail___verwijderen'
							)}
							title={tText(
								'admin/interactive-tour/views/interactive-tour-detail___verwijder-deze-rondleiding'
							)}
							ariaLabel={tText(
								'admin/interactive-tour/views/interactive-tour-detail___verwijder-deze-rondleiding'
							)}
							onClick={() => setIsConfirmModalOpen(true)}
						/>
					</ButtonToolbar>
				</HeaderButtons>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				{renderInteractiveTourDetail()}
				<ConfirmModal
					confirmCallback={handleDelete}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						get(interactiveTour, 'name'),
						tText(
							'admin/interactive-tour/views/interactive-tour-detail___interactieve-rondleiding-beheer-detail-pagina-titel'
						)
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/interactive-tour/views/interactive-tour-detail___interactieve-rondleiding-beheer-detail-pagina-beschrijving'
					)}
				/>
			</Helmet>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={interactiveTour}
				render={renderInteractiveTourDetailPage}
			/>
		</>
	);
};
