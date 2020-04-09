import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, ButtonToolbar, Container, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { redirectToExternalPage } from '../../../authentication/helpers/redirects';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { CustomError, getEnv } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';

import { GET_USER_BY_ID } from '../user.gql';

interface UserDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const UserDetail: FunctionComponent<UserDetailProps> = ({ match, user }) => {
	// Hooks
	const [storedProfile, setStoredProfile] = useState<Avo.User.Profile | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [t] = useTranslation();

	const fetchProfileById = useCallback(async () => {
		try {
			const response = await dataService.query({
				query: GET_USER_BY_ID,
				variables: {
					id: match.params.id,
				},
			});
			const dbProfile = get(response, 'data.users_profiles[0]');
			if (!dbProfile) {
				console.error(
					new CustomError('Response from graphql is empty', null, {
						response,
						query: 'GET_USER_BY_ID',
						variables: {
							id: match.params.id,
						},
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t(
						'admin/users/views/user-detail___het-ophalen-van-de-gebruiker-info-is-mislukt'
					),
				});
				return;
			}
			setStoredProfile(dbProfile);
		} catch (err) {
			console.error(
				new CustomError('Failed to get user by id', err, {
					query: 'GET_USER_BY_ID',
					variables: {
						id: match.params.id,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/users/views/user-detail___het-ophalen-van-de-gebruiker-info-is-mislukt'
				),
			});
		}
	}, [setStoredProfile, setLoadingInfo, t, match.params.id]);

	useEffect(() => {
		fetchProfileById();
	}, [fetchProfileById]);

	useEffect(() => {
		if (storedProfile) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [storedProfile, setLoadingInfo]);

	const getLdapDashboardUrl = () => {
		const userLdapUuid = get(storedProfile, 'idpmaps[0].idp_user_id');
		if (userLdapUuid) {
			return `${getEnv('LDAP_DASHBOARD_PEOPLE_URL')}/${userLdapUuid}`;
		}
		return null;
	};

	const handleLdapDashboardClick = () => {
		redirectToExternalPage(getLdapDashboardUrl() as string, '_blank');
	};

	const canBanUser = (): boolean => {
		return PermissionService.hasPerm(user, PermissionName.EDIT_BAN_USER_STATUS);
	};

	const renderUserDetail = () => {
		if (!storedProfile) {
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
					<Table horizontal variant="invisible" className="c-table_detail-page">
						<tbody>
							{renderDetailRow(
								<Avatar
									image={get(storedProfile, 'profile.avatar')}
									size="large"
								/>,
								t('Avatar')
							)}
							{renderSimpleDetailRows(storedProfile, [
								['user.first_name', t('admin/users/views/user-detail___voornaam')],
								['user.last_name', t('admin/users/views/user-detail___achternaam')],
								['alias', t('admin/users/views/user-detail___gebruikersnaam')],
								[
									'user.mail',
									t('admin/users/views/user-detail___primair-email-adres'),
								],
								[
									'alternative_email',
									t('admin/users/views/user-detail___secundair-email-adres'),
								],
							])}
							{renderDateDetailRows(storedProfile, [
								['created_at', 'Aangemaakt op'],
								['updated_at', 'Aangepast op'],
							])}
							{renderSimpleDetailRows(storedProfile, [
								['bio', t('admin/users/views/user-detail___bio')],
								['function', t('admin/users/views/user-detail___functie')],
								['stamboek', t('admin/users/views/user-detail___stamboek-nummer')],
							])}
						</tbody>
					</Table>
				</Container>
			</Container>
		);
	};

	const renderUserDetailPage = () => (
		<AdminLayout
			showBackButton
			pageTitle={t('admin/users/views/user-detail___gebruiker-details')}
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					{canBanUser() && (
						<Button
							type="danger"
							label={t('admin/users/views/user-detail___bannen')}
							onClick={() =>
								ToastService.info(
									t('settings/components/profile___nog-niet-geimplementeerd'),
									false
								)
							}
						/>
					)}
					<Button
						label={t('admin/users/views/user-detail___beheer-in-account-manager')}
						disabled={!getLdapDashboardUrl()}
						title={
							getLdapDashboardUrl()
								? ''
								: t(
										'admin/users/views/user-detail___deze-gebruiker-is-niet-gelinked-aan-een-archief-account'
								  )
						}
						onClick={handleLdapDashboardClick}
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>{renderUserDetail()}</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={storedProfile}
			render={renderUserDetailPage}
		/>
	);
};

export default UserDetail;
