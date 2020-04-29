import { get, sortBy } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Accordion,
	Avatar,
	Button,
	ButtonToolbar,
	Container,
	Spacer,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { redirectToExternalPage } from '../../../authentication/helpers/redirects';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError, getEnv } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';

import { GET_USER_BY_ID } from '../user.gql';
import {
	RawPermissionLink,
	RawUserGroupLink,
	RawUserGroupPermissionGroupLink,
} from '../user.types';

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

	const renderList = (list: { id: number; label: string }[], path?: string): ReactNode => {
		return (
			<Table horizontal variant="invisible" className="c-table_detail-page">
				<tbody>
					{list.map(item => {
						return (
							<tr key={`user-group-row-${item.id}`}>
								<td>
									{!!path ? (
										<Link
											to={buildLink(path, {
												id: item.id,
											})}
										>
											{item.label}
										</Link>
									) : (
										item.label
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		);
	};

	const renderPermissionLists = () => {
		const userGroups: { id: number; label: string }[] = [];
		const permissionGroups: { id: number; label: string }[] = [];
		const permissions: { id: number; label: string }[] = [];

		const rawUserGroups: RawUserGroupLink[] = get(storedProfile, 'profile_user_groups', []);

		rawUserGroups.forEach(profileUserGroup => {
			profileUserGroup.groups.forEach(group => {
				userGroups.push({
					id: group.id,
					label: group.label,
				});
				const rawPermissionGroups: RawUserGroupPermissionGroupLink[] = get(
					group,
					'group_user_permission_groups',
					[]
				);
				rawPermissionGroups.forEach(permissionGroup => {
					permissionGroups.push({
						id: permissionGroup.permission_group.id,
						label: permissionGroup.permission_group.label,
					});
					const rawPermissions: RawPermissionLink[] = get(
						permissionGroup.permission_group,
						'permission_group_user_permissions'
					);
					rawPermissions.map(permission =>
						permissions.push({
							id: permission.permission.id,
							label: permission.permission.label,
						})
					);
				});
			});
		});

		return (
			<>
				<Spacer margin="top-extra-large">
					<Accordion
						title={t('admin/users/views/user-detail___gebruikersgroepen')}
						isOpen={false}
					>
						{renderList(sortBy(userGroups, 'label'), ADMIN_PATH.USER_GROUP_DETAIL)}
					</Accordion>
				</Spacer>

				<Accordion
					title={t('admin/users/views/user-detail___permissiegroepen')}
					isOpen={false}
				>
					{renderList(
						sortBy(permissionGroups, 'label'),
						ADMIN_PATH.PERMISSION_GROUP_DETAIL
					)}
				</Accordion>
				<Accordion title={t('admin/users/views/user-detail___permissies')} isOpen={false}>
					{renderList(sortBy(permissions, 'label'))}
				</Accordion>
			</>
		);
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
								t('admin/users/views/user-detail___avatar')
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
					{renderPermissionLists()}
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
							title={t(
								'admin/users/views/user-detail___ban-deze-gebruiker-van-het-av-o-platform'
							)}
							ariaLabel={t(
								'admin/users/views/user-detail___ban-deze-gebruiker-van-het-av-o-platform'
							)}
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
						ariaLabel={t(
							'admin/users/views/user-detail___open-deze-gebruiker-in-het-account-beheer-dashboard-van-meemoo'
						)}
						disabled={!getLdapDashboardUrl()}
						title={
							getLdapDashboardUrl()
								? t(
										'admin/users/views/user-detail___open-deze-gebruiker-in-het-account-beheer-dashboard-van-meemoo'
								  )
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
