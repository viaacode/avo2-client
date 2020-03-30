import { flatten, get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Box,
	Button,
	Container,
	Panel,
	PanelBody,
	PanelHeader,
	Table,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { dataService } from '../../../shared/services';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GET_PERMISSIONS_TABLE_COLS, PERMISSION_GROUP_PATH } from '../permission-group.const';
import { GET_PERMISSION_GROUP_BY_ID } from '../permission-group.gql';
import { PermissionGroupService } from '../permission-group.service';
import { Permission, PermissionGroup, PermissionsTableCols } from '../permission-group.types';

interface PermissionGroupEditProps extends DefaultSecureRouteProps<{ id: string }> {}

const PermissionGroupEdit: FunctionComponent<PermissionGroupEditProps> = ({ history, match }) => {
	const [t] = useTranslation();

	// Hooks
	const [permissionGroup, setPermissionGroup] = useState<PermissionGroup | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [sortColumn, sortOrder, handleSortClick] = useTableSort<PermissionsTableCols>('label');

	const initOrFetchPermissionGroup = useCallback(async () => {
		try {
			const response = await dataService.query({
				query: GET_PERMISSION_GROUP_BY_ID,
				variables: { id: match.params.id },
			});

			const permissionGroupObj = get(response, 'data.users_permission_groups[0]');

			if (!permissionGroupObj) {
				setLoadingInfo({
					state: 'error',
					icon: 'search',
					message: t(
						'admin/permission-groups/views/permission-group-detail___deze-permissie-groep-werd-niet-gevonden'
					),
				});
				return;
			}

			const permissions: Permission[] = flatten(
				get(permissionGroupObj, 'permission_group_user_permissions', []).map(
					(permissionGroupItem: any) => {
						return get(permissionGroupItem, 'permissions', []);
					}
				)
			);

			const permGroup = {
				permissions,
				id: permissionGroupObj.id,
				label: permissionGroupObj.label,
				description: permissionGroupObj.description,
				created_at: permissionGroupObj.created_at,
				updated_at: permissionGroupObj.updated_at,
			};
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
					'admin/permission-groups/views/permission-group-detail___het-ophalen-van-de-permissie-groep-is-mislukt'
				),
			});
		}
	}, [setLoadingInfo, setPermissionGroup, t, match.params.id]);

	useEffect(() => {
		initOrFetchPermissionGroup();
	}, [initOrFetchPermissionGroup]);

	useEffect(() => {
		if (permissionGroup) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [permissionGroup, setLoadingInfo]);

	const handleEditClick = () => {
		redirectToClientPage(
			buildLink(PERMISSION_GROUP_PATH.PERMISSION_GROUP_EDIT, {
				id: match.params.id,
			}),
			history
		);
	};

	const renderEditPage = () => {
		if (!permissionGroup) {
			return;
		}
		return (
			<>
				<Box backgroundColor="gray">
					<Table horizontal variant="invisible">
						<tbody>
							<tr>
								<th>
									{t(
										'admin/permission-groups/views/permission-group-detail___label'
									)}
								</th>
								<td>{permissionGroup.label}</td>
							</tr>
							<tr>
								<th>
									{t(
										'admin/permission-groups/views/permission-group-detail___beschrijving'
									)}
								</th>
								<td>{permissionGroup.description}</td>
							</tr>
						</tbody>
					</Table>
				</Box>
				<Panel>
					<PanelHeader>
						<BlockHeading type="h3">Permissies in deze groep:</BlockHeading>
					</PanelHeader>
					<PanelBody>
						<Table
							columns={GET_PERMISSIONS_TABLE_COLS()}
							data={PermissionGroupService.sortPermissions(
								permissionGroup.permissions || [],
								sortColumn,
								sortOrder
							)}
							emptyStateMessage={t(
								'admin/permission-groups/views/permission-group-detail___deze-groep-bevat-nog-geen-permissies'
							)}
							onColumnClick={columId =>
								handleSortClick(columId as PermissionsTableCols)
							}
							renderCell={(rowData: any, columnId: string) => rowData[columnId]}
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
			pageTitle={t(
				'admin/permission-groups/views/permission-group-detail___permissie-groep-details'
			)}
		>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">{renderEditPage()}</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					label={t('admin/permission-groups/views/permission-group-detail___bewerken')}
					onClick={handleEditClick}
				/>
			</AdminLayoutActions>
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
