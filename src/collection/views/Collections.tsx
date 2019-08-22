import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { gql } from 'apollo-boost';

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
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';

import { RouteParts } from '../../my-workspace/constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { formatDate } from '../../shared/helpers/formatters/date';

// Owner will be enforced by permissions inside the graphql server
// TODO reduce number of properties to only the ones we use
const GET_COLLECTIONS_BY_OWNER = gql`
	query getMigrateCollectionById($ownerId: Int!) {
		migrate_collections(where: { d_ownerid: { _eq: $ownerId } }) {
			description
			title
			is_public
			id
			lom_references {
				lom_value
				id
			}
			type_id
			d_ownerid
			created_at
			updated_at
			organisation_id
			mediamosa_id
		}
	}
`;

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

interface CollectionsProps extends RouteComponentProps {}

const Collections: FunctionComponent<CollectionsProps> = ({ history }) => {
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
								<MetaDataItem>{rowData.createdAt}</MetaDataItem>
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
			default:
				return cellData;
		}
	};

	const renderCollections = (collections: Avo.Collection.Response[]) => {
		const mappedCollections = !!collections
			? collections.map(c => {
					return {
						createdAt: formatDate(c.created_at),
						id: c.id,
						thumbnail: null,
						title: c.title,
						updatedAt: formatDate(c.updated_at),
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
			variables={{ ownerId: 1 }}
			resultPath="migrate_collections"
			renderData={renderCollections}
			notFoundMessage="Er konden geen collecties worden gevonden"
		/>
	);
};

export default withRouter(Collections);
