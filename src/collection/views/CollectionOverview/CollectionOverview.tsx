import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	AvatarList,
	Button,
	ButtonToolbar,
	Dropdown,
	DropdownButton,
	DropdownContent,
	MenuContent,
	MetaData,
	MetaDataItem,
	Pagination,
	Spacer,
	Table,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';

import { getProfileId } from '../../../authentication/helpers/get-profile-info';
import { RouteParts } from '../../../constants';
import ErrorView from '../../../error/views/ErrorView';
import { ITEMS_PER_PAGE } from '../../../my-workspace/constants';
import { DataQueryComponent } from '../../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../../shared/components/modals/DeleteObjectModal';
import { getAvatarProps } from '../../../shared/helpers/formatters/avatar';
import { formatDate, formatTimestamp, fromNow } from '../../../shared/helpers/formatters/date';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { IconName } from '../../../shared/types/types';

import { DELETE_COLLECTION, GET_COLLECTIONS_BY_OWNER } from '../../collection.gql';

import './CollectionOverview.scss';

interface CollectionsProps extends RouteComponentProps {
	numberOfCollections: number;
}

const Collections: FunctionComponent<CollectionsProps> = ({ numberOfCollections, history }) => {
	const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [sortColumn, setSortColumn] = useState<keyof Avo.Collection.Collection>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
				update: ApolloCacheManager.clearCollectionCache,
			});

			toastService('Collectie is verwijderd', TOAST_TYPE.SUCCESS);
			refetchCollections();
		} catch (err) {
			console.error(err);
			toastService('Collectie kon niet verwijderd worden', TOAST_TYPE.DANGER);
		}

		setIdToDelete(null);
	};

	// Render
	const renderCell = (collection: Avo.Collection.Collection, colKey: string) => {
		switch (colKey) {
			case 'thumbnail':
				return (
					<Link to={`/${RouteParts.Collection}/${collection.id}`} title={collection.title}>
						<Thumbnail
							alt="thumbnail"
							category="collection"
							className="m-collection-overview-thumbnail"
							src={collection.thumbnail_path || undefined}
						/>
					</Link>
				);

			case 'title':
				return (
					<div className="c-content-header">
						<h3 className="c-content-header__header">
							<Link to={`/${RouteParts.Collection}/${collection.id}`} title={collection.title}>
								{collection.title}
							</Link>
						</h3>
						<div className="c-content-header__meta u-text-muted">
							<MetaData category="collection">
								<MetaDataItem>
									<span title={`Aangemaakt: ${formatDate(collection.created_at)}`}>
										{fromNow(collection.created_at)}
									</span>
								</MetaDataItem>
								{/* TODO link view count from db */}
								<MetaDataItem icon="eye" label={(Math.random() * (200 - 1) + 1).toFixed()} />
							</MetaData>
						</div>
					</div>
				);

			case 'inFolder':
				// TODO check if collection is in folder or not
				const isInFolder = true;
				return isInFolder && <Button icon="folder" type="borderless" />;

			case 'access':
				// TODO get all users that are allowed to edit this collection
				const userProfiles: Avo.User.Profile[] = compact([collection.profile]);
				const avatarProps = userProfiles.map(profile => {
					const props = getAvatarProps(profile);
					(props as any).subtitle = 'mag bewerken'; // TODO check permissions for every user
					return props;
				});
				return userProfiles && <AvatarList avatars={avatarProps as any[]} isOpen={false} />;

			case 'actions':
				return (
					<ButtonToolbar>
						<Dropdown
							isOpen={dropdownOpen[collection.id] || false}
							menuWidth="fit-content"
							onClose={() => setDropdownOpen({ [collection.id]: false })}
							onOpen={() => setDropdownOpen({ [collection.id]: true })}
							placement="bottom-end"
						>
							<DropdownButton>
								<Button icon="more-horizontal" type="borderless" />
							</DropdownButton>
							<DropdownContent>
								<MenuContent
									menuItems={[
										{ icon: 'edit2' as IconName, id: 'edit', label: 'Bewerk' },
										{ icon: 'clipboard' as IconName, id: 'assign', label: 'Maak opdracht' },
										{ icon: 'delete' as IconName, id: 'delete', label: 'Verwijder' },
									]}
									onClick={itemId => {
										switch (itemId) {
											case 'edit':
												history.push(
													`/${RouteParts.Collection}/${collection.id}/${RouteParts.Edit}`
												);
												break;
											case 'delete':
												openDeleteModal(collection.id);
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
							onClick={() => history.push(`/${RouteParts.Collection}/${collection.id}`)}
							type="borderless"
						/>
					</ButtonToolbar>
				);
			case 'created_at':
			case 'updated_at':
				const cellData = collection[colKey as 'created_at' | 'updated_at'];
				return <span title={formatTimestamp(cellData)}>{fromNow(cellData)}</span>;

			default:
				return null;
		}
	};

	const onClickCreate = () => history.push(`/${RouteParts.Search}`);

	// TODO: make shared function because also used in assignments
	const handleColumnClick = (columnId: keyof Avo.Collection.Collection) => {
		if (sortColumn === columnId) {
			// Flip previous ordering
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Set initial ordering for new column
			setSortColumn(columnId);
			setSortOrder('asc');
		}
	};

	const renderTable = (collections: Avo.Collection.Collection[]) => (
		<>
			<Table
				columns={[
					{ id: 'thumbnail', label: '', col: '2' },
					{ id: 'title', label: 'Titel', col: '6', sortable: true },
					{ id: 'updated_at', label: 'Laatst bewerkt', col: '3', sortable: true },
					{ id: 'inFolder', label: 'In map', col: '2' },
					{ id: 'access', label: 'Toegang', col: '2' },
					{ id: 'actions', label: '', col: '1' },
				]}
				data={collections}
				emptyStateMessage="Geen resultaten gevonden"
				renderCell={renderCell}
				rowKey="id"
				variant="styled"
				onColumnClick={handleColumnClick as any}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
			/>
			<Pagination
				pageCount={Math.ceil(numberOfCollections / ITEMS_PER_PAGE)}
				currentPage={page}
				onPageChange={setPage}
			/>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView icon="collection" message="Je hebt nog geen collecties aangemaakt.">
			<p>
				Een collectie is een verzameling van video- of audiofragmenten rond een bepaald thema of
				voor een bepaalde les. Nadat je een collectie hebt aangemaakt kan je deze delen met andere
				gebruikers om samen aan te werken. Andere gebruikers kunnen ook collecties met jou delen die
				je dan hier terugvindt.
			</p>
			<Spacer margin="top">
				<Button
					type="primary"
					icon="add"
					label="Maak je eerste collectie"
					onClick={onClickCreate}
				/>
			</Spacer>
		</ErrorView>
	);

	const renderCollections = (
		collections: Avo.Collection.Collection[],
		refetchCollections: () => void
	) => (
		<>
			{collections.length ? renderTable(collections) : renderEmptyFallback()}
			<DeleteObjectModal
				title="Verwijder collectie?"
				body="Bent u zeker, deze actie kan niet worden ongedaan gemaakt"
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				deleteObjectCallback={() => deleteCollection(refetchCollections)}
			/>
		</>
	);

	return (
		<DataQueryComponent
			query={GET_COLLECTIONS_BY_OWNER}
			variables={{
				owner_profile_id: getProfileId(),
				offset: page * ITEMS_PER_PAGE,
				order: { [sortColumn]: sortOrder },
			}}
			resultPath="app_collections"
			renderData={renderCollections}
			notFoundMessage="Er konden geen collecties worden gevonden"
		/>
	);
};

export default withRouter(Collections);
