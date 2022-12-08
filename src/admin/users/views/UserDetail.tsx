import {
	Button,
	ButtonToolbar,
	Checkbox,
	Container,
	MenuItemInfo,
	MoreOptionsDropdown,
	Table,
	TagList,
	TagOption,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import moment from 'moment';
import React, { FunctionComponent, ReactText, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { PermissionService } from '../../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
import { getMoreOptionsLabel } from '../../../shared/constants';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	formatDate,
	getEnv,
	navigate,
	normalizeTimestamp,
	renderAvatar,
} from '../../../shared/helpers';
import { idpMapsToTagList } from '../../../shared/helpers/idps-to-taglist';
import { stringsToTagList } from '../../../shared/helpers/strings-to-taglist';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import TempAccessModal from '../components/TempAccessModal';
import UserDeleteModal from '../components/UserDeleteModal';
import { UserService } from '../user.service';
import { RawUserGroup } from '../user.types';

type UserDetailProps = DefaultSecureRouteProps<{ id: string }>;

const UserDetail: FunctionComponent<UserDetailProps> = ({ history, match, user }) => {
	// Hooks
	const [storedProfile, setStoredProfile] = useState<Avo.User.Profile | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tempAccess, setTempAccess] = useState<Avo.User.TempAccess | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isTempAccessModalOpen, setIsTempAccessModalOpen] = useState<boolean>(false);
	const [userDeleteModalOpen, setUserDeleteModalOpen] = useState<boolean>(false);
	const [isConfirmBlockUserModalVisible, setIsConfirmBlockUserModalVisible] =
		useState<boolean>(false);
	const [isConfirmUnblockUserModalVisible, setIsConfirmUnblockUserModalVisible] =
		useState<boolean>(false);
	const [shouldSendActionEmail, setShouldSendActionEmail] = useState<boolean>(false);

	const { tText, tHtml } = useTranslation();

	const hasPerm = useCallback(
		(permission: PermissionName) => PermissionService.hasPerm(user, permission),
		[user]
	);

	const fetchProfileById = useCallback(async () => {
		try {
			const [profile, tempAccess] = await Promise.all([
				UserService.getProfileById(match.params.id),
				UserService.getTempAccessById(match.params.id),
			]);

			setTempAccess(tempAccess);
			setStoredProfile(profile);
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
				message: tText(
					'admin/users/views/user-detail___het-ophalen-van-de-gebruiker-info-is-mislukt'
				),
			});
		}
	}, [setStoredProfile, setLoadingInfo, tText, match.params.id]);

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
		const ipdMapEntry = ((storedProfile as any)?.idps || []).find(
			(idpMap: { idp: string; idp_user_id: string }) => idpMap.idp === 'HETARCHIEF'
		);

		if (ipdMapEntry) {
			return `${getEnv('LDAP_DASHBOARD_PEOPLE_URL')}/${ipdMapEntry.idp_user_id}`;
		}

		return null;
	};

	const canBanUser = (): boolean => {
		return hasPerm(PermissionName.EDIT_BAN_USER_STATUS);
	};

	const toggleBlockedStatus = async () => {
		try {
			const profileId = (storedProfile as any)?.profile_id;
			const isBlocked = (storedProfile as any)?.is_blocked || false;

			if (profileId) {
				await UserService.updateBlockStatusByProfileIds(
					[profileId],
					!isBlocked,
					shouldSendActionEmail
				);
				await fetchProfileById();

				ToastService.success(
					isBlocked
						? tText('admin/users/views/user-detail___gebruiker-is-gedeblokkeerd')
						: tText('admin/users/views/user-detail___gebruiker-is-geblokkeerd')
				);
			} else {
				ToastService.danger(
					tHtml(
						'admin/users/views/user-detail___het-updaten-van-de-gebruiker-is-mislukt-omdat-zijn-id-niet-kon-worden-gevonden'
					)
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to update is_blocked field for user', err, {
					profile: storedProfile,
				})
			);

			ToastService.danger(
				tHtml('admin/users/views/user-detail___het-updaten-van-de-gebruiker-is-mislukt')
			);
		}
	};

	const CONTENT_DROPDOWN_ITEMS: MenuItemInfo[] = [
		...(hasPerm(PermissionName.EDIT_USER_TEMP_ACCESS)
			? [
					createDropdownMenuItem(
						'tempAccess',
						tText('admin/users/views/user-detail___tijdelijke-toegang'),
						'clock'
					),
			  ]
			: []),
		createDropdownMenuItem('edit', tText('admin/users/views/user-detail___bewerken')),
		createDropdownMenuItem('delete', tText('admin/users/views/user-detail___verwijderen')),
	];

	const executeAction = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);
		switch (item) {
			case 'tempAccess':
				setIsTempAccessModalOpen(true);
				break;

			case 'edit':
				redirectToClientPage(
					buildLink(ADMIN_PATH.USER_EDIT, { id: match.params.id }),
					history
				);
				break;

			case 'delete':
				setUserDeleteModalOpen(true);
				break;

			default:
				return null;
		}
	};

	const onSetTempAccess = async (tempAccess: Avo.User.TempAccess) => {
		try {
			const userId = (storedProfile as any)?.user_id;

			if (!userId) {
				throw new CustomError('Invalid userId');
			}

			const profileId = (storedProfile as any)?.profile_id;

			if (!profileId) {
				throw new CustomError('Invalid profileId');
			}

			await UserService.updateTempAccessByUserId(userId, tempAccess, profileId);

			setTempAccess(tempAccess);

			await fetchProfileById();

			ToastService.success(
				tHtml(
					'admin/users/views/user-detail___tijdelijke-toegang-werd-successvol-geupdated'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to update temp access for user', err, {
					profile: storedProfile,
				})
			);

			ToastService.danger(
				tHtml(
					'admin/users/views/user-detail___het-updaten-van-de-tijdelijke-toegang-is-mislukt'
				)
			);
		}
	};

	const renderTempAccess = (tempAccess: Avo.User.TempAccess | null): string => {
		if (!tempAccess) {
			return '-';
		}
		const from = tempAccess?.from;
		const until = tempAccess?.until;
		return from
			? `${tText('admin/users/views/user-detail___van')} ${formatDate(from)} ${tText(
					'admin/users/views/user-detail___tot'
			  )} ${formatDate(until)}`
			: `${tText('admin/users/views/user-detail___tot')} ${formatDate(until)}`;
	};

	const renderTempAccessDuration = (tempAccess: Avo.User.TempAccess | null): string => {
		if (!tempAccess) {
			return '-';
		}
		const from = tempAccess?.from;
		if (!from) {
			return '-';
		}
		const until = tempAccess?.until || '';
		return moment.duration(normalizeTimestamp(until).diff(normalizeTimestamp(from))).humanize();
	};

	const renderUserDetail = () => {
		if (!storedProfile || !storedProfile) {
			console.error(
				new CustomError(
					'Failed to load user because render function is called before user was fetched'
				)
			);
			return;
		}

		const userGroup: RawUserGroup = (storedProfile as any)?.profile?.profile_user_group?.group;

		const eduOrgs: {
			unit_id: string;
			organization_id: string;
			organization: {
				ldap_description: string;
			};
		}[] = (storedProfile as any)?.organisations || [];

		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Table horizontal variant="invisible" className="c-table_detail-page">
						<tbody>
							{renderDetailRow(
								renderAvatar(storedProfile, { small: false }),
								tText('admin/users/views/user-detail___avatar')
							)}
							{renderSimpleDetailRows(storedProfile, [
								['first_name', tText('admin/users/views/user-detail___voornaam')],
								['last_name', tText('admin/users/views/user-detail___achternaam')],
								[
									'profile.alias',
									tText('admin/users/views/user-detail___gebruikersnaam'),
								],
								['profile.title', tText('admin/users/views/user-detail___functie')],
								['profile.bio', tText('admin/users/views/user-detail___bio')],
								[
									'stamboek',
									tText('admin/users/views/user-detail___stamboek-nummer'),
								],
								[
									'mail',
									tText('admin/users/views/user-detail___primair-email-adres'),
								],
								[
									'profile.alternative_email',
									tText('admin/users/views/user-detail___secundair-email-adres'),
								],
							])}
							{renderDetailRow(
								userGroup ? userGroup.label : '-',
								tText('admin/users/views/user-detail___gebruikersgroep')
							)}
							{renderDateDetailRows(storedProfile, [
								[
									'acc_created_at',
									tText('admin/users/views/user-detail___aangemaakt-op'),
								],
								[
									'acc_updated_at',
									tText('admin/users/views/user-detail___aangepast-op'),
								],
								[
									'last_access_at',
									tText('admin/users/views/user-detail___laatste-toegang'),
								],
							])}
							{renderSimpleDetailRows(storedProfile, [
								[
									'business_category',
									tText('admin/users/views/user-detail___oormerk'),
								],
								[
									'is_exception',
									tText('admin/users/views/user-detail___uitzonderingsaccount'),
								],
								[
									'is_blocked',
									tText('admin/users/views/user-detail___geblokkeerd'),
								],
							])}
							{renderDateDetailRows(storedProfile, [
								[
									'last_blocked_at.aggregate.max.created_at',
									tText('admin/users/views/user-detail___laatst-geblokeerd-op'),
								],
								[
									'last_unblocked_at.aggregate.max.created_at',
									tText(
										'admin/users/views/user-detail___laatst-gedeblokkeerd-op'
									),
								],
							])}
							{hasPerm(PermissionName.EDIT_USER_TEMP_ACCESS) &&
								renderDetailRow(
									renderTempAccess(tempAccess),
									tText('admin/users/views/user-detail___tijdelijk-account')
								)}
							{hasPerm(PermissionName.EDIT_USER_TEMP_ACCESS) &&
								renderDetailRow(
									renderTempAccessDuration(tempAccess),
									tText('admin/users/views/user-detail___totale-toegang')
								)}
							{renderDetailRow(
								idpMapsToTagList(
									((storedProfile as any)?.idps || []).map(
										(idpMap: any) => idpMap.idp
									),
									'idps'
								) || '-',
								tText('admin/users/views/user-detail___gelinked-aan')
							)}
							{renderDetailRow(
								stringsToTagList(
									(storedProfile as any)?.classifications || [],
									'key'
								) || '-',
								tText('admin/users/views/user-detail___vakken')
							)}
							{renderDetailRow(
								((storedProfile as any)?.contexts || ([] as any[])).length ? (
									<TagList
										tags={((storedProfile as any)?.contexts || []).map(
											(educationLevel: { key: string }): TagOption => ({
												id: educationLevel.key,
												label: educationLevel.key,
											})
										)}
										swatches={false}
										closable={false}
									/>
								) : (
									'-'
								),
								tText('admin/users/views/user-detail___opleidingsniveaus')
							)}
							{renderDetailRow(
								eduOrgs.length ? (
									<TagList
										closable={false}
										swatches={false}
										tags={eduOrgs.map((eduOrg) => ({
											label: eduOrg.organization?.ldap_description || '',
											id: eduOrg.organization?.ldap_description || '',
										}))}
									/>
								) : (
									'-'
								),
								tText('admin/users/views/user-detail___educatieve-organisaties')
							)}
							{renderDetailRow(
								(storedProfile as any)?.company_name || '-',
								tText('admin/users/views/user-detail___bedrijf')
							)}
						</tbody>
					</Table>
				</Container>
			</Container>
		);
	};

	// Executed when the user was deleted
	const deleteCallback = () => navigate(history, ADMIN_PATH.USER_OVERVIEW);

	const renderUserDetailPage = () => {
		const isBlocked = (storedProfile as any)?.is_blocked;
		const blockButtonTooltip = isBlocked
			? tText(
					'admin/users/views/user-detail___laat-deze-gebruiker-terug-toe-op-het-av-o-platform'
			  )
			: tText('admin/users/views/user-detail___ban-deze-gebruiker-van-het-av-o-platform');
		return (
			<>
				<AdminLayout
					onClickBackButton={() => navigate(history, ADMIN_PATH.USER_OVERVIEW)}
					pageTitle={tText('admin/users/views/user-detail___gebruiker-details')}
					size="large"
				>
					<AdminLayoutTopBarRight>
						<ButtonToolbar>
							{canBanUser() && (
								<Button
									type={isBlocked ? 'primary' : 'danger'}
									label={
										isBlocked
											? tText('admin/users/views/user-detail___deblokkeren')
											: tText('admin/users/views/user-detail___blokkeren')
									}
									title={blockButtonTooltip}
									ariaLabel={blockButtonTooltip}
									onClick={() => {
										if (isBlocked) {
											setIsConfirmUnblockUserModalVisible(true);
										} else {
											setIsConfirmBlockUserModalVisible(true);
										}
									}}
								/>
							)}
							<a
								href={getLdapDashboardUrl() || ''}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button
									label={tText(
										'admin/users/views/user-detail___beheer-in-account-manager'
									)}
									ariaLabel={tText(
										'admin/users/views/user-detail___open-deze-gebruiker-in-het-account-beheer-dashboard-van-meemoo'
									)}
									disabled={!getLdapDashboardUrl()}
									title={
										getLdapDashboardUrl()
											? tText(
													'admin/users/views/user-detail___open-deze-gebruiker-in-het-account-beheer-dashboard-van-meemoo'
											  )
											: tText(
													'admin/users/views/user-detail___deze-gebruiker-is-niet-gelinked-aan-een-archief-account'
											  )
									}
								/>
							</a>
							<MoreOptionsDropdown
								isOpen={isOptionsMenuOpen}
								onOpen={() => setIsOptionsMenuOpen(true)}
								onClose={() => setIsOptionsMenuOpen(false)}
								label={getMoreOptionsLabel()}
								menuItems={CONTENT_DROPDOWN_ITEMS}
								onOptionClicked={executeAction}
							/>
						</ButtonToolbar>
					</AdminLayoutTopBarRight>
					<AdminLayoutBody>{renderUserDetail()}</AdminLayoutBody>
				</AdminLayout>
				<TempAccessModal
					tempAccess={tempAccess}
					isOpen={isTempAccessModalOpen}
					onClose={() => setIsTempAccessModalOpen(false)}
					setTempAccessCallback={onSetTempAccess}
				/>
				<ConfirmModal
					className="p-user-overview__confirm-modal"
					isOpen={isConfirmBlockUserModalVisible}
					onClose={() => {
						setIsConfirmBlockUserModalVisible(false);
						setShouldSendActionEmail(false);
					}}
					confirmCallback={async () => {
						setIsConfirmBlockUserModalVisible(false);
						setShouldSendActionEmail(false);
						await toggleBlockedStatus();
					}}
					title={tText('admin/users/views/user-detail___bevestig')}
					confirmLabel={tText('admin/users/views/user-detail___deactiveren')}
					size={'medium'}
					body={
						<>
							<strong>
								{tText(
									'admin/users/views/user-detail___weet-je-zeker-dat-je-deze-gebruiker-wil-deactiveren'
								)}
							</strong>
							<Checkbox
								label={tText(
									'admin/users/views/user-detail___breng-de-gebruiker-op-de-hoogte-van-deze-actie'
								)}
								checked={shouldSendActionEmail}
								onChange={(newShouldSendActionEmail) =>
									setShouldSendActionEmail(newShouldSendActionEmail)
								}
							/>
						</>
					}
				/>
				<ConfirmModal
					className="p-user-overview__confirm-modal"
					isOpen={isConfirmUnblockUserModalVisible}
					onClose={() => {
						setIsConfirmUnblockUserModalVisible(false);
						setShouldSendActionEmail(false);
					}}
					confirmCallback={async () => {
						setIsConfirmUnblockUserModalVisible(false);
						setShouldSendActionEmail(false);
						await toggleBlockedStatus();
					}}
					title={tText('admin/users/views/user-detail___bevestig')}
					confirmLabel={tText('admin/users/views/user-detail___opnieuw-activeren')}
					confirmButtonType={'primary'}
					size={'medium'}
					body={
						<>
							<strong>
								{tHtml(
									'admin/users/views/user-detail___weet-je-zeker-dat-je-deze-gebruiker-opnieuw-wil-activeren'
								)}
							</strong>
							<Checkbox
								label={tText(
									'admin/users/views/user-detail___breng-de-gebruiker-op-de-hoogte-van-deze-actie'
								)}
								checked={shouldSendActionEmail}
								onChange={(newShouldSendActionEmail) =>
									setShouldSendActionEmail(newShouldSendActionEmail)
								}
							/>
						</>
					}
				/>
				{storedProfile && (
					<UserDeleteModal
						selectedProfileIds={[storedProfile.id]}
						isOpen={userDeleteModalOpen}
						onClose={() => setUserDeleteModalOpen(false)}
						deleteCallback={deleteCallback}
					/>
				)}
			</>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						`${(storedProfile as any)?.first_name} ${
							(storedProfile as any)?.last_name
						}`,
						tText('admin/users/views/user-detail___item-detail-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/users/views/user-detail___gebruikersbeheer-detail-pagina-beschrijving'
					)}
				/>
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={storedProfile}
				render={renderUserDetailPage}
			/>
		</>
	);
};

export default UserDetail;
