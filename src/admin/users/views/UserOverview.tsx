import FileSaver from 'file-saver';
import { compact, first, get, isNil, without } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import reactToString from 'react-to-string';
import { compose } from 'redux';

import {
	Alert,
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	ModalFooterRight,
	RadioButtonGroup,
	Spacer,
	TagInfo,
	TagList,
	TagOption,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { SettingsService } from '../../../settings/settings.service';
import {
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError, formatDate, navigate } from '../../../shared/helpers';
import { eduOrgToClientOrg } from '../../../shared/helpers/edu-org-string-to-client-org';
import { idpMapsToTagList } from '../../../shared/helpers/idps-to-taglist';
import { setSelectedCheckboxes } from '../../../shared/helpers/set-selected-checkboxes';
import { stringsToTagList } from '../../../shared/helpers/strings-to-taglist';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import {
	useBusinessCategories,
	useCompaniesWithUsers,
	useEducationLevels,
	useSubjects,
} from '../../../shared/hooks';
import { useIdps } from '../../../shared/hooks/useIdps';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import AddOrRemoveLinkedElementsModal, {
	AddOrRemove,
} from '../../shared/components/AddOrRemoveLinkedElementsModal/AddOrRemoveLinkedElementsModal';
import { ContentPicker } from '../../shared/components/ContentPicker/ContentPicker';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getMultiOptionsFilters,
	NULL_FILTER,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import { useUserGroupOptions } from '../../user-groups/hooks/useUserGroupOptions';
import {
	GET_DELETE_RADIO_OPTIONS,
	GET_USER_BULK_ACTIONS,
	GET_USER_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../user.const';
import { UserService } from '../user.service';
import {
	DeleteContentCounts,
	UserBulkAction,
	UserOverviewTableCol,
	UserTableState,
} from '../user.types';

import './UserOverview.scss';

interface UserOverviewProps {}

const UserOverview: FunctionComponent<UserOverviewProps & RouteComponentProps & UserProps> = ({
	user,
	history,
}) => {
	const [t] = useTranslation();

	const [profiles, setProfiles] = useState<Avo.User.Profile[] | null>(null);
	const [profileCount, setProfileCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UserTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
	const [companies] = useCompaniesWithUsers();
	const [businessCategories] = useBusinessCategories();
	const [educationLevels] = useEducationLevels();
	const [subjects] = useSubjects();
	const [idps] = useIdps();
	const [userGroupOptions] = useUserGroupOptions('CheckboxOption', false) as [
		CheckboxOption[],
		boolean
	];
	const [deleteOptionsModalOpen, setDeleteOptionsModalOpen] = useState<boolean>(false);
	const [selectedDeleteOption, setSelectedDeleteOption] = useState<Avo.User.UserDeleteOption>(
		'DELETE_ALL'
	);
	const [transferToUser, setTransferToUser] = useState<PickerItem | null>(null);
	const [transferToUserError, setTransferToUserError] = useState<string | undefined>();
	const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState<boolean>(false);
	const [deleteContentCounts, setDeleteContentCounts] = useState<DeleteContentCounts | null>(
		null
	);
	const [changeSubjectsModalOpen, setChangeSubjectsModalOpen] = useState<boolean>(false);
	const [allSubjects, setAllSubjects] = useState<string[]>([]);

	const columns = useMemo(
		() =>
			GET_USER_OVERVIEW_TABLE_COLS(
				user,
				setSelectedCheckboxes(
					userGroupOptions,
					get(tableState, 'author.user_groups', []) as string[]
				),
				companies.map(
					(option: Partial<Avo.Organization.Organization>): CheckboxOption => ({
						id: option.or_id as string,
						label: option.name as string,
						checked: get(tableState, 'organisation', [] as string[]).includes(
							String(option.or_id)
						),
					})
				),
				businessCategories.map(
					(option: string): CheckboxOption => ({
						id: option,
						label: option,
						checked: get(tableState, 'business_category', [] as string[]).includes(
							option
						),
					})
				),
				setSelectedCheckboxes(
					educationLevels,
					get(tableState, 'education_levels', []) as string[]
				),
				setSelectedCheckboxes(subjects, get(tableState, 'subjects', []) as string[]),
				setSelectedCheckboxes(idps, get(tableState, 'idps', []) as string[])
			),
		[
			businessCategories,
			companies,
			educationLevels,
			idps,
			subjects,
			tableState,
			user,
			userGroupOptions,
		]
	);

	const generateWhereObject = useCallback(
		(filters: Partial<UserTableState>, onlySelectedProfiles: boolean) => {
			const andFilters: any[] = [];

			if (filters.query) {
				const query = `%${filters.query}%`;

				andFilters.push({
					_or: [
						{ stamboek: { _ilike: query } },
						{ mail: { _ilike: query } },
						{ full_name: { _ilike: query } },
						{ company_name: { _ilike: query } },
						{ group_name: { _ilike: query } },
						{ business_category: { _ilike: query } },
					],
				});
			}

			andFilters.push(...getBooleanFilters(filters, ['is_blocked', 'is_exception']));

			andFilters.push(
				...getDateRangeFilters(
					filters,
					['blocked_at', 'unblocked_at'],
					['blocked_at.max', 'unblocked_at.max']
				)
			);

			andFilters.push(
				...getMultiOptionFilters(
					filters,
					['user_group', 'organisation', 'business_category'],
					['group_id', 'company_id', 'business_category']
				)
			);

			andFilters.push(
				...getMultiOptionsFilters(
					filters,
					['education_levels', 'subjects', 'idps'],
					['contexts', 'classifications', 'idps'],
					['key', 'key', 'idp'],
					true
				)
			);

			andFilters.push(
				...getMultiOptionFilters(
					filters,
					['temp_access'],
					['user.temp_access.current.status']
				)
			);

			andFilters.push(
				...getDateRangeFilters(
					filters,
					['created_at', 'last_access_at'],
					['acc_created_at', 'last_access_at']
				)
			);

			if (filters.educational_organisations && filters.educational_organisations.length) {
				const orFilters: any[] = [];

				eduOrgToClientOrg(without(filters.educational_organisations, NULL_FILTER)).forEach(
					(org) => {
						orFilters.push({
							organisations: {
								organization_id: { _eq: org.organizationId },
								unit_id: org.unitId ? { _eq: org.unitId } : { _is_null: true },
							},
						});
					}
				);

				if (filters.educational_organisations.includes(NULL_FILTER)) {
					orFilters.push({
						_not: {
							organisations: {},
						},
					});
				}

				andFilters.push({
					_or: orFilters,
				});
			}

			if (onlySelectedProfiles) {
				andFilters.push({ profile_id: { _in: selectedProfileIds } });
			}

			// Filter users by wether the user has a Stamboeknummer or not.
			if (!isNil(filters.stamboek)) {
				const hasStamboek = first(filters.stamboek) === 'true';
				const isStamboekNull = !hasStamboek;

				andFilters.push({ stamboek: { _is_null: isStamboekNull } });
			}

			return { _and: andFilters };
		},
		[selectedProfileIds]
	);

	const fetchProfiles = useCallback(async () => {
		try {
			setIsLoading(true);

			const column = columns.find((tableColumn: FilterableColumn) => {
				return get(tableColumn, 'id', '') === get(tableState, 'sort_column', 'empty');
			});
			const columnDataType: string = get(column, 'dataType', '');
			const [profilesTemp, profileCountTemp] = await UserService.getProfiles(
				tableState.page || 0,
				(tableState.sort_column || 'last_access_at') as UserOverviewTableCol,
				tableState.sort_order || 'desc',
				columnDataType,
				generateWhereObject(getFilters(tableState), false)
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
	}, [columns, tableState, generateWhereObject, t]);

	useEffect(() => {
		fetchProfiles();
	}, [fetchProfiles]);

	useEffect(() => {
		if (profiles) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [fetchProfiles, profiles]);

	const bulkChangeSubjects = async (addOrRemove: AddOrRemove, subjects: string[]) => {
		try {
			if (!selectedProfileIds || !selectedProfileIds.length) {
				return;
			}

			if (addOrRemove === 'add') {
				await UserService.bulkAddSubjectsToProfiles(subjects, compact(selectedProfileIds));
				ToastService.success(
					t(
						'admin/users/views/user-overview___de-vakken-zijn-toegevoegd-aan-de-geselecteerde-gebruikers'
					)
				);
			} else {
				// remove
				await UserService.bulkRemoveSubjectsFromProfiles(
					subjects,
					compact(selectedProfileIds)
				);
				ToastService.success(
					t(
						'admin/users/views/user-overview___de-vakken-zijn-verwijderd-van-de-geselecteerde-gebruikers'
					)
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update subjects of user profiles', err, {
					addOrRemove,
					subjects,
				})
			);
			ToastService.danger(
				t('admin/users/views/user-overview___het-aanpassen-van-de-vakken-is-mislukt')
			);
		}
	};

	const setAllProfilesAsSelected = async () => {
		setIsLoading(true);
		try {
			const profileIds = await UserService.getProfileIds(
				generateWhereObject(getFilters(tableState), false)
			);
			ToastService.info(
				t(
					'admin/users/views/user-overview___je-hebt-num-of-selected-profiles-gebuikers-geselecteerd',
					{
						numOfSelectedProfiles: profileIds.length,
					}
				)
			);
			setSelectedProfileIds(profileIds);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to fetch all profile ids that adhere to the selected filters',
					err,
					{ tableState }
				)
			);
			ToastService.danger(
				t(
					'admin/users/views/user-overview___het-ophalen-van-alle-geselecteerde-gebruiker-ids-is-mislukt'
				)
			);
		}

		setIsLoading(false);
	};

	/**
	 * Blocks or unblocks all users in the selectedProfileIds list
	 * @param blockOrUnblock set true for block and false for unblock
	 */
	const bulkUpdateBlockStatus = async (blockOrUnblock: boolean) => {
		try {
			setIsLoading(true);
			await UserService.updateBlockStatusByProfileIds(selectedProfileIds, blockOrUnblock);
			await fetchProfiles();
			ToastService.success(
				blockOrUnblock
					? t(
							'admin/users/views/user-overview___de-geselecteerde-gebruikers-zijn-geblokkeerd'
					  )
					: t(
							'admin/users/views/user-overview___de-geselecteerde-gebruikers-zijn-gedeblokkeerd'
					  )
			);
		} catch (err) {
			ToastService.danger(
				t(
					'admin/users/views/user-overview___het-blokkeren-van-de-geselecteerde-gebruikers-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const navigateFilterToOption = (columnId: string) => (tagId: ReactText) => {
		navigate(
			history,
			ADMIN_PATH.USER_OVERVIEW,
			{},
			{ [columnId]: tagId.toString(), columns: (tableState.columns || []).join('~') }
		);
	};

	const bulkExport = async () => {
		try {
			setIsLoading(true);
			const column = columns.find(
				(tableColumn: FilterableColumn) => tableColumn.id || '' === tableState.sort_column
			);
			const columnDataType: string = get(column, 'dataType', '');
			const [profilesTemp] = await UserService.getProfiles(
				0,
				(tableState.sort_column || 'last_access_at') as UserOverviewTableCol,
				tableState.sort_order || 'desc',
				columnDataType,
				generateWhereObject(getFilters(tableState), true),
				100000
			);
			const columnIds =
				tableState.columns && tableState.columns.length
					? tableState.columns
					: columns
							.filter((column) => column.visibleByDefault)
							.map((column) => column.id);
			const columnLabels = columnIds.map((columnId) =>
				get(
					columns.find((column) => column.id === columnId),
					'label',
					columnId
				)
			);
			const csvRowValues: string[] = [columnLabels.join(';')];
			profilesTemp.forEach((profile) => {
				const csvCellValues: string[] = [];
				columnIds.forEach((columnId) => {
					const csvCellValue = reactToString(
						renderTableCell(profile, columnId as UserOverviewTableCol)
					);
					csvCellValues.push(`"${csvCellValue.replace(/"/g, '""')}"`);
				});
				csvRowValues.push(csvCellValues.join(';'));
			});
			const csvString = csvRowValues.join('\n');
			const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
			FileSaver.saveAs(blob, 'gebruikers.csv');
		} catch (err) {
			console.error(
				new CustomError('Failed to export users to csv file', err, { tableState })
			);
			ToastService.danger(
				t(
					'admin/users/views/user-overview___het-exporteren-van-de-geselecteerde-gebruikers-is-mislukt'
				)
			);
		}

		setIsLoading(false);
	};

	const handleBulkAction = async (action: UserBulkAction): Promise<void> => {
		if (!selectedProfileIds || !selectedProfileIds.length) {
			return;
		}
		switch (action) {
			case 'export':
				await bulkExport();
				return;

			case 'block':
				await bulkUpdateBlockStatus(true);
				return;

			case 'unblock':
				await bulkUpdateBlockStatus(false);
				return;

			case 'delete':
				setDeleteOptionsModalOpen(true);
				return;

			case 'change_subjects':
				setChangeSubjectsModalOpen(true);
				SettingsService.fetchSubjects()
					.then((subjects: string[]) => {
						setAllSubjects(subjects);
					})
					.catch((err) => {
						console.error(
							new CustomError('Failed to get subjects from the database', err)
						);
						ToastService.danger(
							t('settings/components/profile___het-ophalen-van-de-vakken-is-mislukt')
						);
					});
				return;
		}
	};

	const handleOptionsModalClose = () => {
		setDeleteOptionsModalOpen(false);
	};

	const handleConfirmModalClose = () => {
		setDeleteConfirmModalOpen(false);
		setDeleteContentCounts(null);
		setSelectedDeleteOption('DELETE_ALL');
		setTransferToUser(null);
	};

	const handleDeleteUsers = async () => {
		try {
			setDeleteConfirmModalOpen(false);
			await UserService.bulkDeleteUsers(
				selectedProfileIds,
				selectedDeleteOption,
				transferToUser?.value
			);
			await fetchProfiles();
			ToastService.success(
				t('admin/users/views/user-overview___de-geselecteerde-gebruikers-zijn-verwijderd')
			);
		} catch (err) {
			console.error(new CustomError('Failed to remove users', err));
			ToastService.danger(
				t(
					'admin/users/views/user-overview___het-verwijderen-van-de-geselecteerde-gebruikers-is-mislukt'
				)
			);
		}
	};

	const validateOptionModalAndOpenConfirm = async () => {
		try {
			if (
				(selectedDeleteOption === 'TRANSFER_PUBLIC' ||
					selectedDeleteOption === 'TRANSFER_ALL') &&
				!transferToUser
			) {
				// transfer user was not selected, or transfer user is the same user as one of the user that will be deleted
				setTransferToUserError(
					t(
						'admin/users/views/user-overview___kies-een-gebruiker-om-de-content-naar-over-te-dragen'
					)
				);
				return;
			}
			if (
				(selectedDeleteOption === 'TRANSFER_PUBLIC' ||
					selectedDeleteOption === 'TRANSFER_ALL') &&
				transferToUser &&
				selectedProfileIds.includes(transferToUser.value)
			) {
				// transfer user was not selected, or transfer user is the same user as one of the user that will be deleted
				setTransferToUserError(
					t(
						'admin/users/views/user-overview___je-kan-geen-content-overdragen-naar-een-gebruiker-die-verwijdert-zal-worden'
					)
				);
				return;
			}

			// Fetch counts to inform the user of what objects they are about to delete
			setDeleteContentCounts(
				await UserService.fetchPublicAndPrivateCounts(selectedProfileIds)
			);
			handleOptionsModalClose();
			setDeleteConfirmModalOpen(true);
		} catch (err) {
			console.error(
				new CustomError('Error during validateOptionModalAndOpenConfirm', err, {
					transferToUser,
					selectedDeleteOption,
					selectedUsers: selectedProfileIds,
				})
			);
			ToastService.danger(
				t(
					'admin/users/views/user-overview___het-ophalen-van-de-content-items-voor-de-geselecteerde-gebruikers-is-mislukt'
				)
			);
		}
	};

	const renderTableCell = (
		rowData: Partial<Avo.User.Profile>,
		columnId: UserOverviewTableCol
	) => {
		const { id, user, created_at, organisation } = rowData;

		const isBlocked = get(rowData, 'user.is_blocked');

		switch (columnId) {
			case 'first_name':
				return (
					<Link to={buildLink(ADMIN_PATH.USER_DETAIL, { id })}>
						{truncateTableValue(get(user, columnId))}
					</Link>
				);

			case 'last_name':
			case 'mail':
				return truncateTableValue(get(user, columnId));

			case 'user_group':
				return get(rowData, 'profile_user_group.group.label') || '-';

			case 'is_blocked':
				return isBlocked ? 'Ja' : 'Nee';

			case 'blocked_at':
			case 'unblocked_at':
				return formatDate(get(rowData, ['user', columnId])) || '-';

			case 'is_exception':
				return get(rowData, 'is_exception') ? 'Ja' : 'Nee';

			case 'organisation':
				return get(organisation, 'name') || '-';

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'last_access_at':
				const lastAccessDate = get(rowData, 'user.last_access_at');
				return !isNil(lastAccessDate) ? formatDate(lastAccessDate) : '-';

			case 'temp_access':
				const tempAccess = get(rowData, 'user.temp_access.current.status');
				switch (tempAccess) {
					case 0:
						return t('admin/users/views/user-overview___tijdelijke-toegang-nee');
					case 1:
						return t('admin/users/views/user-overview___tijdelijke-toegang-ja');
					default:
						return '';
				}

			case 'temp_access_from':
				return formatDate(get(rowData, 'user.temp_access.from')) || '-';

			case 'temp_access_until':
				return formatDate(get(rowData, 'user.temp_access.until')) || '-';

			case 'idps':
				return (
					idpMapsToTagList(
						get(rowData, 'user.idpmaps', []),
						`user_${get(rowData, 'user.uid')}`,
						navigateFilterToOption(columnId)
					) || '-'
				);

			case 'education_levels':
			case 'subjects':
				const labels = get(rowData, columnId, []);
				return stringsToTagList(labels, null, navigateFilterToOption(columnId)) || '-';

			case 'educational_organisations':
				const orgs: ClientEducationOrganization[] = get(rowData, columnId, []);
				const tags = orgs.map(
					(org): TagOption => ({
						id: `${org.organizationId}:${org.unitId || ''}`,
						label: org.label || org.unitId || org.organizationId,
					})
				);
				return (
					<TagList
						tags={tags}
						swatches={false}
						onTagClicked={navigateFilterToOption(columnId)}
					/>
				);

			default:
				return truncateTableValue(rowData[columnId] || '-');
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

	const renderConfirmDeleteMessage = () => {
		const publicCollections: number = get(deleteContentCounts, 'publicCollections') || 0;
		const privateCollections: number = get(deleteContentCounts, 'privateCollections') || 0;
		const assignments: number = get(deleteContentCounts, 'assignments') || 0;
		const bookmarks: number = get(deleteContentCounts, 'bookmarks') || 0;
		const publicContentPages: number = get(deleteContentCounts, 'publicContentPages') || 0;
		const privateContentPages: number = get(deleteContentCounts, 'privateContentPages') || 0;

		const isDeleteAll = selectedDeleteOption === 'DELETE_ALL';
		const isTransferAll = selectedDeleteOption === 'TRANSFER_ALL';

		const countOutputs: ReactNode[] = [];
		if (isDeleteAll && publicCollections) {
			countOutputs.push(
				<Link
					to={buildLink(
						ADMIN_PATH.COLLECTIONS_OVERVIEW,
						{},
						{
							is_public: '1',
							owner_profile_id: selectedProfileIds.join('~'),
						}
					)}
				>
					{`${publicCollections} ${t(
						'admin/users/views/user-overview___publieke-collecties'
					)}`}
				</Link>
			);
		}
		if (!isTransferAll && privateCollections) {
			countOutputs.push(
				<Link
					to={buildLink(
						ADMIN_PATH.COLLECTIONS_OVERVIEW,
						{},
						{
							is_public: '0',
							owner_profile_id: selectedProfileIds.join('~'),
						}
					)}
				>
					{`${privateCollections} ${t(
						'admin/users/views/user-overview___prive-collecties'
					)}`}
				</Link>
			);
		}
		if (isDeleteAll && publicContentPages) {
			countOutputs.push(
				<Link
					to={buildLink(
						ADMIN_PATH.CONTENT_PAGE_OVERVIEW,
						{},
						{
							is_public: '1',
							user_profile_id: selectedProfileIds.join('~'),
						}
					)}
				>
					{`${publicContentPages} ${t(
						'admin/users/views/user-overview___publieke-content-paginas'
					)}`}
				</Link>
			);
		}
		if (!isTransferAll && privateContentPages) {
			countOutputs.push(
				<Link
					to={buildLink(
						ADMIN_PATH.CONTENT_PAGE_OVERVIEW,
						{},
						{
							is_public: '0',
							user_profile_id: selectedProfileIds.join('~'),
						}
					)}
				>
					{`${privateContentPages} ${t(
						'admin/users/views/user-overview___prive-content-paginas'
					)}`}
				</Link>
			);
		}
		if (!isTransferAll && assignments) {
			countOutputs.push(
				`${assignments} ${t('admin/users/views/user-overview___opdrachten')}`
			);
		}
		if (!isTransferAll && bookmarks) {
			countOutputs.push(`${bookmarks} ${t('admin/users/views/user-overview___bladwijzers')}`);
		}
		return (
			<>
				{t(
					'admin/users/views/user-overview___weet-je-zeker-dat-je-deze-gebruikers-wil-verwijderen'
				)}

				{!!countOutputs.length && (
					<Spacer margin="top" className="c-content">
						<strong>Deze inhoud zal verwijderd worden:</strong>
						<ul>
							{countOutputs.map((count, index) => (
								<li key={`content-count-${index}`}>{count}</li>
							))}
						</ul>
					</Spacer>
				)}

				<Spacer margin="top">
					<Alert
						message={t(
							'admin/users/views/user-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
						)}
						type="danger"
					/>
				</Spacer>
			</>
		);
	};

	const renderUserOverview = () => {
		if (!profiles) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={columns}
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
					onTableStateChanged={(newTableState) => setTableState(newTableState)}
					renderNoResults={renderNoResults}
					isLoading={isLoading}
					showCheckboxes
					selectedItemIds={selectedProfileIds}
					onSelectionChanged={setSelectedProfileIds as (ids: ReactText[]) => void}
					onSelectAll={setAllProfilesAsSelected}
					onSelectBulkAction={handleBulkAction as any}
					bulkActions={GET_USER_BULK_ACTIONS(user)}
					rowKey={(row: Avo.User.Profile) => row.id || get(row, 'user.mail')}
				/>
				<Modal
					title={t('admin/users/views/user-overview___verwijder-opties')}
					isOpen={deleteOptionsModalOpen}
					onClose={() => setDeleteOptionsModalOpen(false)}
					size="medium"
				>
					<ModalBody>
						<RadioButtonGroup
							options={GET_DELETE_RADIO_OPTIONS()}
							value={selectedDeleteOption}
							onChange={setSelectedDeleteOption as any}
						/>
						{(selectedDeleteOption === 'TRANSFER_PUBLIC' ||
							selectedDeleteOption === 'TRANSFER_ALL') && (
							<ContentPicker
								allowedTypes={['PROFILE']}
								onSelect={setTransferToUser}
								initialValue={transferToUser}
								placeholder={t(
									'admin/users/views/user-overview___overdragen-naar-gebruiker'
								)}
								hideTargetSwitch
								hideTypeDropdown
								errors={transferToUserError ? [transferToUserError] : []}
							/>
						)}
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
											label={t(
												'admin/users/views/user-overview___verwijder-gebruikers'
											)}
											onClick={validateOptionModalAndOpenConfirm}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</ModalFooterRight>
				</Modal>
				<Modal
					isOpen={deleteConfirmModalOpen}
					title={t('admin/users/views/user-overview___bevestiging')}
					size="medium"
					onClose={handleConfirmModalClose}
					scrollable
				>
					<ModalBody>
						{renderConfirmDeleteMessage()}
						<Toolbar>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										<Button
											type="secondary"
											label={t('admin/users/views/user-overview___annuleren')}
											onClick={handleConfirmModalClose}
										/>
										<Button
											type="danger"
											label={t(
												'admin/users/views/user-overview___verwijder-gebruikers'
											)}
											onClick={handleDeleteUsers}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</ModalBody>
				</Modal>
				<AddOrRemoveLinkedElementsModal
					title={t('admin/users/views/user-overview___vakken-aanpassen')}
					addOrRemoveLabel={t(
						'admin/users/views/user-overview___vakken-toevoegen-of-verwijderen'
					)}
					contentLabel={t('admin/users/views/user-overview___vakken')}
					isOpen={changeSubjectsModalOpen}
					onClose={() => setChangeSubjectsModalOpen(false)}
					labels={allSubjects.map((subject) => ({
						label: subject,
						value: subject,
					}))}
					callback={(addOrRemove: AddOrRemove, tags: TagInfo[]) =>
						bulkChangeSubjects(
							addOrRemove,
							tags.map((tag) => tag.value.toString())
						)
					}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={t('admin/users/views/user-overview___gebruikers')}
			size="full-width"
		>
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
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={profiles}
					render={renderUserOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(withRouter, withUser)(UserOverview) as FunctionComponent<UserOverviewProps>;
