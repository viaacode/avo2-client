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
} from '@viaa/avo2-components';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { CustomError, formatDate } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { GET_USER_GROUP_BY_ID } from '../user-group.gql';
import { UserGroupService } from '../user-group.service';
import { UserGroup } from '../user-group.types';

interface UserDetailProps extends RouteComponentProps<{ id: string }> {}

const UserGroupDetail: FunctionComponent<UserDetailProps> = ({ history, match }) => {
	// Hooks
	const [userGroup, setUserGroup] = useState<UserGroup | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

	const [t] = useTranslation();

	const fetchUserGroupById = useCallback(async () => {
		try {
			const response = await dataService.query({
				query: GET_USER_GROUP_BY_ID,
				variables: {
					id: match.params.id,
				},
			});
			const dbUserGroup = get(response, 'data.users_groups[0]');
			if (!dbUserGroup) {
				console.error(
					new CustomError('Response from graphql is empty', null, {
						response,
						query: 'GET_USER_GROUP_BY_ID',
						variables: {
							id: match.params.id,
						},
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t('Het ophalen van de gebruikersgroep is mislukt'),
				});
				return;
			}
			setUserGroup(dbUserGroup);
		} catch (err) {
			console.error(
				new CustomError('Failed to get user group by id', err, {
					query: 'GET_USER_GROUP_BY_ID',
					variables: {
						id: match.params.id,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de gebruikersgroep is mislukt'),
			});
		}
	}, [setUserGroup, setLoadingInfo, t, match.params.id]);

	useEffect(() => {
		fetchUserGroupById();
	}, [fetchUserGroupById]);

	useEffect(() => {
		if (userGroup) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [userGroup, setLoadingInfo]);

	const handleDelete = async () => {
		try {
			if (!userGroup) {
				ToastService.danger(
					t(
						'Het verwijderen van de gebruikersgroep is mislukt opdat de groep nog niet geladen is'
					)
				);
				return;
			}
			await UserGroupService.deleteUserGroup(userGroup.id);
			ToastService.success(t('De gebruikersgroep is verwijdert'));
			redirectToClientPage(ADMIN_PATH.USER_GROUP_OVERVIEW, history);
		} catch (err) {
			console.error(new CustomError('Failed to delete user group', err, { userGroup }));
			ToastService.danger(t('Het verwijderen van de gebruikersgroep is mislukt'));
		}
	};

	const renderUserDetail = () => {
		if (!userGroup) {
			console.error(
				new CustomError(
					'Failed to load user because render function is called before user was fetched'
				)
			);
			return;
		}
		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Table horizontal variant="invisible">
						<tbody>
							<tr>
								<th>
									<Trans>Label</Trans>
								</th>
								<td>{get(userGroup, 'label') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Description</Trans>
								</th>
								<td>{get(userGroup, 'description') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Aangemaakt op</Trans>
								</th>
								<td>{formatDate(userGroup.created_at)}</td>
							</tr>
							<tr>
								<th>
									<Trans>Aangepast op</Trans>
								</th>
								<td>{formatDate(userGroup.updated_at)}</td>
							</tr>
							<tr>
								<th>
									<Trans>Bio</Trans>
								</th>
								<td>{get(userGroup, 'bio') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Functie</Trans>
								</th>
								<td>{get(userGroup, 'function') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Stamboek nummer</Trans>
								</th>
								<td>{get(userGroup, 'stamboek') || '-'}</td>
							</tr>
						</tbody>
					</Table>
				</Container>
			</Container>
		);
	};

	const renderUserDetailPage = () => (
		<AdminLayout showBackButton>
			<AdminLayoutHeader>
				<Header category="audio" title={t('Gebruikersgroep details')} showMetaData={false}>
					<HeaderButtons>
						<ButtonToolbar>
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
				{renderUserDetail()}
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete()}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={userGroup}
			render={renderUserDetailPage}
		/>
	);
};

export default UserGroupDetail;
