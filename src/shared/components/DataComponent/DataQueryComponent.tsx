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
}

export const DataQueryComponent: FunctionComponent<DataQueryComponentProps> = ({
	query,
	variables,
	resultPath,
	renderData,
	notFoundMessage = 'Het opgevraagde object werd niet gevonden',
}) => {
	return (
		<Query query={query} variables={variables}>
			{(result: QueryResult) => {
				if (result.loading) {
					return (
						<div className="o-flex o-flex--horizontal-center">
							<Spinner size="large" />
						</div>
					);
				}

				if (result.error) {
					return <span>Error: {result.error.message}</span>;
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
