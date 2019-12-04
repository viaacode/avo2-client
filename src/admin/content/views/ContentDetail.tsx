import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent } from '../../../shared/components';
import { formatDate, navigate } from '../../../shared/helpers';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { CONTENT_PATH, CONTENT_RESULT_PATH } from '../content.const';
import { GET_CONTENT_BY_ID } from '../content.gql';
import { ContentParams } from '../content.types';

interface ContentDetailProps extends RouteComponentProps<ContentParams> {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history, match }) => {
	const { id } = match.params;

	// Hooks
	const [contentTitle, setContentTitle] = useState<string>('');

	// Computed
	const pageTitle = `Content: ${contentTitle}`;

	// Render
	const renderFormattedDate = (date: string | null | undefined) =>
		!!date ? formatDate(date) : '-';

	const renderContentDetail = (data: Avo.Content.Content[]) => {
		const contentItem: Avo.Content.Content = get(data, '[0]');

		if (contentItem) {
			setContentTitle(contentItem.title);
		}

		return (
			<div>
				{!!contentItem.description && (
					<Spacer margin="bottom-large">
						<h2 className="c-h4 u-m-0">Omschrijving:</h2>
						<p>{contentItem.description}</p>
					</Spacer>
				)}

				<h2 className="c-h4 u-m-0">Metadata</h2>
				<Table horizontal variant="invisible">
					<tbody>
						<tr>
							<td>Content type:</td>
							<td>{contentItem.content_type}</td>
						</tr>
						<tr>
							<td>Aangemaakt:</td>
							<td>{renderFormattedDate(contentItem.created_at)}</td>
						</tr>
						<tr>
							<td>Laatst bewerkt:</td>
							<td>{renderFormattedDate(contentItem.updated_at)}</td>
						</tr>
						<tr>
							<td>Gepubliceerd:</td>
							<td>{renderFormattedDate(contentItem.publish_at)}</td>
						</tr>
						<tr>
							<td>Gedepubliceerd:</td>
							<td>{renderFormattedDate(contentItem.depublish_at)}</td>
						</tr>
					</tbody>
				</Table>
			</div>
		);
	};

	return (
		<AdminLayout pageTitle={pageTitle} navigateBack={() => history.push(CONTENT_PATH.CONTENT)}>
			<AdminLayoutBody>
				<DataQueryComponent
					query={GET_CONTENT_BY_ID}
					renderData={renderContentDetail}
					resultPath={CONTENT_RESULT_PATH.GET}
					variables={{ id }}
				/>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					label="Bewerken"
					onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default withRouter(ContentDetail);
