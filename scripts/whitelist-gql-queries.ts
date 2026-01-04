// tslint:disable:no-console
/**
 * This script runs over all files that match *.graphql and extracts the gql queries and outputs them to the client-whitelist.json file in /scripts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { snakeCase } from 'es-toolkit';
import glob from 'glob';

const extractNameRegex = /(query|mutation) ([^\s(]+)(.*)/gm;

function extractQueriesFromCode(globPattern: string, outputFileName: string) {
  const options = {
    cwd: path.join(__dirname, '../src'),
  };

  glob(globPattern, options, async (err: any, files: string[]) => {
    const queries: { [queryName: string]: string } = {};

    try {
      if (err) {
        console.error('Failed to find files using **/*.graphql', err);
        return;
      }

      // Find and extract queries
      files.forEach((relativeFilePath: string) => {
        try {
          const absoluteFilePath = `${options.cwd}/${relativeFilePath}`;
          const content: string = fs.readFileSync(absoluteFilePath).toString();

          let matches: RegExpExecArray | null;
          do {
            matches = extractNameRegex.exec(content);
            if (matches) {
              const name = snakeCase(matches[2]).toUpperCase();
              const query = content;

              if (queries[name]) {
                console.error(
                  `Query with the same variable name is found twice. This will cause a conflicts in the query whitelist: ${name}`,
                );
              }

              // Remove new lines and tabs
              // Trim whitespace
              queries[name] = query.replace(/[\t\r\n]+/gm, ' ').trim();
            }
          } while (matches);
        } catch (err) {
          console.error(
            `Failed to find queries in file: ${relativeFilePath}`,
            err,
          );
        }
      });

      const outputFile = path.join(__dirname, outputFileName);

      // Sort queries by name
      const sortedQueries = Object.keys(queries)
        .sort()
        .reduce((obj: Record<string, string>, key) => {
          obj[key] = queries[key];
          return obj;
        }, {});

      fs.writeFileSync(outputFile, JSON.stringify(sortedQueries, null, 2));

      console.info(
        `Found ${
          Object.keys(queries).length
        } queries, outputted to: ${outputFile}. Copy this file to /scripts folder in the avo2 proxy`,
      );
    } catch (err) {
      console.error(
        'Failed to extract graphql query whitelist',
        JSON.stringify(err),
      );
    }
  });
}

extractQueriesFromCode('**/*.graphql', 'client-whitelist.json');
// tslint:enable:no-console
