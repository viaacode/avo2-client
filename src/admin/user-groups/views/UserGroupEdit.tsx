import { compact, flatten, get, without } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Box,
	Button,
	ButtonToolbar,
	Container,
	Form,
	FormGroup,
	Panel,
	PanelBody,
	PanelHeader,
	Select,
	Spacer,
	Table,
	TextInput,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink, CustomError, formatDate, navigate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { dataService, ToastService } from '../../../shared/services';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { PERMISSION_GROUP_TABLE_COLS, USER_GROUP_PATH } from '../user-group.const';
import { GET_ALL_PERMISSION_GROUPS, GET_USER_GROUP_BY_ID } from '../user-group.gql';
import { UserGroupService } from '../user-group.service';
import {
	Permission,
	PermissionGroup,
	PermissionGroupTableCols,
	UserGroup,
	UserGroupEditFormErrorState,
	UserGroupOverviewTableCols,
} from '../user-group.types';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';

interface UserGroupEditProps extends DefaultSecureRouteProps<{ id: string }> {}

const UserGroupEdit: FunctionComponent<UserGroupEditProps> = ({ history, match, location }) => {
	const [t] = useTranslation();

	// Hooks
	const [initialUserGroup, setInitialUserGroup] = useState<UserGroup | null>(null);
	const [userGroup, setUserGroup] = useState<UserGroup | null>(null);

	const [formErrors, setFormErrors] = useState<UserGroupEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [allPermissionGroups, setAllPermissionGroups] = useState<PermissionGroup[]>([]);
	const [selectedPermissionGroupId, setSelectedPermissionGroupId] = useState<string | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [sortColumn, sortOrder, handleSortClick] = useTableSort<PermissionGroupTableCols>(
		'label'
	);
	const [permissionGroupIdToDelete, setPermissionIdToDelete] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);

	const initOrFetchUserGroup = useCallback(async () => {
		if (isCreatePage) {
			const permGroup = ({
				label: '',
				description: '',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				permissionGroups: [],
			} as unknown) as UserGroup;
			setInitialUserGroup(permGroup);
			setUserGroup(permGroup);
		} else {
			try {
				const response = await dataService.query({
					query: GET_USER_GROUP_BY_ID,
					variables: { id: match.params.id },
				});

				const userGroupObj = get(response, 'data.users_groups[0]');

				if (!userGroupObj) {
					setLoadingInfo({
						state: 'error',
						icon: 'search',
						message: t('Deze gebruiker groep werd niet gevonden'),
					});
					return;
				}

				const permissionGroups: Permission[] = flatten(
					get(userGroupObj, 'group_user_permission_groups', []).map(
						(userGroupItem: any) => {
							return get(userGroupItem, 'permission_group', []);
						}
					)
				);

				const userGroupSimplified = {
					permissionGroups,
					id: userGroupObj.id,
					label: userGroupObj.label,
					description: userGroupObj.description,
					created_at: userGroupObj.created_at,
					updated_at: userGroupObj.updated_at,
				};
				setInitialUserGroup(userGroupSimplified);
				setUserGroup(userGroupSimplified);
			} catch (err) {
				console.error(
					new CustomError('Failed to get permission group by id', err, {
						query: 'GET_USER_GROUP_BY_ID',
						variables: { id: match.params.id },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t('Het ophalen van de permissie groep is mislukt'),
				});
			}
		}
	}, [setLoadingInfo, setUserGroup, t, isCreatePage, match.params.id]);

	const fetchAllPermissionGroups = useCallback(async () => {
		try {
			const response = await dataService.query({
				query: GET_ALL_PERMISSION_GROUPS,
			});

			const permissionGroups: PermissionGroup[] | undefined = get(
				response,
				'data.users_permission_groups'
			);

			if (!permissionGroups) {
				throw new CustomError('Response does not contain permissionGroups', null, {
					response,
				});
			}

			setAllPermissionGroups(permissionGroups);
		} catch (err) {
			console.error(
				new CustomError('Failed to get all permissionGroups from database', err, {
					query: 'GET_ALL_PERMISSIONS',
				})
			);
			ToastService.danger(t('Het ophalen van alle permissies is mislukt'), false);
		}
	}, [setAllPermissionGroups, t]);

	useEffect(() => {
		initOrFetchUserGroup();
		fetchAllPermissionGroups();
	}, [initOrFetchUserGroup, fetchAllPermissionGroups]);

	useEffect(() => {
		if (userGroup) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [userGroup, setLoadingInfo]);

	const navigateBack = () => {
		if (isCreatePage) {
			history.push(USER_GROUP_PATH.USER_GROUP_OVERVIEW);
		} else {
			navigate(history, USER_GROUP_PATH.USER_GROUP_DETAIL, {
				id: match.params.id,
			});
		}
	};

	const getFormErrors = (): UserGroupEditFormErrorState | null => {
		if (!userGroup || !userGroup.label) {
			return {
				label: t('Een label is verplicht'),
			};
		}
		return null;
	};

	const openModal = (permission: Permission): void => {
		setIsConfirmModalOpen(true);
		setPermissionIdToDelete(permission.id);
	};

	const handleDelete = () => {
		if (!userGroup) {
			return;
		}
		setUserGroup({
			...userGroup,
			permissionGroups: (userGroup.permissionGroups || []).filter(
				permissionGroup => permissionGroup.id === permissionGroupIdToDelete
			),
		});
	};

	const handleAddPermissionGroup = () => {
		if (!userGroup) {
			return;
		}
		if (
			(userGroup.permissionGroups || []).find(
				pg => String(pg.id) === selectedPermissionGroupId
			)
		) {
			ToastService.danger(t('Deze permissie zit reeds in de groep'), false);
			return;
		}
		const selectedPermission = allPermissionGroups.find(
			pg => String(pg.id) === selectedPermissionGroupId
		);
		if (!selectedPermission) {
			ToastService.danger(t('De geselecteerde permissie kon niet worden gevonden'), false);
			return;
		}
		setUserGroup({
			...userGroup,
			permissionGroups: [...userGroup.permissionGroups, selectedPermission],
		});
		setSelectedPermissionGroupId(null);
	};

	const handleSave = async () => {
		try {
			const errors = getFormErrors();
			setFormErrors(errors || {});
			if (errors) {
				ToastService.danger(t('De invoer is ongeldig'), false);
				return;
			}

			if (!initialUserGroup || !userGroup) {
				ToastService.danger(
					t(
						'Het opslaan van de permissie groep is mislukt omdat de permissie groep nog niet is geladen'
					),
					false
				);
				return;
			}

			setIsSaving(true);

			let userGroupId: number | string;
			if (isCreatePage) {
				// insert the permission group
				userGroupId = await UserGroupService.insertUserGroup(userGroup);
			} else {
				// Update existing permission group
				await UserGroupService.updateUserGroup(userGroup);
				userGroupId = match.params.id;
			}

			const addedPermissions = without(
				userGroup.permissionGroups,
				...initialUserGroup.permissionGroups
			);
			const removedPermissions = without(
				initialUserGroup.permissionGroups,
				...userGroup.permissionGroups
			);

			await UserGroupService.addPermissionGroupsToUserGroup(
				addedPermissions.map(p => p.id) as number[],
				userGroupId
			);
			await UserGroupService.removePermissionGroupsFromUserGroup(
				removedPermissions.map(p => p.id) as number[],
				userGroupId
			);

			ToastService.success(t('De Gebruikersgroep is opgeslagen'), false);
			if (isCreatePage) {
				redirectToClientPage(
					buildLink(USER_GROUP_PATH.USER_GROUP_EDIT, { id: userGroupId }),
					history
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to save user group', err, {
					userGroup,
					initialUserGroup,
				})
			);
			ToastService.danger(t('Het opslaan van de gebruikersgroep is mislukt'), false);
		}
		setIsSaving(false);
	};

	const getAllPermissionGroups = () => {
		const permissionGroupIdsInUserGroup: number[] = compact(
			(get(userGroup, 'permissionGroups', []) as Partial<PermissionGroup>[]).map(pg => pg.id)
		);
		return allPermissionGroups
			.filter(p => {
				// Don't show permissionGroups that are already linked to this user group
				return !permissionGroupIdsInUserGroup.includes(p.id as number);
			})
			.map(pg => ({
				label: pg.label || pg.description || '',
				value: String(pg.id),
			}));
	};

	const renderTableCell = (rowData: Permission, columnId: UserGroupOverviewTableCols) => {
		switch (columnId) {
			case 'label':
			case 'description':
				return rowData[columnId];

			case 'created_at':
			case 'updated_at':
				return formatDate(rowData[columnId]);

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="delete"
							onClick={() => openModal(rowData)}
							size="small"
							ariaLabel={t('Verwijder')}
							title={t('Verwijder')}
							type="tertiary"
						/>
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderEditPage = () => {
		if (!userGroup) {
			return;
		}
		return (
			<>
				<Container size="medium">
					<Spacer margin="bottom-extra-large">
						<Box backgroundColor="gray">
							<Form>
								<FormGroup label={t('Label')} error={formErrors.label}>
									<TextInput
										value={userGroup.label || ''}
										onChange={newLabel =>
											setUserGroup({
												...userGroup,
												label: newLabel,
											})
										}
									/>
								</FormGroup>
								<FormGroup label={t('Beschrijving')} error={formErrors.description}>
									<TextInput
										value={userGroup.description || ''}
										onChange={newDescription =>
											setUserGroup({
												...userGroup,
												description: newDescription,
											})
										}
									/>
								</FormGroup>
							</Form>
						</Box>
					</Spacer>
				</Container>

				<Panel>
					<PanelHeader>
						<BlockHeading type="h3">
							Permissie groepen gelinked aan deze gebruikersgroep:
						</BlockHeading>
					</PanelHeader>
					<PanelBody>
						<Spacer margin="bottom-large">
							<Form type="inline">
								<FormGroup
									label={t(
										'Voeg een permissie groep toe aan deze gebruikersgroep: '
									)}
								>
									<Select
										options={getAllPermissionGroups()}
										placeholder={t('Kies een permissie groep')}
										value={selectedPermissionGroupId}
										onChange={setSelectedPermissionGroupId}
										loading={!allPermissionGroups}
									/>
								</FormGroup>
								<FormGroup>
									<Button
										label={t('Toevoegen')}
										onClick={handleAddPermissionGroup}
										type="primary"
									/>
								</FormGroup>
							</Form>
						</Spacer>
						<Table
							columns={PERMISSION_GROUP_TABLE_COLS}
							data={UserGroupService.sortPermissionGroups(
								userGroup.permissionGroups || [],
								sortColumn,
								sortOrder
							)}
							emptyStateMessage={t(
								'Deze gebruikersgroep is nog niet gelinked aan een permissiegroep'
							)}
							onColumnClick={columId =>
								handleSortClick(columId as PermissionGroupTableCols)
							}
							renderCell={(rowData: UserGroup, columnId: string) =>
								renderTableCell(rowData, columnId as PermissionGroupTableCols)
							}
							rowKey="id"
							variant="bordered"
							sortColumn={sortColumn}
							sortOrder={sortOrder}
						/>
						<DeleteObjectModal
							deleteObjectCallback={() => handleDelete()}
							isOpen={isConfirmModalOpen}
							onClose={() => setIsConfirmModalOpen(false)}
						/>
					</PanelBody>
				</Panel>
			</>
		);
	};

	// Render
	const renderPage = () => (
		<AdminLayout showBackButton pageTitle={t('Gebruikersgroep aanpassen')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">{renderEditPage()}</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button label={t('Annuleer')} onClick={navigateBack} type="tertiary" />
				<Button disabled={isSaving} label={t('Opslaan')} onClick={handleSave} />
			</AdminLayoutActions>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={userGroup}
			render={renderPage}
		/>
	);
};

export default UserGroupEdit;
