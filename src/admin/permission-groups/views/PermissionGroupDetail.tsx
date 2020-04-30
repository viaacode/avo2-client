import { flatten, get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Panel,
	PanelBody,
	PanelHeader,
	Spacer,
	Table,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { dataService } from '../../../shared/services';
import {
	renderDateDetailRows,
	renderSimpleDetailRows,
} from '../../shared/helpers/render-detail-fields';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
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

	const renderDetailPage = () => {
		if (!permissionGroup) {
			return;
		}
		return (
			<>
				<Table horizontal variant="invisible" className="c-table_detail-page">
					<tbody>
						{renderSimpleDetailRows(permissionGroup, [
							[
								'label',
								t('admin/permission-groups/views/permission-group-detail___label'),
							],
							[
								'description',
								t(
									'admin/permission-groups/views/permission-group-detail___beschrijving'
								),
							],
						])}
						{renderDateDetailRows(permissionGroup, [
							[
								'created_at',
								t(
									'admin/permission-groups/views/permission-group-detail___aangemaakt-op'
								),
							],
							[
								'updated_at',
								t(
									'admin/permission-groups/views/permission-group-detail___aangepast-op'
								),
							],
						])}
					</tbody>
				</Table>
				<Spacer margin="top-extra-large">
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
				</Spacer>
			</>
		);
	};

	// Render
	const renderPage = () => {
		if (!permissionGroup) {
			return null;
		}
		return (
			<AdminLayout
				showBackButton
				pageTitle={t(
					'admin/permission-groups/views/permission-group-detail___permissie-groep-details'
				)}
			>
				<AdminLayoutTopBarRight>
					<ButtonToolbar>
						<Button
							type="primary"
							label={t(
								'admin/permission-groups/views/permission-group-detail___bewerken'
							)}
							title={t(
								'admin/permission-groups/views/permission-group-detail___bewerk-deze-permissie-groep'
							)}
							ariaLabel={t(
								'admin/permission-groups/views/permission-group-detail___bewerk-deze-permissie-groep'
							)}
							onClick={handleEditClick}
						/>
					</ButtonToolbar>
				</AdminLayoutTopBarRight>
				<AdminLayoutBody>
					<Container mode="vertical" size="small">
						<Container mode="horizontal">{renderDetailPage()}</Container>
					</Container>
				</AdminLayoutBody>
			</AdminLayout>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={permissionGroup}
			render={renderPage}
		/>
	);
};

export default PermissionGroupEdit;
