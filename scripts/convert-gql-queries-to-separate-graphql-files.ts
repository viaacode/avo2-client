/**
 * This script runs over all files that match *.gql.ts and extracts the gql queries and outputs them to the client-whitelist.json file in /scripts
 */
import * as path from 'path';

import { ensureDirSync, readFileSync, writeFileSync } from 'fs-extra';
import * as glob from 'glob';
import { kebabCase, split } from 'lodash';

/**
 * Extracts label of query
 * example: query getCollectionNamesByOwner($owner_profile_id: uuid) { app_collections( wher...
 * would return: getCollectionNamesByOwner
 * @param query
 */
function getQueryLabel(query: string): string {
	return split(query, /[ ({]/)[1];
}

async function extractQueriesFromCode(gqlRegex: RegExp) {
	const options = {
		cwd: path.join(__dirname, '../src'),
	};

	const files = glob.sync('**/*.gql.ts', options);

	const queries: { [queryName: string]: string } = {};
	const queryLabels: string[] = [];

	try {
		// Find and extract queries
		files.forEach((relativeFilePath: string) => {
			try {
				const absoluteFilePath = `${options.cwd}/${relativeFilePath}`;
				const content: string = readFileSync(absoluteFilePath).toString();

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

						if (queries[name]) {
							console.error(
								`Query with the same variable name is found twice. This will cause a conflicts in the query whitelist: ${name}`
							);
						}

						const label = getQueryLabel(query);
						if (queryLabels.includes(label)) {
							console.error(
								`Query with the same label is found twice. This will cause a conflicts in the query whitelist: ${label}`
							);
						}
						queryLabels.push(label);

						// Remove new lines and tabs
						// Trim whitespace
						queries[name] = query.replace(/[\t\r\n]+/gm, ' ').trim();

						// Write new query file
						const queriesDir = path.join(path.dirname(absoluteFilePath), 'queries');
						ensureDirSync(queriesDir);
						writeFileSync(
							path.join(queriesDir, kebabCase(name) + '.graphql'),
							queries[name]
						);
					}
				} while (matches);
			} catch (err) {
				console.error(`Failed to find queries in file: ${relativeFilePath}`, err);
			}
		});

		console.log(`Found ${Object.keys(queries).length} queries`);
	} catch (err) {
		console.error('Failed to extract and upload graphql query whitelist', JSON.stringify(err));
	}
}

async function run() {
	await extractQueriesFromCode(/const ([^\s]+) = gql`([^`]+?)`/gm);
}

run();
