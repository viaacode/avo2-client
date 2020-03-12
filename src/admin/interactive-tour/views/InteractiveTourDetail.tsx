import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import {
	Button,
	ButtonToolbar,
	Container,
	Header,
	HeaderButtons,
	Spacer,
	Table,
} from '@viaa/avo2-components';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { INTERACTIVE_TOUR_PATH } from '../interactive-tour.const';
import { GET_INTERACTIVE_TOUR_BY_ID } from '../interactive-tour.gql';
import { InteractiveTourService } from '../interactive-tour.service';
import { InteractiveTour } from '../interactive-tour.types';

interface UserDetailProps extends RouteComponentProps<{ id: string }> {}

const InteractiveTourDetail: FunctionComponent<UserDetailProps> = ({ history, match }) => {
	// Hooks
	const [interactiveTour, setInteractiveTour] = useState<InteractiveTour | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

	const [t] = useTranslation();

	const fetchInteractiveTourById = useCallback(async () => {
		try {
			const response = await dataService.query({
				query: GET_INTERACTIVE_TOUR_BY_ID,
				variables: {
					id: match.params.id,
				},
			});
			const interactiveTourObj = get(response, 'data.app_interactive_tour[0]');

			if (!interactiveTourObj) {
				setLoadingInfo({
					state: 'error',
					icon: 'search',
					message: t('Deze interactieve tour werd niet gevonden'),
				});
				return;
			}

			setInteractiveTour(interactiveTourObj);
		} catch (err) {
			console.error(
				new CustomError('Failed to get interactive tour by id', err, {
					query: 'GET_INTERACTIVE_TOUR_BY_ID',
					variables: {
						id: match.params.id,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de interactive tour is mislukt'),
			});
		}
	}, [setInteractiveTour, setLoadingInfo, t, match.params.id]);

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
			if (!interactiveTour || !interactiveTour.id) {
				console.error(
					new CustomError(
						'Failed to delete interactive tour because the tour or its id is not set',
						null,
						{ interactiveTour }
					)
				);
				ToastService.danger(t('Het verwijderen van de interactive tour is mislukt'));
				return;
			}
			await InteractiveTourService.deleteInteractiveTour(interactiveTour.id);
			ToastService.success(t('De interactive tour is verwijdert'), false);
			redirectToClientPage(ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW, history);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete interactive tour', err, { interactiveTour })
			);
			ToastService.danger(t('Het verwijderen van de interactive tour is mislukt'), false);
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
									['name', t('Naam')],
									['page', t('Pagina')],
								])}
								{renderDateDetailRows(interactiveTour, [
									['created_at', t('Aangemaakt op')],
									['updated_at', t('Aangepast op')],
								])}
							</tbody>
						</Table>
					</Spacer>
				</Container>
			</Container>
		);
	};

	const renderUserDetailPage = () => (
		<AdminLayout showBackButton>
			<AdminLayoutHeader>
				<Header category="audio" title={t('Interactive tour details')} showMetaData={false}>
					<HeaderButtons>
						<ButtonToolbar>
							<Button
								type="primary"
								label={t('Bewerk')}
								onClick={() => {
									redirectToClientPage(
										buildLink(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT, {
											id: match.params.id,
										}),
										history
									);
								}}
							/>
							<Button
								type="danger"
								label={t('Verwijderen')}
								onClick={() => setIsConfirmModalOpen(true)}
							/>
						</ButtonToolbar>
					</HeaderButtons>
				</Header>
			</AdminLayoutHeader>
			<AdminLayoutBody>
				{renderInteractiveTourDetail()}
				<DeleteObjectModal
					deleteObjectCallback={handleDelete}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={interactiveTour}
			render={renderUserDetailPage}
		/>
	);
};

export default InteractiveTourDetail;
