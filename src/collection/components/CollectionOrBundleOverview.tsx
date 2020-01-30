import { useMutation } from '@apollo/react-hooks';
import { compact } from 'lodash-es';
import React, { FunctionComponent, ReactText, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
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
	generateAssignmentCreateLink,
	getAvatarProps,
	navigate,
} from '../../shared/helpers';
import { ApolloCacheManager } from '../../shared/services/data-service';
import toastService from '../../shared/services/toast-service';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';

import { BUNDLE_PATH } from '../../bundle/bundle.const';
import { COLLECTION_PATH } from '../collection.const';
import { DELETE_COLLECTION, GET_COLLECTIONS_BY_OWNER } from '../collection.gql';
import { ContentTypeNumber } from '../collection.types';
import './CollectionOrBundleOverview.scss';

interface CollectionOrBundleOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
	type: 'collection' | 'bundle';
}

const CollectionOrBundleOverview: FunctionComponent<CollectionOrBundleOverviewProps> = ({
	numberOfItems,
	type,
	history,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
	const [idToDelete, setIdToDelete] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [sortColumn, setSortColumn] = useState<keyof Avo.Collection.Collection>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);

	// Mutations
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);

	// Listeners
	const onClickDelete = (collectionId: string) => {
		setDropdownOpen({ [collectionId]: false });
		setIdToDelete(collectionId);
		setIsDeleteModalOpen(true);
	};

	const isCollection = type === 'collection';

	const onDeleteCollection = async (refetchCollections: () => void) => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: idToDelete,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			toastService.success(
				isCollection
					? t('collection/components/collection-or-bundle-overview___collectie-is-verwijderd')
					: t('collection/components/collection-or-bundle-overview___bundel-is-verwijderd')
			);
			refetchCollections();
		} catch (err) {
			console.error(err);
			toastService.danger(
				isCollection
					? t(
							'collection/components/collection-or-bundle-overview___collectie-kon-niet-verwijderd-worden'
					  )
					: t(
							'collection/components/collection-or-bundle-overview___bundel-kon-niet-verwijderd-worden'
					  )
			);
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
				category={type}
				className="m-collection-overview-thumbnail"
				src={thumbnail_path || undefined}
			/>
		</Link>
	);

	const renderTitle = ({ id, title, created_at }: Avo.Collection.Collection) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link
					to={buildLink(
						isCollection ? COLLECTION_PATH.COLLECTION_DETAIL : BUNDLE_PATH.BUNDLE_DETAIL,
						{ id }
					)}
					title={title}
				>
					{title}
				</Link>
			</h3>
			<div className="c-content-header__meta u-text-muted">
				<MetaData category={type}>
					<MetaDataItem>
						<span title={`Aangemaakt: ${formatDate(created_at)}`}>{fromNow(created_at)}</span>
					</MetaDataItem>
					{/* TODO: Views from GQL */}
					<MetaDataItem icon="eye" label="0" />
				</MetaData>
			</div>
		</div>
	);

	const renderActions = (collectionId: string) => {
		const ROW_DROPDOWN_ITEMS = [
			createDropdownMenuItem('edit', t('collection/views/collection-overview___bewerk'), 'edit2'),
			...(isCollection
				? [
						createDropdownMenuItem(
							'createAssignment',
							t('collection/views/collection-overview___maak-opdracht'),
							'clipboard'
						),
				  ]
				: []),
			createDropdownMenuItem('delete', t('collection/views/collection-overview___verwijderen')),
		];

		// Listeners
		const onClickDropdownItem = (item: ReactText) => {
			switch (item) {
				case 'edit':
					navigate(
						history,
						isCollection ? COLLECTION_PATH.COLLECTION_EDIT : BUNDLE_PATH.BUNDLE_EDIT,
						{ id: collectionId }
					);
					break;
				case 'createAssignment':
					history.push(generateAssignmentCreateLink('KIJK', `${collectionId}`, 'COLLECTIE'));
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
					onClick={() =>
						navigate(
							history,
							isCollection ? COLLECTION_PATH.COLLECTION_DETAIL : BUNDLE_PATH.BUNDLE_DETAIL,
							{ id: collectionId }
						)
					}
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
				const isInFolder = true; // TODO: Check if collection is in bundle

				return isInFolder && <Button icon="folder" type="borderless" />;
			case 'access':
				const userProfiles: Avo.User.Profile[] = compact([profile]); // TODO: Get all users that are allowed to edit this collection
				const avatarProps = userProfiles.map(userProfile => {
					const props = getAvatarProps(userProfile);
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
					{
						id: 'title',
						label: t('collection/views/collection-overview___titel'),
						col: '6',
						sortable: true,
					},
					{
						id: 'updated_at',
						label: t('collection/views/collection-overview___laatst-bewerkt'),
						col: '3',
						sortable: true,
					},
					...(isCollection
						? [
								{
									id: 'inFolder',
									label: t('collection/views/collection-overview___in-map'),
									col: '2' as any,
								},
						  ]
						: []),
					{ id: 'access', label: t('collection/views/collection-overview___toegang'), col: '2' },
					{ id: 'actions', label: '', col: '1' },
				]}
				data={collections}
				emptyStateMessage={t('collection/views/collection-overview___geen-resultaten-gevonden')}
				renderCell={renderCell}
				rowKey="id"
				variant="styled"
				onColumnClick={onClickColumn as any}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
			/>
			<Pagination
				pageCount={Math.ceil(numberOfItems / ITEMS_PER_PAGE)}
				currentPage={page}
				onPageChange={setPage}
			/>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView
			icon="collection"
			message={
				isCollection
					? t('collection/views/collection-overview___je-hebt-nog-geen-collecties-aangemaakt')
					: t(
							'collection/components/collection-or-bundle-overview___je-hebt-nog-geen-bundels-aangemaakt'
					  )
			}
		>
			<p>
				{isCollection ? (
					<Trans i18nKey="collection/views/collection-overview___beschrijving-hoe-collecties-aan-te-maken">
						Een collectie is een verzameling van video- of audiofragmenten rond een bepaald thema of
						voor een bepaalde les. Nadat je een collectie hebt aangemaakt kan je deze delen met
						andere gebruikers om samen aan te werken. Andere gebruikers kunnen ook collecties met
						jou delen die je dan hier terugvindt.
					</Trans>
				) : (
					<Trans i18nKey="collection/components/collection-or-bundle-overview___een-bundel-is-een-verzameling-van-collecties-rond-een-bepaald-thema-of-voor-een-bepaalde-les-nadat-je-een-bundel-hebt-aangemaakt-kan-je-deze-delen-met-andere-gebruikers-om-samen-aan-te-werken-andere-gebruikers-kunnen-ook-bundels-met-jou-delen-die-je-dan-hier-terugvindt">
						Een bundel is een verzameling van collecties rond een bepaald thema of voor een bepaalde
						les. Nadat je een bundel hebt aangemaakt kan je deze delen met andere gebruikers om
						samen aan te werken. Andere gebruikers kunnen ook bundels met jou delen die je dan hier
						terugvindt.
					</Trans>
				)}
			</p>
			<Spacer margin="top">
				<Button
					type="primary"
					icon="search"
					label={
						isCollection
							? t('collection/views/collection-overview___maak-je-eerste-collectie')
							: t(
									'collection/components/collection-or-bundle-overview___zoek-een-collectie-en-maak-je-eerste-bundel'
							  )
					}
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
				title={
					isCollection
						? t('collection/views/collection-overview___verwijder-collectie')
						: t('collection/components/collection-or-bundle-overview___verwijder-bundel')
				}
				body={t(
					'collection/views/collection-overview___bent-u-zeker-deze-actie-kan-niet-worden-ongedaan-gemaakt'
				)}
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
				owner_profile_id: getProfileId(user),
				offset: page * ITEMS_PER_PAGE,
				limit: ITEMS_PER_PAGE,
				order: { [sortColumn]: sortOrder },
				type_id: isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
			}}
			resultPath="app_collections"
			renderData={renderCollections}
			notFoundMessage={
				isCollection
					? t('collection/views/collection-overview___er-konden-geen-collecties-worden-gevonden')
					: t(
							'collection/components/collection-or-bundle-overview___er-konden-geen-bundels-worden-gevonden'
					  )
			}
			actionButtons={['home']}
		/>
	);
};

export default CollectionOrBundleOverview;
