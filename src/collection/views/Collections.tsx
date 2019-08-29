import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	AvatarList,
	Button,
	DropdownButton,
	DropdownContent,
	Icon,
	MenuContent,
	MetaData,
	MetaDataItem,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { formatDate, formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';

// Owner will be enforced by permissions inside the graphql server
// TODO reduce number of properties to only the ones we use
import { DELETE_COLLECTION, GET_COLLECTIONS_BY_OWNER } from '../collection.gql';

interface CollectionsProps extends RouteComponentProps {}

const dummyAvatars = [
	{
		initials: 'ES',
		name: 'Ethan Sanders',
		subtitle: 'Mag Bewerken',
	},
	{
		initials: 'JC',
		name: 'Jerry Cooper',
		subtitle: 'Mag Bewerken',
	},
	{
		initials: 'JD',
		name: 'John Doe',
		subtitle: 'Mag Bewerken',
	},
];

const Collections: FunctionComponent<CollectionsProps> = ({ history }) => {
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);

	const deleteCollection = (collectionId: number) => {
		triggerCollectionDelete({
			variables: {
				id: collectionId,
			},
		});

		// TODO: Close options menu.
	};

	// Render
	const renderCell = (rowData: any, colKey: any) => {
		const cellData = rowData[colKey];

		switch (colKey) {
			case 'thumbnail':
				return (
					<Link to={`/${RouteParts.Collection}/${rowData.id}`} title={rowData.title}>
						<div className="c-thumbnail">
							<div className="c-thumbnail-placeholder">
								<Icon name="image" />
							</div>
							<div className="c-thumbnail-image">
								<img src="https://via.placeholder.com/400x400" alt="thumbnail" />
							</div>
						</div>
					</Link>
				);
			case 'title':
				return (
					<div className="c-content-header">
						<h3 className="c-content-header__header">
							<Link to={`/${RouteParts.Collection}/${rowData.id}`} title={rowData.title}>
								{cellData}
							</Link>
						</h3>
						<div className="c-content-header__meta u-text-muted">
							<MetaData category="collection">
								<MetaDataItem>
									<span title={`Aangemaakt: ${formatDate(rowData.createdAt)}`}>
										{fromNow(rowData.createdAt)}
									</span>
								</MetaDataItem>
								{/* TODO link view count from db */}
								<MetaDataItem icon="eye" label={(Math.random() * (200 - 1) + 1).toFixed()} />
							</MetaData>
						</div>
					</div>
				);
			case 'inFolder':
				return cellData && <Button icon="folder" type="borderless" active />;
			case 'access':
				return cellData && <AvatarList avatars={cellData} isOpen={false} />;
			case 'actions':
				return (
					<div className="c-button-toolbar">
						<ControlledDropdown isOpen={false} placement="bottom-end">
							<DropdownButton>
								<Button icon="more-horizontal" type="borderless" active />
							</DropdownButton>
							<DropdownContent>
								<MenuContent
									menuItems={[
										{ icon: 'edit2', id: 'edit', label: 'Bewerk' },
										{ icon: 'clipboard', id: 'assign', label: 'Maak opdracht' },
										{ icon: 'delete', id: 'delete', label: 'Verwijder' },
									]}
									onClick={itemId => {
										switch (itemId) {
											case 'edit':
												history.push(`/${RouteParts.Collection}/${rowData.id}/${RouteParts.Edit}`);
												break;
											case 'delete':
												deleteCollection(rowData.id);
												break;
											default:
												return null;
										}
									}}
								/>
							</DropdownContent>
						</ControlledDropdown>

						<Button
							icon="chevron-right"
							onClick={() => history.push(`/${RouteParts.Collection}/${rowData.id}`)}
							type="borderless"
							active
						/>
					</div>
				);
			case 'createdAt':
			case 'updatedAt':
				return <span title={formatTimestamp(cellData)}>{fromNow(cellData)}</span>;
			default:
				return cellData;
		}
	};

	const renderCollections = (collections: Avo.Collection.Response[]) => {
		const mappedCollections = !!collections
			? collections.map(collection => {
					return {
						createdAt: collection.created_at,
						id: collection.id,
						thumbnail: null,
						title: collection.title,
						updatedAt: collection.updated_at,
						inFolder: true,
						access: dummyAvatars,
						actions: true,
					};
			  })
			: [];

		return (
			<Table
				columns={[
					{ id: 'thumbnail', label: '' },
					{ id: 'title', label: 'Titel', sortable: true },
					{ id: 'updatedAt', label: 'Laatst bewerkt', sortable: true },
					{ id: 'inFolder', label: 'In map' },
					{ id: 'access', label: 'Toegang' },
					{ id: 'actions', label: '' },
				]}
				data={mappedCollections}
				emptyStateMessage="Geen resultaten gevonden"
				renderCell={renderCell}
				rowKey="id"
				styled
			/>
		);
	};

	// TODO get actual owner id from ldap user + map to old drupal userid
	return (
		<DataQueryComponent
			query={GET_COLLECTIONS_BY_OWNER}
			// TODO: replace with actual owner id from ldap object
			variables={{ ownerId: '54859c98-d5d3-1038-8d91-6dfda901a78e' }}
			resultPath="app_collections"
			renderData={renderCollections}
			notFoundMessage="Er konden geen collecties worden gevonden"
		/>
	);
};

export default withRouter(Collections);
