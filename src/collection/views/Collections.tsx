import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link, withRouter } from 'react-router-dom';

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
import { compose, Dispatch } from 'redux';

import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { formatDate } from '../../shared/helpers/formatters/date';
import withLoading from '../../shared/hocs/withLoading';

import { getCollections } from '../store/actions';
import { selectCollections, selectCollectionsLoading } from '../store/selectors';

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

interface CollectionsProps extends RouteComponentProps {
	collections: Avo.Collection.Response[] | null;
	getCollections: () => Dispatch;
	loading: boolean;
}

const Collections: FunctionComponent<CollectionsProps> = ({
	collections,
	getCollections,
	history,
}) => {
	// Lifecycle
	useEffect(() => {
		getCollections();
	}, [getCollections]);

	// Computed
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

	// Render
	const renderCell = (rowData: any, colKey: any) => {
		const cellData = rowData[colKey];

		switch (colKey) {
			case 'thumbnail':
				return (
					<Link to={`/collection/${rowData.id}`} title={rowData.title}>
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
							<Link to={`/collection/${rowData.id}`} title={rowData.title}>
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
												history.push(`/collection/${rowData.id}/edit`);
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
							onClick={() => history.push(`/collection/${rowData.id}`)}
							type="borderless"
							active
						/>
					</div>
				);
			default:
				return cellData;
		}
	};

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

const mapStateToProps = (state: any) => ({
	collections: selectCollections(state),
	loading: selectCollectionsLoading(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getCollections: () => dispatch(getCollections() as any),
	};
};

export default compose<FunctionComponent>(
	connect(
		mapStateToProps,
		mapDispatchToProps
	),
	withLoading,
	withRouter
)(Collections);
