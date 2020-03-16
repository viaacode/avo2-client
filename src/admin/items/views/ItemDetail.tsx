import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import {
	Button,
	ButtonToolbar,
	Container,
	Header,
	HeaderButtons,
	Table,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import {
	renderDateDetailRows,
	renderMultiOptionDetailRows,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { ItemsService } from '../items.service';

interface ItemDetailProps extends RouteComponentProps<{ id: string }> {}

const ItemDetail: FunctionComponent<ItemDetailProps> = ({ history, match }) => {
	// Hooks
	const [item, setItem] = useState<Avo.Item.Item | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState<boolean>(false);

	const [t] = useTranslation();

	const fetchItemById = useCallback(async () => {
		try {
			setItem(await ItemsService.fetchItem(match.params.id));
		} catch (err) {
			console.error(
				new CustomError('Failed to get item by id', err, {
					query: 'GET_ITEM_BY_ID',
					variables: {
						id: match.params.id,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de item info is mislukt'),
			});
		}
	}, [setItem, setLoadingInfo, t, match.params.id]);

	useEffect(() => {
		fetchItemById();
	}, [fetchItemById]);

	useEffect(() => {
		if (item) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [item, setLoadingInfo]);

	const toggleItemPublishedState = async () => {
		try {
			if (!item) {
				throw new CustomError('The item has not been loaded yet', null, { item });
			}
			await ItemsService.setItemPublishedState(item.uid, !item.is_published);
			ToastService.success(
				item.is_published ? t('Het item is gepubliceerd') : t('Het item is gedepubliceerd')
			);
			setItem({
				...item,
				is_published: !item.is_published,
			});
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle is_published state for item', err, { item })
			);
			ToastService.danger(t('Het (de)publiceren van het item is mislukt'));
		}
	};

	const navigateToItemDetail = () => {
		if (!item) {
			ToastService.danger(t('Dit item heeft geen geldig pid'), false);
			return;
		}
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, { id: item.external_id });
		redirectToClientPage(link, history);
	};

	const renderItemDetail = () => {
		if (!item) {
			console.error(
				new CustomError(
					'Failed to load item because render function is called before item was fetched'
				)
			);
			return;
		}
		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Table horizontal variant="invisible" className="c-table_detail-page">
						<tbody>
							<tr>
								<th>
									<Trans>Cover Afbeelding</Trans>
								</th>
								<td>
									<Container size="medium">
										<Thumbnail
											category={get(item, 'type.label', 'video')}
											src={item.thumbnail_path}
										/>
									</Container>
								</td>
							</tr>
							{renderSimpleDetailRows(item, [
								['uid', t('AvO UUID')],
								['external_id', t('PID')],
								['title', t('Titel')],
								['description', t('Beschrijving')],
								['type.label', t('Type')],
								['series', t('Reeks')],
								['organisation.name', t('CP')],
								['duration', t('Lengte')],
								['is_published', t('Pubiek')],
								['is_deleted', t('Verwijderd')],
							])}
							{renderDateDetailRows(item, [
								['created_at', t('Aangemaakt op')],
								['updated_at', t('Aangepast op')],
								['issued', t('Uitgegeven op')],
								['published_at', t('Gepubliceert op')],
								['publish_at', t('Te publiceren op')],
								['depublish_at', t('Te depubliceren op')],
								['expiry_date', t('Expiratie datum')],
							])}
							{renderMultiOptionDetailRows(item, [
								['lom_classification', t('Vakken')],
								['lom_context', t('Opleidingniveaus')],
								['lom_intendedenduserrole', t('Bedoeld voor')],
								['lom_keywords', t('Trefwoorden')],
								['lom_languages', t('Talen')],
								['lom_typicalagerange', t('Leeftijdsgroepen')],
							])}
							{renderSimpleDetailRows(item, [
								['view_counts_aggregate.aggregate.count', t('Views')],
							])}
						</tbody>
					</Table>
					<DeleteObjectModal
						title={item.is_published ? t('Depubliceren') : t('Publiceren')}
						body={
							item.is_published
								? t('Weet je zeker dat je dit item wil depubliceren?')
								: t('Weet je zeker dat je dit item wil publiceren?')
						}
						confirmLabel={item.is_published ? t('Depubliceren') : 'Publiceren'}
						isOpen={isConfirmPublishModalOpen}
						onClose={() => setIsConfirmPublishModalOpen(false)}
						deleteObjectCallback={toggleItemPublishedState}
					/>
				</Container>
			</Container>
		);
	};

	const renderItemDetailPage = () => (
		<AdminLayout showBackButton>
			<AdminLayoutHeader>
				<Header category="audio" title={t('Item details')} showMetaData={false}>
					<HeaderButtons>
						{!!item && (
							<ButtonToolbar>
								<Button
									label={item.is_published ? t('Depubliceren') : t('Publiceren')}
									onClick={() => setIsConfirmPublishModalOpen(true)}
								/>
								<Button
									label={t('Bekijk item in de website')}
									onClick={navigateToItemDetail}
								/>
							</ButtonToolbar>
						)}
					</HeaderButtons>
				</Header>
			</AdminLayoutHeader>
			<AdminLayoutBody>{renderItemDetail()}</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={item}
			render={renderItemDetailPage}
		/>
	);
};

export default ItemDetail;
