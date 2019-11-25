import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, ReactText, useState } from 'react';
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

import { getProfileId } from '../../authentication/helpers/get-profile-info';
import { ErrorView } from '../../error/views';
import { SEARCH_PATH } from '../../search/search.const';
import { DataQueryComponent, DeleteObjectModal } from '../../shared/components';
import {
	buildLink,
	createDropdownMenuItem,
	formatDate,
	formatTimestamp,
	fromNow,
	getAvatarProps,
	navigate,
} from '../../shared/helpers';
import { ApolloCacheManager } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';

import { COLLECTION_PATH } from '../collection.const';
import { DELETE_COLLECTION, GET_COLLECTIONS_BY_OWNER } from '../collection.gql';

import './CollectionOverview.scss';

interface CollectionOverviewProps extends RouteComponentProps {
	numberOfCollections: number;
	refetchCount: () => void;
}

const CollectionOverview: FunctionComponent<CollectionOverviewProps> = ({
	history,
	numberOfCollections,
	refetchCount,
}) => {
	// State
	const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [sortColumn, setSortColumn] = useState<keyof Avo.Collection.Collection>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);

	// Mutations
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);

	// Listeners
	const onClickDelete = (collectionId: number) => {
		setDropdownOpen({ [collectionId]: false });
		setIdToDelete(collectionId);
		setIsDeleteModalOpen(true);
	};

	const onDeleteCollection = async (refetchCollections: () => void) => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: idToDelete,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			toastService('Collectie is verwijderd', TOAST_TYPE.SUCCESS);
			refetchCount();
			refetchCollections();
		} catch (err) {
			console.error(err);
			toastService('Collectie kon niet verwijderd worden', TOAST_TYPE.DANGER);
		}

		setIdToDelete(null);
	};

	const onClickCreate = () => history.push(SEARCH_PATH.SEARCH);

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof Avo.Collection.Collection) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder('asc');
		}
	};

	// Render functions
	const renderThumbnail = ({ id, title, thumbnail_path }: Avo.Collection.Collection) => (
		<Link to={buildLink(COLLECTION_PATH.COLLECTION_DETAIL, { id })} title={title}>
			<Thumbnail
				alt="thumbnail"
				category="collection"
				className="m-collection-overview-thumbnail"
				src={thumbnail_path || undefined}
			/>
		</Link>
	);

	const renderTitle = ({ id, title, created_at }: Avo.Collection.Collection) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link to={buildLink(COLLECTION_PATH.COLLECTION_DETAIL, { id })} title={title}>
					{title}
				</Link>
			</h3>
			<div className="c-content-header__meta u-text-muted">
				<MetaData category="collection">
					<MetaDataItem>
						<span title={`Aangemaakt: ${formatDate(created_at)}`}>{fromNow(created_at)}</span>
					</MetaDataItem>
					{/* TODO: Views from GQL */}
					<MetaDataItem icon="eye" label="0" />
				</MetaData>
			</div>
		</div>
	);

	const renderActions = (collectionId: number) => {
		const ROW_DROPDOWN_ITEMS = [
			createDropdownMenuItem('edit', 'Bewerk', 'edit2'),
			createDropdownMenuItem('assign', 'Maak opdracht', 'clipboard'),
			createDropdownMenuItem('delete', 'Verwijderen'),
		];

		// Listeners
		const onClickDropdownItem = (item: ReactText) => {
			switch (item) {
				case 'edit':
					navigate(history, COLLECTION_PATH.COLLECTION_EDIT, { id: collectionId });
					break;
				case 'delete':
					onClickDelete(collectionId);
					break;
				default:
					return null;
			}
		};

		return (
			<ButtonToolbar>
				<Dropdown
					isOpen={dropdownOpen[collectionId] || false}
					menuWidth="fit-content"
					onClose={() => setDropdownOpen({ [collectionId]: false })}
					onOpen={() => setDropdownOpen({ [collectionId]: true })}
					placement="bottom-end"
				>
					<DropdownButton>
						<Button icon="more-horizontal" type="borderless" />
					</DropdownButton>
					<DropdownContent>
						<MenuContent menuItems={ROW_DROPDOWN_ITEMS} onClick={onClickDropdownItem} />
					</DropdownContent>
				</Dropdown>

				<Button
					icon="chevron-right"
					onClick={() => navigate(history, COLLECTION_PATH.COLLECTION_DETAIL, { id: collectionId })}
					type="borderless"
				/>
			</ButtonToolbar>
		);
	};

	const renderCell = (collection: Avo.Collection.Collection, colKey: string) => {
		const { id, profile } = collection;

		switch (colKey) {
			case 'thumbnail':
				return renderThumbnail(collection);
			case 'title':
				return renderTitle(collection);
			case 'inFolder':
				const isInFolder = true; // TODO: Check if collection is in folder

				return isInFolder && <Button icon="folder" type="borderless" />;
			case 'access':
				const userProfiles: Avo.User.Profile[] = compact([profile]); // TODO: Get all users that are allowed to edit this collection
				const avatarProps = userProfiles.map(profile => {
					const props = getAvatarProps(profile);
					(props as any).subtitle = 'mag bewerken'; // TODO: Check permissions for all users
					return props;
				});

				return userProfiles && <AvatarList avatars={avatarProps} isOpen={false} />;
			case 'actions':
				return renderActions(id);
			case 'created_at':
			case 'updated_at':
				const cellData = collection[colKey as 'created_at' | 'updated_at'];

				return <span title={formatTimestamp(cellData)}>{fromNow(cellData)}</span>;
			default:
				return null;
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
				onColumnClick={onClickColumn as any}
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
				deleteObjectCallback={() => onDeleteCollection(refetchCollections)}
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

export default withRouter(CollectionOverview);
