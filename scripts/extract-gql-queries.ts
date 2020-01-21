/**
 * This script runs over all files that match *.gql.ts and extracts the gql queries and whitelists them into the graphql database
 */
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import glob from 'glob';
import _ from 'lodash';
import * as path from 'path';

import { getEnv } from '../src/shared/helpers';

if (!process.env.GRAPHQL_URL) {
	console.error(
		'Failed to whitelist graphql queries because environment variable GRAPHQL_URL is not set'
	);
}
if (!process.env.GRAPHQL_SECRET) {
	console.error(
		'Failed to whitelist graphql queries because environment variable GRAPHQL_SECRET is not set'
	);
}

async function fetchPost(body: any) {
	const url = `${getEnv('GRAPHQL_URL')}/v1/query`;
	const response: AxiosResponse<any> = await axios(url, {
		method: 'post',
		headers: {
			'x-hasura-admin-secret': process.env.GRAPHQL_SECRET as string,
		},
		data: body,
	});
	const errors = _.get(response, 'data.errors');
	if (errors) {
		console.error('Failed to insert event into the database', {
			url,
			errors,
		});
	}
	return response.data;
}

function whitelistQueries(collectionName: string, gqlRegex: RegExp) {
	const options = {
		cwd: path.join(__dirname, '../src'),
	};

	glob('**/*.gql.ts', options, async (err, files) => {
		const queries: { [queryName: string]: string } = {};

		try {
			if (err) {
				console.error('Failed to find files using **/*.gql.ts', err);
				return;
			}

			// Find and extract queries
			files.forEach((relativeFilePath: string) => {
				try {
					const absoluteFilePath = `${options.cwd}/${relativeFilePath}`;
					const content: string = fs.readFileSync(absoluteFilePath).toString();

					let matches: RegExpExecArray | null;
					do {
						matches = gqlRegex.exec(content);
						if (matches) {
							const name = matches[1];
							const query = matches[2];
							if (query.includes('${')) {
								console.warn(
									`Extracting graphql queries with javascript template parameters isn't supported: ${name}`
								);
							}
							queries[name] = query.replace(/^\t/gm, '').trim();
						}
					} while (matches);
				} catch (err) {
					console.error(`Failed to find queries in file: ${relativeFilePath}`, err);
				}
			});

			// Remove the query collection from the whitelist in graphsl
			try {
				await fetchPost({
					type: 'drop_collection_from_allowlist',
					args: {
						collection: collectionName,
					},
				});
			} catch (err) {
				// Ignore error if query collection doesn't exist
				if (_.get(err, 'response.data.code') !== 'not-exists') {
					throw err;
				}
			}
			console.log('[QUERY WHITELISTING]: Removed from whitelist');

			// Delete the client whitelist collection in graphql
			try {
				await fetchPost({
					type: 'drop_query_collection',
					args: {
						collection: collectionName,
						cascade: false,
					},
				});
			} catch (err) {
				// Ignore error if query collection doesn't exist
				if (_.get(err, 'response.data.code') !== 'not-exists') {
					throw err;
				}
			}
			console.log('[QUERY WHITELISTING]: deleted collection');

			// Recreate the client whitelist collection in graphql
			await fetchPost({
				type: 'create_query_collection',
				args: {
					name: collectionName,
					comment: 'All queries the avo2 client is allowed to execute',
					definition: {
						queries: _.map(queries, (query: string, name: string) => ({
							name,
							query: query.trim(),
						})),
					},
				},
			});
			console.log('[QUERY WHITELISTING]: Recreated collection');

			// Add query collection to whitelist
			await fetchPost({
				type: 'add_collection_to_allowlist',
				args: {
					collection: collectionName,
				},
			});
			console.log('[QUERY WHITELISTING]: Readded collection to whitelist');

			console.log(
				`[QUERY WHITELISTING]: Whitelisted ${
					Object.keys(queries).length
				} queries in the graphql database`
			);
		} catch (err) {
			console.error('Failed to extract and upload graphql query whitelist', err);
		}
	});
}

whitelistQueries('avo_client_queries', /const ([^\s]+) = gql`([^`]+?)`/gm);
