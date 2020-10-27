import classnames from 'classnames';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Grid,
	Modal,
	ModalBody,
	ModalFooterRight,
	RadioButtonGroup,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import Html from '../../../shared/components/Html/Html';
import { CustomError, formatDate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ToastService } from '../../../shared/services';
import { ContentPicker } from '../../shared/components/ContentPicker/ContentPicker';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import { useUserGroups } from '../../user-groups/hooks';
import {
	GET_DELETE_RADIO_OPTIONS,
	GET_USER_BULK_ACTIONS,
	GET_USER_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../user.const';
import { UserService } from '../user.service';
import {
	UserBulkAction,
	UserDeleteOption,
	UserOverviewTableCol,
	UserTableState,
} from '../user.types';

import './UserOverview.scss';

interface UserOverviewProps extends DefaultSecureRouteProps {}

const UserOverview: FunctionComponent<UserOverviewProps> = () => {
	const [t] = useTranslation();

	const [profiles, setProfiles] = useState<Avo.User.Profile[] | null>(null);
	const [profileCount, setProfileCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UserTableState>>({});
	const [userGroups] = useUserGroups();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedUsers, setSelectedUsers] = useState<Avo.User.User[]>([]);
	const [deleteOptionsModalOpen, setDeleteOptionsModalOpen] = useState<boolean>(false);
	const [selectedDeleteOption, setSelectedDeleteOption] = useState<UserDeleteOption>(
		'DELETE_PRIVATE_KEEP_NAME'
	);
	const [transferToUser, setTransferToUser] = useState<PickerItem | undefined>();
	const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState<boolean>(false);

	const generateWhereObject = (filters: Partial<UserTableState>) => {
		const andFilters: any[] = [];
		andFilters.push(
			...getQueryFilter(
				filters.query,
				// @ts-ignore
				(queryWordWildcard: string, queryWord: string, query: string) => [
					{ profiles: { stamboek: { _ilike: query } } },
					{ profiles: { alternative_email: { _ilike: queryWordWildcard } } },
					{ profiles: { bio: { _ilike: queryWordWildcard } } },
					{ profiles: { alias: { _ilike: queryWordWildcard } } },
					{ profiles: { title: { _ilike: queryWordWildcard } } },
					{ profiles: { organisation: { name: { _ilike: queryWordWildcard } } } },
					{
						profiles: {
							profile_user_groups: {
								groups: { label: { _ilike: queryWordWildcard } },
							},
						},
					},
					{
						_or: [
							{ first_name: { _ilike: queryWordWildcard } },
							{ last_name: { _ilike: queryWordWildcard } },
							{ mail: { _ilike: queryWordWildcard } },
						],
					},
				]
			)
		);
		andFilters.push(...getBooleanFilters(filters, ['is_blocked']));
		andFilters.push(
			...getMultiOptionFilters(
				filters,
				['user_group', 'organisation'],
				['profiles.profile_user_groups.groups.id', 'profiles.company_id']
			)
		);
		andFilters.push(...getDateRangeFilters(filters, ['created_at', 'last_access_at']));

		return { _and: andFilters };
	};

	const fetchUsers = useCallback(async () => {
		try {
			setIsLoading(true);
			const [profilesTemp, profileCountTemp] = await UserService.getUsers(
				tableState.page || 0,
				(tableState.sort_column || 'last_access_at') as UserOverviewTableCol,
				tableState.sort_order || 'desc',
				generateWhereObject(getFilters(tableState))
			);
			setProfiles(profilesTemp);
			setProfileCount(profileCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get users from the database', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/users/views/user-overview___het-ophalen-van-de-gebruikers-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [setLoadingInfo, setProfiles, setProfileCount, tableState, t]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		if (profiles) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [fetchUsers, profiles]);

	const handleBulkAction = async (action: UserBulkAction): Promise<void> => {
		if (!selectedUsers || !selectedUsers.length) {
			return;
		}
		switch (action) {
			case 'delete':
				setDeleteOptionsModalOpen(true);
				return;
		}
	};

	const handleOptionsModalClose = () => {
		setDeleteOptionsModalOpen(false);
		setSelectedDeleteOption('DELETE_PRIVATE_KEEP_NAME');
		setTransferToUser(undefined);
	};

	const handleConfirmModalClose = () => {
		setDeleteConfirmModalOpen(false);
	};

	const handleDeleteUsers = () => {
		ToastService.info('Nog niet geimplementeerd');
	};

	const validateOptionModal = () => {
		if (
			(selectedDeleteOption === 'TRANSFER_PUBLIC' ||
				selectedDeleteOption === 'TRANSFER_ALL') &&
			(!transferToUser ||
				selectedUsers.map((user) => get(user, 'profile.id')).includes(transferToUser.value))
		) {
			// transfer user was not selected, or transfer user is the same user as one of the user that will be deleted
			ToastService.danger(
				t(
					'De overdracht gebruiker moet ingevuld worden en mag niet een te verwijderen gebruiker zijn'
				)
			);
		}
		handleOptionsModalClose();
		setDeleteConfirmModalOpen(true);
	};

	const renderTableCell = (
		rowData: Partial<Avo.User.Profile>,
		columnId: UserOverviewTableCol
	) => {
		const { user, stamboek, created_at, title, organisation } = rowData;

		switch (columnId) {
			case 'first_name':
			case 'last_name':
			case 'mail':
				return truncateTableValue(get(user, columnId));

			case 'user_group':
				return get(rowData, 'profile_user_groups[0].groups[0].label') || '-';

			case 'oormerk': // TODO replace title with sector after:https://meemoo.atlassian.net/browse/DEV-1062
				return title || '-';

			case 'is_blocked':
				const isBlocked = get(rowData, 'user.is_blocked');
				return isBlocked ? 'Ja' : 'Nee';

			case 'stamboek':
				return stamboek || '-';

			case 'organisation':
				return get(organisation, 'name') || '-';

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'last_access_at':
				const lastAccessDate = get(rowData, 'user.last_access_at');
				return !isNil(lastAccessDate) ? formatDate(lastAccessDate) : '-';

			default:
				return '';
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t('admin/users/views/user-overview___er-bestaan-nog-geen-gebruikers')}
			>
				<p>
					<Trans i18nKey="admin/users/views/user-overview___beschrijving-wanneer-er-nog-geen-gebruikers-zijn">
						Beschrijving wanneer er nog geen gebruikers zijn
					</Trans>
				</p>
			</ErrorView>
		);
	};

	const userGroupOptions = userGroups.map(
		(option): CheckboxOption => ({
			id: String(option.id),
			label: option.label,
			checked: get(tableState, 'author.user_groups', [] as string[]).includes(
				String(option.id)
			),
		})
	);

	const renderUserOverview = () => {
		if (!profiles) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_USER_OVERVIEW_TABLE_COLS(userGroupOptions)}
					data={profiles}
					dataCount={profileCount}
					renderCell={(rowData: Partial<Avo.User.Profile>, columnId: string) =>
						renderTableCell(rowData, columnId as UserOverviewTableCol)
					}
					searchTextPlaceholder={t(
						'admin/users/views/user-overview___zoek-op-naam-email-alias'
					)}
					noContentMatchingFiltersMessage={t(
						'admin/users/views/user-overview___er-zijn-geen-gebruikers-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					isLoading={isLoading}
					showCheckboxes
					selectedItems={selectedUsers}
					onSelectionChanged={setSelectedUsers}
					onSelectBulkAction={handleBulkAction as any}
					bulkActions={GET_USER_BULK_ACTIONS()}
				/>
				<Modal
					title={t('Verwijder opties:')}
					isOpen={deleteOptionsModalOpen}
					onClose={() => setDeleteOptionsModalOpen(false)}
					size="large"
				>
					<ModalBody>
						<Grid className="a-delete-user__grid">
							<Column size="3-6">
								<div
									className={classnames(
										'a-delete-user__image',
										selectedDeleteOption
									)}
								/>
							</Column>
							<Column size="3-6">
								<RadioButtonGroup
									options={GET_DELETE_RADIO_OPTIONS()}
									value={selectedDeleteOption}
									onChange={setSelectedDeleteOption as any}
								/>
								{(selectedDeleteOption === 'TRANSFER_PUBLIC' ||
									selectedDeleteOption === 'TRANSFER_ALL') && (
									<ContentPicker
										allowedTypes={['PROFILE']}
										onSelect={(option) =>
											setTransferToUser(option || undefined)
										}
										initialValue={transferToUser}
										placeholder={t('Overdragen naar gebruiker')}
										hideTargetSwitch
										hideTypeDropdown
									/>
								)}
							</Column>
						</Grid>
					</ModalBody>
					<ModalFooterRight>
						<Toolbar>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										<Button
											type="secondary"
											label={t(
												'admin/shared/components/change-labels-modal/change-labels-modal___annuleren'
											)}
											onClick={handleOptionsModalClose}
										/>
										<Button
											type="danger"
											label={t('Verwijder gebruikers')}
											onClick={async () => {
												validateOptionModal();
											}}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</ModalFooterRight>
				</Modal>
				<Modal
					isOpen={deleteConfirmModalOpen}
					title={t('Bevestiging')}
					size="small"
					onClose={handleConfirmModalClose}
					scrollable
				>
					<ModalBody>
						<Html
							content={t(
								'Weet je zeker dat je deze gebruikers wil verwijderen?<br/><br/>Deze actie kan niet ongedaan gemaakt worden!'
							)}
							sanitizePreset="link"
						/>
						{}
						<Toolbar spaced>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										<Button
											type="secondary"
											label={t('Annuleren')}
											onClick={handleConfirmModalClose}
										/>
										<Button
											type="danger"
											label={t('Verwijder gebruikers')}
											onClick={handleDeleteUsers}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</ModalBody>
				</Modal>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/users/views/user-overview___gebruikers')}>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<Container mode="vertical" size="small">
					<Container mode="horizontal" size="full-width">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={profiles}
							render={renderUserOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default UserOverview;
