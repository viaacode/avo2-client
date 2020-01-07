import { DocumentNode } from 'graphql';
import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';
import { Query, QueryResult } from 'react-apollo';
import { useTranslation } from 'react-i18next';

import { Flex, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import {
	PermissionGuard,
	PermissionGuardFail,
	PermissionGuardPass,
} from '../../../authentication/components';
import { Permissions } from '../../../authentication/helpers/permission-service';
import { ErrorView } from '../../../error/views';

export interface DataQueryComponentProps {
	query: DocumentNode;
	resultPath?: string;
	renderData: (data: any, refetch: () => void) => ReactNode;
	variables?: any;
	ignoreNotFound?: boolean;
	notFoundMessage?: string;
	showSpinner?: boolean;
	noPermissionsMessage?: string;
	permissions?: Permissions;
	user?: Avo.User.User;
}

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
}) => {
	const [t] = useTranslation();

	const renderSpinner = () =>
		showSpinner ? (
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		) : null;

	return (
		<PermissionGuard permissions={permissions} user={user}>
			<PermissionGuardPass>
				<Query query={query} variables={variables}>
					{(result: QueryResult) => {
						if (result.loading) {
							return renderSpinner();
						}

						if (result.error) {
							const firstGraphQlError = get(result, 'error.graphQLErrors[0].message');

							if (firstGraphQlError === 'DELETED') {
								// TODO: show different message if a list of items was returned but only some were deleted
								return (
									<ErrorView
										message={t(
											'shared/components/data-query-component/data-query-component___dit-item-is-verwijderd'
										)}
										icon="delete"
									/>
								);
							}

							console.error(result.error);

							return (
								<ErrorView
									message={t(
										'shared/components/data-query-component/data-query-component___er-ging-iets-mis-tijdens-het-ophalen'
									)}
									icon="alert-triangle"
								/>
							);
						}

						if (isEmpty(get(result, 'data'))) {
							// Temp empty because of cache clean
							return renderSpinner();
						}

						const data = get(result, resultPath ? `data.${resultPath}` : 'data');
						if (data || ignoreNotFound) {
							// We always want to wait until the current database operation finishes, before we refetch the changed data
							return renderData(data, () => setTimeout(result.refetch, 0));
						}

						return (
							<ErrorView
								message={
									notFoundMessage ||
									t(
										'shared/components/data-query-component/data-query-component___het-opgevraagde-object-werd-niet-gevonden'
									)
								}
							/>
						);
					}}
				</Query>
			</PermissionGuardPass>
			<PermissionGuardFail>
				<ErrorView
					message={
						noPermissionsMessage ||
						t(
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
