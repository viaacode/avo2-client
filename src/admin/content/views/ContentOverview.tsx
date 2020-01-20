import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Button,
	ButtonToolbar,
	Container,
	Modal,
	ModalBody,
	Spacer,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import { buildLink, formatDate, getFullName, getRole, navigate } from '../../../shared/helpers';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { CONTENT_OVERVIEW_TABLE_COLS, CONTENT_PATH, CONTENT_RESULT_PATH } from '../content.const';
import { DELETE_CONTENT, GET_CONTENT } from '../content.gql';
import { ContentOverviewTableCols } from '../content.types';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history, user }) => {
	// Hooks
	const [contentList, setContentList] = useState<Partial<Avo.Content.Content>[]>([]);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [isNotAdminModalOpen, setIsNotAdminModalOpen] = useState<boolean>(false);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	// Computed
	// TODO: clean up admin check
	const isAdminUser = get(user, 'role.name', null) === 'admin';

	// Methods
	const handleDelete = (refetchContentItems: () => void) => {
		triggerContentDelete({
			variables: { id: idToDelete },
			update: ApolloCacheManager.clearContentCache,
		})
			.then(() => {
				refetchContentItems();
				toastService.success('Het content item is succesvol verwijderd.', false);
			})
			.catch(err => {
				console.error(err);
				toastService.danger('Het verwijderen van het content item is mislukt.', false);
			});
	};

	const openModal = (id: number): void => {
		if (isAdminUser) {
			setIdToDelete(id);
			setIsConfirmModalOpen(true);
		} else {
			setIsNotAdminModalOpen(true);
		}
	};

	// Render
	const renderTableCell = (rowData: Avo.Content.Content, columnId: ContentOverviewTableCols) => {
		const { id, profile, title } = rowData;

		switch (columnId) {
			case 'title':
				return <Link to={buildLink(CONTENT_PATH.CONTENT_DETAIL, { id })}>{title}</Link>;
			case 'author':
				return getFullName(profile) || '-';
			case 'role':
				return getRole(profile) || '-';
			case 'publish_at':
			case 'depublish_at':
			case 'created_at':
			case 'updated_at':
				return !!rowData[columnId] ? formatDate(rowData[columnId] as string) : '-';
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="info"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id })}
							size="small"
							title={t('admin/content/views/content-overview___bekijk-content')}
							type="tertiary"
						/>
						<Button
							icon="edit"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							size="small"
							title={t('admin/content/views/content-overview___pas-content-aan')}
							type="tertiary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(id)}
							size="small"
							title={t('Verwijder content')}
							type="tertiary"
						/>
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderContentOverview = (data: Avo.Content.Content[], refetchContentItems: () => void) => {
		if (data.length) {
			setContentList(data);
		}

		return !data.length ? (
			<ErrorView message={t('Er is nog geen content aangemaakt.')}>
				<p>
					<Trans i18nKey="admin/content/views/content-overview___beschrijving-hoe-content-toe-te-voegen">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
						blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
						ratione quas impedit repudiandae nisi corrupti quis eaque!
					</Trans>
				</p>
				<Spacer margin="top">
					<Button
						icon="plus"
						label={t('admin/content/views/content-overview___content-toevoegen')}
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		) : (
			<div className="c-table-responsive">
				<Table
					columns={CONTENT_OVERVIEW_TABLE_COLS}
					data={data}
					renderCell={(rowData: Avo.Content.Content, columnId: string) =>
						renderTableCell(rowData, columnId as ContentOverviewTableCols)
					}
					rowKey="id"
					variant="bordered"
					emptyStateMessage={t('Er is nog geen content beschikbaar')}
				/>
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete(refetchContentItems)}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
				<Modal
					isOpen={isNotAdminModalOpen}
					onClose={() => setIsNotAdminModalOpen(false)}
					title={t('U heeft niet de juiste rechten')}
				>
					<ModalBody>
						<p>
							<Trans>Contacteer een van de admins om deze pagina te kunnen verwijderen.</Trans>
						</p>
					</ModalBody>
				</Modal>
			</div>
		);
	};

	return (
		<AdminLayout pageTitle="Content overzicht">
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<DataQueryComponent
							renderData={renderContentOverview}
							resultPath={CONTENT_RESULT_PATH.GET}
							query={GET_CONTENT}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				{!!contentList.length ? (
					<Button
						label={t('admin/content/views/content-overview___content-toevoegen')}
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				) : null}
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default ContentOverview;
