import { Flex, Spinner } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';

import {
	PermissionGuard,
	PermissionGuardFail,
	PermissionGuardPass,
} from '../../../authentication/components';
import { Permissions } from '../../../authentication/helpers/permission-service';
import { ErrorView } from '../../../error/views';
import useTranslation from '../../../shared/hooks/useTranslation';
import { dataService } from '../../services/data-service';

export interface DataQueryComponentProps {
	query: string;
	resultPath?: string;
	renderData: (data: any, refetch: () => void) => ReactNode;
	variables?: any;
	ignoreNotFound?: boolean;
	notFoundMessage?: string;
	showSpinner?: boolean;
	noPermissionsMessage?: string;
	permissions?: Permissions;
	user?: Avo.User.User;
	actionButtons?: Avo.Auth.ErrorActionButton[];
}

/**
 * @deprecated Use react-query functions from src/shared/generated/graphql-db-types.ts
 * @param query
 * @param variables
 * @param resultPath
 * @param renderData
 * @param ignoreNotFound
 * @param notFoundMessage
 * @param showSpinner
 * @param permissions
 * @param user
 * @param noPermissionsMessage
 * @param actionButtons
 * @constructor
 */
const DataQueryComponent: FunctionComponent<DataQueryComponentProps> = ({
	query,
	variables,
	resultPath,
	renderData,
	ignoreNotFound = false,
	notFoundMessage,
	showSpinner = true,
	permissions = [] as Permissions,
	user = null,
	noPermissionsMessage,
	actionButtons = [],
}) => {
	const { tText } = useTranslation();

	const [result, setResult] = useState<{ loading: boolean; error: any; data: any }>({
		loading: true,
		error: null,
		data: null,
	});

	const fetchQuery = useCallback(async () => {
		try {
			const response = await dataService.query({
				query,
				variables,
			});
			setResult({
				loading: false,
				error: null,
				data: response,
			});
		} catch (err) {
			setResult({
				loading: false,
				error: err,
				data: null,
			});
		}
	}, [query, variables]);

	useEffect(() => {
		fetchQuery();
	}, []);

	const renderSpinner = () =>
		showSpinner ? (
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		) : null;

	const renderContent = () => {
		if (result.loading) {
			return renderSpinner();
		}

		if (result.error) {
			const firstGraphQlError = get(result, 'error.graphQLErrors[0].message');

			if (firstGraphQlError === 'DELETED') {
				// TODO: show different message if a list of items was returned but only some were deleted
				return (
					<ErrorView
						message={tText(
							'shared/components/data-query-component/data-query-component___dit-item-is-verwijderd'
						)}
						icon="delete"
					/>
				);
			}

			console.error(result.error);

			return (
				<ErrorView
					message={tText(
						'shared/components/data-query-component/data-query-component___er-ging-iets-mis-tijdens-het-ophalen'
					)}
					icon="alert-triangle"
					actionButtons={actionButtons}
				/>
			);
		}

		if (isEmpty(result)) {
			// Temp empty because of cache clean
			return renderSpinner();
		}

		const data = resultPath ? get(result, resultPath) : result;
		if (data || ignoreNotFound) {
			// We always want to wait until the current database operation finishes, before we refetch the changed data
			return renderData(data, () => setTimeout(fetchQuery, 0));
		}

		return (
			<ErrorView
				message={
					notFoundMessage ||
					tText(
						'shared/components/data-query-component/data-query-component___het-opgevraagde-object-werd-niet-gevonden'
					)
				}
				icon="search"
				actionButtons={actionButtons}
			/>
		);
	};

	return (
		<PermissionGuard permissions={permissions} user={user}>
			<PermissionGuardPass>{renderContent()}</PermissionGuardPass>
			<PermissionGuardFail>
				<ErrorView
					message={
						noPermissionsMessage ||
						tText(
							'shared/components/data-query-component/data-query-component___je-hebt-geen-rechten-om-deze-pagina-te-bekijken'
						)
					}
					icon="lock"
				/>
			</PermissionGuardFail>
		</PermissionGuard>
	);
};

export default DataQueryComponent;
