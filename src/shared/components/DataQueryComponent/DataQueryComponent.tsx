import { DocumentNode } from 'graphql';
import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';
import { Query, QueryResult } from 'react-apollo';

import { Flex, Spinner } from '@viaa/avo2-components';

import ErrorView from '../../../error/views/ErrorView';

export interface DataQueryComponentProps {
	query: DocumentNode;
	resultPath?: string;
	renderData: (data: any, refetch: () => void) => ReactNode;
	variables?: any;
	ignoreNotFound?: boolean;
	notFoundMessage?: string;
	showSpinner?: boolean;
}

const DataQueryComponent: FunctionComponent<DataQueryComponentProps> = ({
	query,
	variables,
	resultPath,
	renderData,
	ignoreNotFound = false,
	notFoundMessage = 'Het opgevraagde object werd niet gevonden',
	showSpinner = true,
}) => {
	const renderSpinner = () =>
		showSpinner ? (
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		) : null;

	return (
		<Query query={query} variables={variables}>
			{(result: QueryResult) => {
				if (result.loading) {
					return renderSpinner();
				}

				if (result.error) {
					const firstGraphQlError = get(result, 'error.graphQLErrors[0].message');

					if (firstGraphQlError === 'DELETED') {
						// TODO show different message if a list of items was returned but only some were deleted
						return <ErrorView message="Dit item is verwijderd" icon="delete" />;
					}

					console.error(result.error);

					return (
						<ErrorView message={'Er ging iets mis tijdens het ophalen'} icon="alert-triangle" />
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

				return <ErrorView message={notFoundMessage} />;
			}}
		</Query>
	);
};

export default DataQueryComponent;
