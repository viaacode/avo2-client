import React, { FunctionComponent, ReactNode } from 'react';

import { DocumentNode } from 'graphql';
import { get } from 'lodash-es';
import { Query, QueryResult } from 'react-apollo';

import { Spinner } from '@viaa/avo2-components';
import NotFound from '../../../404/views/NotFound';

export interface DataQueryComponentProps {
	query: DocumentNode;
	resultPath?: string;
	renderData: (data: any) => ReactNode;
	variables?: any;
	notFoundMessage?: string;
	showSpinner?: Boolean;
}

export const DataQueryComponent: FunctionComponent<DataQueryComponentProps> = ({
	query,
	variables,
	resultPath,
	renderData,
	notFoundMessage = 'Het opgevraagde object werd niet gevonden',
	showSpinner = true,
}) => {
	return (
		<Query query={query} variables={variables}>
			{(result: QueryResult) => {
				if (result.loading) {
					return showSpinner ? (
						<div className="o-flex o-flex--horizontal-center">
							<Spinner size="large" />
						</div>
					) : null;
				}

				if (result.error) {
					const firstGraphQlError = get(result, 'error.graphQLErrors[0].message');
					if (firstGraphQlError === 'DELETED') {
						// TODO show different message if a list of items was returned but only some were deleted
						return <NotFound message="Dit item is verwijderd" icon="delete" />;
					}
					console.error(result.error);
					return (
						<NotFound message={'Er ging iets mis tijdens het ophalen'} icon="alert-triangle" />
					);
				}

				const data = get(result, resultPath ? `data.${resultPath}` : 'data');
				if (data) {
					return renderData(data);
				}

				return <NotFound message={notFoundMessage} />;
			}}
		</Query>
	);
};
