import { compact, get, sortBy } from 'lodash-es';
import moment from 'moment';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
	Accordion,
	Button,
	ButtonToolbar,
	Container,
	MenuItemInfo,
	Spacer,
	Table,
	TagList,
	TagOption,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import MoreOptionsDropdown from '../../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
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
import { ToastService } from '../../../shared/services';
import { EducationOrganisationService } from '../../../shared/services/education-organizations-service';
import { ADMIN_PATH } from '../../admin.const';
import {
	renderDateDetailRows,
	renderDetailRow,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import TempAccessModal from '../components/TempAccessModal';
import { UserService } from '../user.service';
import {
	RawPermissionLink,
	RawUserGroup,
	RawUserGroupPermissionGroupLink,
	UserTempAccess,
} from '../user.types';

interface UserDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const UserDetail: FunctionComponent<UserDetailProps> = ({ history, match, user }) => {
	// Hooks
	const [storedProfile, setStoredProfile] = useState<Avo.User.Profile | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [eduOrgNames, setEduOrgNames] = useState<string[]>([]);
	const [tempAccess, setTempAccess] = useState<UserTempAccess | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isTempAccessModalOpen, setIsTempAccessModalOpen] = useState<boolean>(false);

	const [t] = useTranslation();

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

			const eduOrgs: {
				unit_id: string;
				organization_id: string;
			}[] = get(profile, 'profile_organizations') || [];

			setEduOrgNames(
				compact(
					await Promise.all(
						eduOrgs.map((eduOrg) =>
							EducationOrganisationService.fetchEducationOrganisationName(
								eduOrg.organization_id,
								eduOrg.unit_id
							)
						)
					)
				)
			);
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
		const ipdMapEntry = (get(storedProfile, 'idps') || []).find(
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
			const profileId = get(storedProfile, 'profile_id');
			const isBlocked = get(storedProfile, 'is_blocked') || false;

			if (profileId) {
				await UserService.updateBlockStatusByProfileIds([profileId], !isBlocked);
				await fetchProfileById();

				ToastService.success(
					isBlocked
						? t('admin/users/views/user-detail___gebruiker-is-gedeblokkeerd')
						: t('admin/users/views/user-detail___gebruiker-is-geblokkeerd')
				);
			} else {
				ToastService.danger(
					t(
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
				t('admin/users/views/user-detail___het-updaten-van-de-gebruiker-is-mislukt')
			);
		}
	};

	const CONTENT_DROPDOWN_ITEMS: MenuItemInfo[] = [
		...(hasPerm(PermissionName.EDIT_USER_TEMP_ACCESS)
			? [createDropdownMenuItem('tempAccess', t('Tijdelijke toegang'), 'clock')]
			: []),
		createDropdownMenuItem('edit', t('admin/users/views/user-detail___bewerken')),
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

			default:
				return null;
		}
	};

	const onSetTempAccess = async (tempAccess: UserTempAccess) => {
		try {
			const userId = get(storedProfile, 'user_id');

			if (!userId) {
				throw new CustomError('Invalid userId');
			}

			const profileId = get(storedProfile, 'profile_id');

			if (!profileId) {
				throw new CustomError('Invalid profileId');
			}

			await UserService.updateTempAccessByUserId(
				userId,
				tempAccess,
				profileId,
				get(storedProfile, 'is_blocked')
			);

			setTempAccess(tempAccess);

			await fetchProfileById();

			ToastService.success(t('Tijdelijke toegang werd successvol geupdated'));
		} catch (err) {
			console.error(
				new CustomError('Failed to update temp access for user', err, {
					profile: storedProfile,
				})
			);

			ToastService.danger(t('Het updaten van de tijdelijke toegang is mislukt'));
		}
	};

	const renderTempAccess = (tempAccess: UserTempAccess | null): String => {
		if (!tempAccess) {
			return '-';
		}
		const from = get(tempAccess, 'from');
		const until = get(tempAccess, 'until');
		return from
			? `${t('van')} ${formatDate(from)} ${t('tot')} ${formatDate(until)}`
			: `${t('tot')} ${formatDate(until)}`;
	};

	const renderTempAccessDuration = (tempAccess: UserTempAccess | null): String => {
		if (!tempAccess) {
			return '-';
		}
		const from = get(tempAccess, 'from');
		if (!from) {
			return '-';
		}
		const until = get(tempAccess, 'until') || '';
		const months = moment
			.duration(normalizeTimestamp(until).diff(normalizeTimestamp(from)))
			.humanize();
		return months;
	};

	const renderList = (list: { id: number; label: string }[], path?: string): ReactNode => {
		return (
			<Table horizontal variant="invisible" className="c-table_detail-page">
				<tbody>
					{list.map((item) => {
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
		const permissionGroups: { id: number; label: string }[] = [];
		const permissions: { id: number; label: string }[] = [];

		const profileUserGroup: RawUserGroup = get(
			storedProfile,
			'profile.profile_user_group.group',
			[]
		);

		const rawPermissionGroups: RawUserGroupPermissionGroupLink[] = get(
			profileUserGroup,
			'group_user_permission_groups',
			[]
		);

		rawPermissionGroups.forEach((permissionGroup) => {
			permissionGroups.push({
				id: get(permissionGroup, 'group.id'),
				label: get(permissionGroup, 'group.label'),
			});

			const rawPermissions: RawPermissionLink[] = get(
				permissionGroup.permission_group,
				'permission_group_user_permissions'
			);

			rawPermissions.map((permission) =>
				permissions.push({
					id: permission.permission.id,
					label: permission.permission.label,
				})
			);
		});

		return (
			<>
				<Spacer margin="top-extra-large">
					<Accordion
						title={t('admin/users/views/user-detail___permissiegroepen')}
						isOpen={false}
					>
						{renderList(
							sortBy(permissionGroups, 'label'),
							ADMIN_PATH.PERMISSION_GROUP_DETAIL
						)}
					</Accordion>
					<Accordion
						title={t('admin/users/views/user-detail___permissies')}
						isOpen={false}
					>
						{renderList(sortBy(permissions, 'label'))}
					</Accordion>
				</Spacer>
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

		const userGroup: RawUserGroup = get(storedProfile, 'profile.profile_user_group.group');

		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Table horizontal variant="invisible" className="c-table_detail-page">
						<tbody>
							{renderDetailRow(
								renderAvatar(get(storedProfile, 'profile'), { small: false }),
								t('admin/users/views/user-detail___avatar')
							)}
							{renderSimpleDetailRows(storedProfile, [
								['first_name', t('admin/users/views/user-detail___voornaam')],
								['last_name', t('admin/users/views/user-detail___achternaam')],
								[
									'profile.alias',
									t('admin/users/views/user-detail___gebruikersnaam'),
								],
								['profile.title', t('admin/users/views/user-detail___functie')],
								['profile.bio', t('admin/users/views/user-detail___bio')],
								['stamboek', t('admin/users/views/user-detail___stamboek-nummer')],
								['mail', t('admin/users/views/user-detail___primair-email-adres')],
								[
									'profile.alternative_email',
									t('admin/users/views/user-detail___secundair-email-adres'),
								],
							])}
							{renderDetailRow(
								!!userGroup ? (
									<Link
										to={buildLink(ADMIN_PATH.USER_GROUP_DETAIL, {
											id: userGroup.id,
										})}
									>
										{userGroup.label}
									</Link>
								) : (
									'-'
								),
								t('admin/users/views/user-detail___gebruikersgroep')
							)}
							{renderDateDetailRows(storedProfile, [
								[
									'acc_created_at',
									t('admin/users/views/user-detail___aangemaakt-op'),
								],
								[
									'acc_updated_at',
									t('admin/users/views/user-detail___aangepast-op'),
								],
								[
									'last_access_at',
									t('admin/users/views/user-detail___laatste-toegang'),
								],
							])}
							{renderSimpleDetailRows(storedProfile, [
								['business_category', t('admin/users/views/user-detail___oormerk')],
								[
									'is_exception',
									t('admin/users/views/user-detail___uitzonderingsaccount'),
								],
								['is_blocked', t('admin/users/views/user-detail___geblokkeerd')],
							])}
							{renderDateDetailRows(storedProfile, [
								[
									'blocked_at.max',
									t('admin/users/views/user-detail___laatst-geblokeerd-op'),
								],
								[
									'unblocked_at.max',
									t('admin/users/views/user-detail___laatst-gedeblokkeerd-op'),
								],
							])}
							{hasPerm(PermissionName.EDIT_USER_TEMP_ACCESS) &&
								renderDetailRow(
									renderTempAccess(tempAccess),
									t('Tijdelijk account')
								)}
							{hasPerm(PermissionName.EDIT_USER_TEMP_ACCESS) &&
								renderDetailRow(
									renderTempAccessDuration(tempAccess),
									t('Totale toegang')
								)}
							{renderDetailRow(
								idpMapsToTagList(
									get(storedProfile, 'idps', []).map((idpMap: any) => idpMap.idp),
									'idps'
								) || '-',
								t('admin/users/views/user-detail___gelinked-aan')
							)}
							{renderDetailRow(
								stringsToTagList(
									get(storedProfile, 'classifications', []),
									'key'
								) || '-',
								t('admin/users/views/user-detail___vakken')
							)}
							{renderDetailRow(
								get(storedProfile, 'contexts', [] as any[]).length ? (
									<TagList
										tags={get(storedProfile, 'contexts', []).map(
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
								t('admin/users/views/user-detail___opleidingsniveaus')
							)}
							{renderDetailRow(
								!!eduOrgNames.length ? (
									<TagList
										closable={false}
										swatches={false}
										tags={eduOrgNames.map((eduOrgName) => ({
											label: eduOrgName,
											id: eduOrgName,
										}))}
									/>
								) : (
									'-'
								),
								t('admin/users/views/user-detail___educatieve-organisaties')
							)}
							{renderDetailRow(
								get(storedProfile, 'company_name') || '-',
								t('admin/users/views/user-detail___bedrijf')
							)}
						</tbody>
					</Table>
					{renderPermissionLists()}
				</Container>
			</Container>
		);
	};

	const renderUserDetailPage = () => {
		const isBlocked = get(storedProfile, 'is_blocked');
		const blockButtonTooltip = isBlocked
			? t(
					'admin/users/views/user-detail___laat-deze-gebruiker-terug-toe-op-het-av-o-platform'
			  )
			: t('admin/users/views/user-detail___ban-deze-gebruiker-van-het-av-o-platform');
		return (
			<>
				<AdminLayout
					onClickBackButton={() => navigate(history, ADMIN_PATH.USER_OVERVIEW)}
					pageTitle={t('admin/users/views/user-detail___gebruiker-details')}
					size="large"
				>
					<AdminLayoutTopBarRight>
						<ButtonToolbar>
							{canBanUser() && (
								<Button
									type={isBlocked ? 'primary' : 'danger'}
									label={
										isBlocked
											? t('admin/users/views/user-detail___deblokkeren')
											: t('admin/users/views/user-detail___blokkeren')
									}
									title={blockButtonTooltip}
									ariaLabel={blockButtonTooltip}
									onClick={() => toggleBlockedStatus()}
								/>
							)}
							<a
								href={getLdapDashboardUrl() || ''}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button
									label={t(
										'admin/users/views/user-detail___beheer-in-account-manager'
									)}
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
								/>
							</a>
							<MoreOptionsDropdown
								isOpen={isOptionsMenuOpen}
								onOpen={() => setIsOptionsMenuOpen(true)}
								onClose={() => setIsOptionsMenuOpen(false)}
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
			</>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						`${get(storedProfile, 'first_name')} ${get(storedProfile, 'last_name')}`,
						t('admin/users/views/user-detail___item-detail-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={t(
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
