import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Avatar,
	Button,
	Container,
	Header,
	HeaderAvatar,
	HeaderButtons,
	Heading,
	Navbar,
	Spacer,
	Table,
	Tabs,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent } from '../../../shared/components';
import { formatDate, getAvatarProps, navigate } from '../../../shared/helpers';
import { useTabs } from '../../../shared/hooks';
import { AdminLayout, AdminLayoutBody, AdminLayoutHeader } from '../../shared/layouts';

import { CONTENT_DETAIL_TABS, CONTENT_PATH, CONTENT_RESULT_PATH } from '../content.const';
import { GET_CONTENT_BY_ID } from '../content.gql';
import { ContentParams } from '../content.types';

interface ContentDetailProps extends RouteComponentProps<ContentParams> {}

const ContentDetail: FunctionComponent<ContentDetailProps> = ({ history, match }) => {
	const { id } = match.params;

	// Hooks
	const [content, setContent] = useState<Avo.Content.Content | null>(null);
	const [currentTab, setCurrentTab, tabs] = useTabs(CONTENT_DETAIL_TABS, 'inhoud');

	// Computed
	const avatarProps = getAvatarProps(get(content, 'profile', null));
	const pageTitle = `Content: ${get(content, 'title', '')}`;

	// Render
	const renderFormattedDate = (date: string | null | undefined) =>
		!!date ? formatDate(date) : '-';

	const renderContentDetail = (data: Avo.Content.Content[]) => {
		const contentItem: Avo.Content.Content = get(data, '[0]');

		if (contentItem) {
			setContent(contentItem);
		}

		// TODO: Move tab contents to separate views
		switch (currentTab) {
			case 'inhoud':
				// TODO: here we can show the preview of the page with content-blocks
				return null;
			case 'metadata':
				return (
					<div>
						{!!contentItem.description && (
							<Spacer margin="bottom-large">
								<Heading type="h4">Omschrijving:</Heading>
								<p>{contentItem.description}</p>
							</Spacer>
						)}

						<Heading type="h4">Metadata:</Heading>
						<Table horizontal variant="invisible">
							<tbody>
								<tr>
									<th>Content type:</th>
									<td>{contentItem.content_type}</td>
								</tr>
								<tr>
									<th>Aangemaakt:</th>
									<td>{renderFormattedDate(contentItem.created_at)}</td>
								</tr>
								<tr>
									<th>Laatst bewerkt:</th>
									<td>{renderFormattedDate(contentItem.updated_at)}</td>
								</tr>
								<tr>
									<th>Gepubliceerd:</th>
									<td>{renderFormattedDate(contentItem.publish_at)}</td>
								</tr>
								<tr>
									<th>Gedepubliceerd:</th>
									<td>{renderFormattedDate(contentItem.depublish_at)}</td>
								</tr>
							</tbody>
						</Table>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<AdminLayout navigateBack={() => history.push(CONTENT_PATH.CONTENT)}>
			<AdminLayoutHeader>
				<Header category="audio" categoryLabel="" title={pageTitle} showMetaData={false}>
					{avatarProps.name || avatarProps.initials ? (
						<HeaderAvatar>
							<Avatar {...avatarProps} />
						</HeaderAvatar>
					) : null}
					<HeaderButtons>
						<Button
							label="Bewerken"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
						/>
					</HeaderButtons>
				</Header>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={setCurrentTab} />
					</Container>
				</Navbar>
			</AdminLayoutHeader>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<DataQueryComponent
							query={GET_CONTENT_BY_ID}
							renderData={renderContentDetail}
							resultPath={CONTENT_RESULT_PATH.GET}
							variables={{ id }}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withRouter(ContentDetail);
