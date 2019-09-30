import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	AvatarList,
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	MenuContent,
	MetaData,
	MetaDataItem,
	Pagination,
	Table,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { RouteParts } from '../../constants';
import { ITEMS_PER_PAGE } from '../../my-workspace/constants';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { formatDate, formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { DeleteCollectionModal } from '../components';
import { DELETE_COLLECTION, GET_COLLECTIONS_BY_OWNER } from '../graphql';

import './Collections.scss';

interface CollectionsProps extends RouteComponentProps {
	numberOfCollections: number;
}

const Collections: FunctionComponent<CollectionsProps> = ({ numberOfCollections, history }) => {
	const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [page, setPage] = useState<number>(0);

	const openDeleteModal = (collectionId: number) => {
		setDropdownOpen({ [collectionId]: false });
		setIdToDelete(collectionId);
		setIsDeleteModalOpen(true);
	};

	const deleteCollection = async (refetchCollections: () => void) => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: idToDelete,
				},
			});
			toastService('Collectie is verwijderd', TOAST_TYPE.SUCCESS);
			setTimeout(refetchCollections, 0);
		} catch (err) {
			console.error(err);
			toastService('Collectie kon niet verwijdert worden', TOAST_TYPE.DANGER);
		}
		setIdToDelete(null);
	};

	// Render
	const renderCell = (rowData: any, colKey: any) => {
		const cellData = rowData[colKey];

		switch (colKey) {
			case 'thumbnail':
				return (
					<Link to={`/${RouteParts.Collection}/${rowData.id}`} title={rowData.title}>
						<Thumbnail
							category="video"
							src="https://via.placeholder.com/1080x720"
							className="m-collection-overview-thumbnail"
						/>
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
						<Dropdown
							autoSize
							isOpen={dropdownOpen[rowData.id] || false}
							onClose={() => setDropdownOpen({ [rowData.id]: false })}
							onOpen={() => setDropdownOpen({ [rowData.id]: true })}
							placement="bottom-end"
						>
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
												openDeleteModal(rowData.id);
												break;
											default:
												return null;
										}
									}}
								/>
							</DropdownContent>
						</Dropdown>

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

	const renderCollections = (
		collections: Avo.Collection.Response[],
		refetchCollections: () => void
	) => {
		const mappedCollections = !!collections
			? collections.map(collection => {
					const users = [collection.owner];

					const avatars = users.map(user => {
						const { first_name, last_name } = user;

						return {
							initials: `${first_name.charAt(0)}${last_name.charAt(0)}`,
							name: `${first_name} ${last_name}`,
							subtitle: 'Mag Bewerken', // TODO: Diplay correct permissions
						};
					});

					return {
						createdAt: collection.created_at,
						id: collection.id,
						thumbnail: null,
						title: collection.title,
						updatedAt: collection.updated_at,
						inFolder: true,
						access: avatars,
						actions: true,
					};
			  })
			: [];

		return (
			<>
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
				<Pagination
					pageCount={Math.ceil(numberOfCollections / ITEMS_PER_PAGE)}
					currentPage={page}
					onPageChange={setPage}
				/>

				<DeleteCollectionModal
					isOpen={isDeleteModalOpen}
					setIsOpen={setIsDeleteModalOpen}
					deleteCollection={() => deleteCollection(refetchCollections)}
				/>
			</>
		);
	};

	// TODO get actual owner id from ldap user + map to old drupal userid
	return (
		<DataQueryComponent
			query={GET_COLLECTIONS_BY_OWNER}
			// TODO: replace with actual owner id from ldap object
			variables={{ ownerId: '54859c98-d5d3-1038-8d91-6dfda901a78e', offset: page }}
			resultPath="app_collections"
			renderData={renderCollections}
			notFoundMessage="Er konden geen collecties worden gevonden"
		/>
	);
};

export default withRouter(Collections);
