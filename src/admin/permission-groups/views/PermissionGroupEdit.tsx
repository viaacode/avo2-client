import { get, isNil, without } from 'lodash-es';
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
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { ROUTE_PARTS } from '../../../shared/constants';
import { buildLink, CustomError, navigate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { useTableSort } from '../../../shared/hooks';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { AdminLayoutTopBarRight } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { GET_PERMISSIONS_TABLE_COLS, PERMISSION_GROUP_PATH } from '../permission-group.const';
import { PermissionGroupService } from '../permission-group.service';
import {
	Permission,
	PermissionGroup,
	PermissionGroupEditFormErrorState,
	PermissionsTableCols,
} from '../permission-group.types';

interface PermissionGroupEditProps extends DefaultSecureRouteProps<{ id: string }> {}

const PermissionGroupEdit: FunctionComponent<PermissionGroupEditProps> = ({
	history,
	match,
	location,
}) => {
	const [t] = useTranslation();

	// Hooks
	const [initialPermissionGroup, setInitialPermissionGroup] = useState<PermissionGroup | null>(
		null
	);
	const [permissionGroup, setPermissionGroup] = useState<PermissionGroup | null>(null);

	const [formErrors, setFormErrors] = useState<PermissionGroupEditFormErrorState>({});
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
	const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [sortColumn, sortOrder, handleSortClick] = useTableSort<PermissionsTableCols>('label');

	const isCreatePage: boolean = location.pathname.includes(`/${ROUTE_PARTS.create}`);

	const initOrFetchPermissionGroup = useCallback(async () => {
		if (isCreatePage) {
			const permGroup = ({
				label: '',
				description: '',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				permissions: [],
			} as unknown) as PermissionGroup;
			setInitialPermissionGroup(permGroup);
			setPermissionGroup(permGroup);
		} else {
			try {
				const permGroup = await PermissionGroupService.fetchPermissionGroup(
					match.params.id
				);
				setInitialPermissionGroup(permGroup);
				setPermissionGroup(permGroup);
			} catch (err) {
				console.error(
					new CustomError('Failed to get permission group by id', err, {
						query: 'GET_PERMISSION_GROUP_BY_ID',
						variables: { id: match.params.id },
					})
				);
				setLoadingInfo({
					state: 'error',
					message: t(
						'admin/permission-groups/views/permission-group-edit___het-ophalen-van-de-permissie-groep-is-mislukt'
					),
				});
			}
		}
	}, [isCreatePage, match.params.id, setLoadingInfo, setPermissionGroup, t]);

	const fetchAllPermissions = useCallback(async () => {
		try {
			setAllPermissions(await PermissionGroupService.fetchAllPermissions());
		} catch (err) {
			ToastService.danger(
				t(
					'admin/permission-groups/views/permission-group-edit___het-ophalen-van-alle-permissies-is-mislukt'
				),
				false
			);
		}
	}, [setAllPermissions, t]);

	useEffect(() => {
		initOrFetchPermissionGroup();
		fetchAllPermissions();
	}, [initOrFetchPermissionGroup, fetchAllPermissions]);

	useEffect(() => {
		if (permissionGroup) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [permissionGroup, setLoadingInfo]);

	const navigateBack = () => {
		if (isCreatePage) {
			history.push(PERMISSION_GROUP_PATH.PERMISSION_GROUP_OVERVIEW);
		} else {
			navigate(history, PERMISSION_GROUP_PATH.PERMISSION_GROUP_DETAIL, {
				id: match.params.id,
			});
		}
	};

	const getFormErrors = (): PermissionGroupEditFormErrorState | null => {
		if (!permissionGroup || !permissionGroup.label) {
			return {
				label: t(
					'admin/permission-groups/views/permission-group-edit___een-label-is-verplicht'
				),
			};
		}
		return null;
	};

	const deletePermission = (permissionIdToDelete: number) => {
		if (!permissionGroup) {
			return;
		}
		setPermissionGroup({
			...permissionGroup,
			permissions: (permissionGroup.permissions || []).filter(
				permission => permission.id !== permissionIdToDelete
			),
		});
	};

	const handleAddPermission = () => {
		if (!permissionGroup) {
			return;
		}
		if (isNil(selectedPermissionId)) {
			ToastService.danger(
				t(
					'admin/permission-groups/views/permission-group-edit___deze-permissie-zit-reeds-in-de-groep'
				),
				false
			);
			return;
		}
		const selectedPermission = allPermissions.find(p => String(p.id) === selectedPermissionId);
		if (!selectedPermission) {
			ToastService.danger(
				t(
					'admin/permission-groups/views/permission-group-edit___de-geselecteerde-permissie-kon-niet-worden-gevonden'
				),
				false
			);
			return;
		}
		setPermissionGroup({
			...permissionGroup,
			permissions: [...permissionGroup.permissions, selectedPermission],
		});
		setSelectedPermissionId(null);
	};

	const handleSave = async () => {
		try {
			const errors = getFormErrors();
			setFormErrors(errors || {});
			if (errors) {
				ToastService.danger(
					t(
						'admin/permission-groups/views/permission-group-edit___de-invoer-is-ongeldig'
					),
					false
				);
				return;
			}

			if (!initialPermissionGroup || !permissionGroup) {
				ToastService.danger(
					t(
						'admin/permission-groups/views/permission-group-edit___het-opslaan-van-de-permissie-groep-is-mislukt-omdat-de-permissie-groep-nog-niet-is-geladen'
					),
					false
				);
				return;
			}

			setIsSaving(true);

			let permissionGroupId: number | string;
			if (isCreatePage) {
				// insert the permission group
				permissionGroupId = await PermissionGroupService.insertPermissionGroup(
					permissionGroup
				);
			} else {
				// Update existing permission group
				await PermissionGroupService.updatePermissionGroup(permissionGroup);
				permissionGroupId = match.params.id;
			}

			const addedPermissions = without(
				permissionGroup.permissions,
				...initialPermissionGroup.permissions
			);
			const removedPermissions = without(
				initialPermissionGroup.permissions,
				...permissionGroup.permissions
			);

			await PermissionGroupService.addPermissionsToGroup(
				addedPermissions.map(p => p.id),
				permissionGroupId
			);
			await PermissionGroupService.removePermissionsFromPermissionGroup(
				removedPermissions.map(p => p.id),
				permissionGroupId
			);

			ToastService.success(
				t(
					'admin/permission-groups/views/permission-group-edit___de-permissie-groep-is-opgeslagen'
				),
				false
			);
			if (isCreatePage) {
				redirectToClientPage(
					buildLink(ADMIN_PATH.PERMISSION_GROUP_EDIT, { id: permissionGroupId }),
					history
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to save permission group', err, {
					permissionGroup,
					initialPermissionGroup,
				})
			);
			ToastService.danger(
				t(
					'admin/permission-groups/views/permission-group-edit___het-opslaan-van-de-permissiegroep-is-mislukt'
				),
				false
			);
		}
		setIsSaving(false);
	};

	const getAllPermissions = () => {
		const permissionIdsInGroup: number[] = (get(
			permissionGroup,
			'permissions',
			[]
		) as Permission[]).map(p => p.id);
		return allPermissions
			.filter(p => {
				// Don't show permissions that are already part of the permission group permissions
				return !permissionIdsInGroup.includes(p.id);
			})
			.map(p => ({
				label: p.description || p.label,
				value: String(p.id),
			}));
	};

	const renderTableCell = (rowData: Permission, columnId: PermissionsTableCols) => {
		switch (columnId) {
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="delete"
							onClick={() => deletePermission(rowData.id)}
							size="small"
							ariaLabel={t(
								'admin/permission-groups/views/permission-group-edit___verwijder-deze-permissie-groep'
							)}
							title={t(
								'admin/permission-groups/views/permission-group-edit___verwijder-deze-permissie-groep'
							)}
							type="tertiary"
						/>
					</ButtonToolbar>
				);

			default:
				return truncateTableValue(rowData[columnId]);
		}
	};

	const renderEditPage = () => {
		if (!permissionGroup) {
			return;
		}
		return (
			<>
				<Container size="medium">
					<Spacer margin="bottom-extra-large">
						<Box backgroundColor="gray">
							<Form>
								<FormGroup
									label={t(
										'admin/permission-groups/views/permission-group-edit___label'
									)}
									error={formErrors.label}
									required
								>
									<TextInput
										value={permissionGroup.label || ''}
										onChange={newLabel =>
											setPermissionGroup({
												...permissionGroup,
												label: newLabel,
											})
										}
									/>
								</FormGroup>
								<FormGroup
									label={t(
										'admin/permission-groups/views/permission-group-edit___beschrijving'
									)}
									error={formErrors.description}
								>
									<TextInput
										value={permissionGroup.description || ''}
										onChange={newDescription =>
											setPermissionGroup({
												...permissionGroup,
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
						<BlockHeading type="h3">Permissies in deze groep:</BlockHeading>
					</PanelHeader>
					<PanelBody>
						<Spacer margin="bottom-large">
							<Form type="inline">
								<FormGroup
									label={t(
										'admin/permission-groups/views/permission-group-edit___voeg-een-permissie-toe-aan-deze-groep'
									)}
								>
									<Select
										options={getAllPermissions()}
										placeholder={t(
											'admin/permission-groups/views/permission-group-edit___kies-een-permissie'
										)}
										value={selectedPermissionId || undefined}
										onChange={setSelectedPermissionId}
										loading={!allPermissions}
									/>
								</FormGroup>
								<FormGroup>
									<Button
										label={t(
											'admin/permission-groups/views/permission-group-edit___toevoegen'
										)}
										onClick={handleAddPermission}
										type="primary"
										disabled={isNil(selectedPermissionId)}
										title={
											isNil(selectedPermissionId)
												? t(
														'admin/permission-groups/views/permission-group-edit___kies-eerst-een-permissie-uit-de-lijst'
												  )
												: t(
														'admin/permission-groups/views/permission-group-edit___voeg-de-geselecteerde-permissie-toe-aan-de-permissie-groep'
												  )
										}
									/>
								</FormGroup>
							</Form>
						</Spacer>
						<Table
							columns={GET_PERMISSIONS_TABLE_COLS()}
							data={permissionGroup.permissions}
							emptyStateMessage={t(
								'admin/permission-groups/views/permission-group-edit___deze-groep-bevat-nog-geen-permissies'
							)}
							onColumnClick={columId =>
								handleSortClick(columId as PermissionsTableCols)
							}
							renderCell={(rowData: PermissionGroup, columnId: string) =>
								renderTableCell(rowData, columnId as PermissionsTableCols)
							}
							rowKey="id"
							variant="bordered"
							sortColumn={sortColumn}
							sortOrder={sortOrder}
						/>
					</PanelBody>
				</Panel>
			</>
		);
	};

	// Render
	const renderPage = () => (
		<AdminLayout
			showBackButton
			pageTitle={
				isCreatePage
					? t(
							'admin/permission-groups/views/permission-group-edit___permissie-groep-aanmaken'
					  )
					: t(
							'admin/permission-groups/views/permission-group-edit___permissie-groep-aanpassen'
					  )
			}
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						label={t('admin/permission-groups/views/permission-group-edit___annuleer')}
						onClick={navigateBack}
						type="tertiary"
					/>
					<Button
						disabled={isSaving}
						label={t('admin/permission-groups/views/permission-group-edit___opslaan')}
						onClick={handleSave}
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">{renderEditPage()}</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={permissionGroup}
			render={renderPage}
		/>
	);
};

export default PermissionGroupEdit;
