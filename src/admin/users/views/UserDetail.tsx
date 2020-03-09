import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import {
	Avatar,
	Button,
	ButtonToolbar,
	Container,
	Header,
	HeaderButtons,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { redirectToExternalPage } from '../../../authentication/helpers/redirects';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { CustomError, formatDate, getEnv } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { GET_USER_BY_ID } from '../user.gql';

interface UserDetailProps extends RouteComponentProps<{ id: string }> {}

const UserDetail: FunctionComponent<UserDetailProps> = ({ match }) => {
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
					message: t('Het ophalen van de gebruiker info is mislukt'),
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
				message: t('Het ophalen van de gebruiker info is mislukt'),
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
					<Table horizontal variant="invisible">
						<tbody>
							<tr>
								<th>
									<Avatar
										image={get(storedProfile, 'profile.avatar')}
										size="large"
									/>
								</th>
								<td />
							</tr>
							<tr>
								<th>
									<Trans>Vooraam</Trans>
								</th>
								<td>{get(storedProfile, 'user.first_name') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Achternaam</Trans>
								</th>
								<td>{get(storedProfile, 'user.last_name') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Gebruikersnaam</Trans>
								</th>
								<td>{storedProfile.alias}</td>
							</tr>
							<tr>
								<th>
									<Trans>Primair email adres</Trans>
								</th>
								<td>{get(storedProfile, 'user.mail') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Secundair email adres</Trans>
								</th>
								<td>{get(storedProfile, 'alternative_email') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Aangemaakt op</Trans>
								</th>
								<td>{formatDate(storedProfile.created_at)}</td>
							</tr>
							<tr>
								<th>
									<Trans>Aangepast op</Trans>
								</th>
								<td>{formatDate(storedProfile.updated_at)}</td>
							</tr>
							<tr>
								<th>
									<Trans>Bio</Trans>
								</th>
								<td>{get(storedProfile, 'bio') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Functie</Trans>
								</th>
								<td>{get(storedProfile, 'function') || '-'}</td>
							</tr>
							<tr>
								<th>
									<Trans>Stamboek nummer</Trans>
								</th>
								<td>{get(storedProfile, 'stamboek') || '-'}</td>
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
								type="danger"
								label={t('Bannen')}
								onClick={() =>
									ToastService.info(
										t('settings/components/profile___nog-niet-geimplementeerd'),
										false
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
			dataObject={storedProfile}
			render={renderUserDetailPage}
		/>
	);
};

export default UserDetail;
