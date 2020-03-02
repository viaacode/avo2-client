import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Avatar,
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Header,
	HeaderButtons,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { CustomError, formatDate, getEnv } from '../../../shared/helpers';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { redirectToExternalPage } from '../../../authentication/helpers/redirects';
import { dataService, ToastService } from '../../../shared/services';
import { GET_USER_BY_ID } from '../user.gql';

interface UserDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const UserDetail: FunctionComponent<UserDetailProps> = ({ match, user }) => {
	const { id } = match.params;

	// Hooks
	const [storedUser, setStoredUser] = useState<Avo.User.User | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [t] = useTranslation();

	const fetchUserById = useCallback(async () => {
		try {
			const response = await dataService.query({
				query: GET_USER_BY_ID,
				variables: {
					userId: id,
				},
			});
			const dbUser = get(response, 'users_profiles[0]');
			if (!dbUser) {
				console.error(
					new CustomError('Response from graphql is empty', null, {
						query: 'GET_USER_BY_ID',
						variables: {
							userId: id,
						},
						response,
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t('Het opghalen van de gebruiker info is mislukt'),
				});
				return;
			}
			setStoredUser(dbUser);
		} catch (err) {
			console.error(
				new CustomError('Failed to get user by id', err, {
					query: 'GET_USER_BY_ID',
					variables: {
						userId: id,
					},
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('Het opghalen van de gebruiker info is mislukt'),
			});
		}
	}, [setStoredUser, setLoadingInfo]);

	useEffect(() => {
		if (user) {
			setStoredUser(user);
			return;
		}
		// load user from route param id
		fetchUserById();
	}, [setStoredUser, fetchUserById]);

	useEffect(() => {
		if (storedUser) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [storedUser]);

	const getLdapDashboardUrl = () => {
		const userLdapUuid = get(storedUser, 'idpmaps[0].idp_user_id');
		if (userLdapUuid) {
			return `${getEnv('LDAP_DASHBOARD_PEOPLE_URL')}/${userLdapUuid}`;
		}
		return null;
	};

	const handleLdapDashboardClick = () => {
		redirectToExternalPage(getLdapDashboardUrl() as string, '_blank');
	};

	const renderUserDetail = () => {
		if (!storedUser) {
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
					<BlockHeading type="h4">
						<Trans>Gebruiker info:</Trans>
					</BlockHeading>
					<Table horizontal variant="invisible">
						<tbody>
							<tr>
								<tr>
									<th>
										<Trans>Avatar</Trans>
									</th>
									<td>
										<Avatar
											image={get(storedUser, 'profile.avatar')}
											size="large"
										/>
									</td>
								</tr>
								<th>
									<Trans>Naam</Trans>
								</th>
								<td>{`${storedUser.first_name} ${storedUser.last_name}`}</td>
							</tr>
							<tr>
								<th>
									<Trans>Gebruikersnaam</Trans>
								</th>
								<td>storedUser.alias}</td>
							</tr>
							<tr>
								<th>
									<Trans>Primair email adres</Trans>
								</th>
								<td>{storedUser.mail}</td>
							</tr>
							<tr>
								<th>
									<Trans>Secundair email adres</Trans>
								</th>
								<td>{get(storedUser, 'profile.alternative_email')}</td>
							</tr>
							<tr>
								<th>
									<Trans>Aangemaakt op</Trans>
								</th>
								<td>{formatDate(storedUser.created_at)}</td>
							</tr>
							<tr>
								<th>
									<Trans>Aangepast op</Trans>
								</th>
								<td>{formatDate(storedUser.created_at)}</td>
							</tr>
							<tr>
								<th>
									<Trans>Bio</Trans>
								</th>
								<td>{get(storedUser, 'profile.bio')}</td>
							</tr>
							<tr>
								<th>
									<Trans>Functie</Trans>
								</th>
								<td>{get(storedUser, 'profile.function')}</td>
							</tr>
							<tr>
								<th>
									<Trans>Stamboek nummer</Trans>
								</th>
								<td>{get(storedUser, 'profile.stamboek')}</td>
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
				<Header category="audio" title={t('Gebruiker details')} showMetaData={false}>
					<HeaderButtons>
						<ButtonToolbar>
							<Button
								label={t('Ban')}
								onClick={() =>
									ToastService.info(
										t('settings/components/profile___nog-niet-geimplementeerd')
									)
								}
							/>{' '}
							<Button
								label={t('Beheer in LDAP deshboard')}
								disabled={!getLdapDashboardUrl()}
								title={
									getLdapDashboardUrl()
										? ''
										: t(
												'Deze gebruiker is niet gelinked aan een archief account'
										  )
								}
								onClick={handleLdapDashboardClick}
							/>
						</ButtonToolbar>
					</HeaderButtons>
				</Header>
			</AdminLayoutHeader>
			<AdminLayoutBody>{renderUserDetail()}</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={storedUser}
			render={renderUserDetailPage}
		/>
	);
};

export default UserDetail;
