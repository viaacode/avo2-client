import React, { Fragment, FunctionComponent, ReactText, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import {
	Avatar,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Icon,
	MetaData,
	MetaDataItem,
	Spacer,
	Tabs,
	TextArea,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get, isEmpty } from 'lodash-es';
import { getCollection } from '../store/actions';
import { selectCollection } from '../store/selectors';

const mockCollection = {
	fragments: [
		{
			id: 0,
			created_at: '2017-04-10T10:29:56Z',
			updated_at: '2017-04-10T10:29:56Z',
			type: 'Intro',
			fields: [
				{
					name: 'title',
					label: 'Titel',
					editorType: 'string',
					value: 'INLEIDING',
					required: false,
				},
				{
					name: 'text',
					label: 'Beschrijving',
					editorType: 'textarea',
					value:
						'Deze collectie is gemaakt voor lessen binnen het vak economie en bedrijfsbeheer in de tweede en de derde graad van het secundair onderwijs.',
					required: true,
				},
			],
		},
		{
			id: 1,
			created_at: '2017-04-10T10:29:56Z',
			updated_at: '2017-04-10T10:29:56Z',
			type: 'VideoTitleTextButton',
			fields: [
				{
					name: 'external_id',
					label: 'Media id',
					editorType: 'none',
					value: 'xg9f48884b',
					required: true,
				},
				{
					name: 'custom_title',
					label: 'Eigen titel',
					editorType: 'string',
					value: '1. Verzekeringen: voorbeelden',
					required: false,
				},
				{
					name: 'custom_description',
					label: 'Eigen beschrijving',
					editorType: 'textarea',
					value:
						'Begingeneriek van Schooltelevisie met een aaneenschakeling van cartoons in verband met verzekeringen en situaties waarbij een verzekering handig of nodig kan zijn.',
					required: false,
				},
				{
					name: 'start_oc',
					label: 'Begin fragment',
					editorType: 'none',
					value: 0,
					required: false,
				},
				{
					name: 'end_oc',
					label: 'Einde fragment',
					editorType: 'none',
					value: 99,
					required: false,
				},
			],
		},
		{
			id: 2,
			created_at: '2017-04-10T10:29:56Z',
			updated_at: '2017-04-10T10:29:56Z',
			type: 'VideoTitleTextButton',
			fields: [
				{
					name: 'external_id',
					label: 'Media id',
					editorType: 'none',
					value: '319s189f0v',
					required: true,
				},
				{
					name: 'custom_title',
					label: 'Eigen titel',
					editorType: 'string',
					value: '2. Verzekeringen: soorten en nuttigheid',
					required: false,
				},
				{
					name: 'custom_description',
					label: 'Eigen beschrijving',
					editorType: 'textarea',
					value:
						'Een animatiefilm uit Voor hetzelfde geld in verband met verzekeringen. Het verschil tussen verplichte en niet-verplichte verzekeringen wordt aangehaald. Enkele voorbeelden van absurde verzekeringen worden opgesomd.',
					required: false,
				},
				{
					name: 'start_oc',
					label: 'Begin fragment',
					editorType: 'none',
					value: 2220,
					required: false,
				},
				{
					name: 'end_oc',
					label: 'Einde fragment',
					editorType: 'none',
					value: 2293,
					required: false,
				},
			],
		},
	],
	title: 'Verzekeringen',
	is_public: false,
	id: 1316041,
	lom_references: [],
	type_id: 3,
	d_ownerid: 1,
	created_at: '2017-11-21',
	updated_at: '2017-11-21',
	organisation_id: '0',
	mediamosa_id: 'R6XgdX5QYCNJMcnpJt5tWD4v',
	owner: {},
};

// TODO get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

interface EditCollectionProps extends RouteComponentProps {
	collection: Avo.Collection.Response;
	getCollection: (id: string) => Dispatch;
}

const EditCollection: FunctionComponent<EditCollectionProps> = ({
	collection,
	getCollection,
	match,
}) => {
	const [id] = useState((match.params as any)['id'] as string);
	const [tabId, setTabId] = useState('inhoud');

	/**
	Get collection from api when id changes
	 */
	useEffect(() => {
		getCollection(id);
	}, [id, getCollection]);

	const goToTab = (tabId: ReactText) => {
		setTabId(String(tabId));
	};

	// TODO: set type
	const renderFields = (fields: any) => {
		const titleField = fields.find((field: any) => field.name === 'custom_title');
		const textField = fields.find((field: any) => field.name === 'custom_description');

		return (
			<Form>
				{titleField && (
					<FormGroup label="Tekstblok titel" labelFor="titel">
						<TextInput
							id="titel"
							type="text"
							value={titleField.value}
							placeholder="Geef hier de titel van je tekstblok in..."
						/>
					</FormGroup>
				)}
				{textField && (
					<FormGroup label="Tekstblok inhoud" labelFor="inhoud">
						<TextArea
							id="inhoud"
							value={textField.value}
							placeholder="Geef hier de inhoud van je tekstblok in..."
						/>
					</FormGroup>
				)}
			</Form>
		);
	};

	return collection ? (
		<Fragment>
			<Container background="alt">
				<Container mode="vertical" size="small" background="alt">
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<Spacer margin="bottom">
										<MetaData spaced={true} category="collection">
											<MetaDataItem>
												<div className="c-content-type c-content-type--collection">
													<Icon name="collection" />
													<p>COLLECTION</p>
												</div>
											</MetaDataItem>
											<MetaDataItem
												icon="eye"
												label={String(188) /* TODO collection.view_count */}
											/>
											<MetaDataItem
												icon="bookmark"
												label={String(12) /* TODO collection.bookInhoud_count */}
											/>
										</MetaData>
									</Spacer>
									<h1 className="c-h2 u-m-b-0">{collection.title}</h1>
									{collection.owner && (
										<div className="o-flex o-flex--spaced">
											{!isEmpty(collection.owner) && (
												<Avatar
													image={collection.owner.avatar || undefined}
													name={`${collection.owner.fn} ${collection.owner.sn} (${
														USER_GROUPS[collection.owner.group_id]
													})`}
													initials={
														get(collection, 'owner.fn[0]', '') + get(collection, 'owner.sn[0]', '')
													}
												/>
											)}
										</div>
									)}
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										<Button type="secondary" label="Delen" />
										<Button type="secondary" label="Bekijk" />
										<Button type="secondary" label="Herschik alle items" />
										<Button type="secondary" icon="more-horizontal" />
										<Button type="primary" label="Opslaan" />
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Container mode="horizontal" background="alt">
					<Tabs
						tabs={[
							{
								id: 'inhoud',
								label: 'Inhoud',
								active: true,
							},
							{
								id: 'metadata',
								label: 'Metadata',
							},
						]}
						onClick={goToTab}
					/>
				</Container>
			</Container>
			{tabId === 'inhoud' && (
				<Container mode="vertical">
					{mockCollection.fragments.map(fragment => (
						<Container mode="horizontal" key={fragment.id}>
							<div className="c-card">
								<div className="c-card__header">
									<Toolbar>
										<ToolbarLeft>
											<ToolbarItem>
												<div className="c-button-toolbar">
													<Button type="secondary" icon="chevron-up" />
													<Button type="secondary" icon="chevron-down" />
												</div>
											</ToolbarItem>
										</ToolbarLeft>
										<ToolbarRight>
											<ToolbarItem>
												<Button type="secondary" icon="more-horizontal" />
											</ToolbarItem>
										</ToolbarRight>
									</Toolbar>
								</div>
								<div className="c-card__body">
									{!!fragment.fields.filter(field => field.name === 'external_id').length ? (
										<Grid>
											<Column size="3-6">
												<Thumbnail category="collection" label="collectie" />
											</Column>
											<Column size="3-6">{renderFields(fragment.fields)}</Column>
										</Grid>
									) : (
										renderFields(fragment.fields)
									)}
								</div>
							</div>
						</Container>
					))}
				</Container>
			)}
			{tabId === 'metadata' && <Fragment>Meta Data</Fragment>}
		</Fragment>
	) : null;
};

const mapStateToProps = (state: any, { match }: EditCollectionProps) => ({
	collection: selectCollection(state, (match.params as any).id),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getCollection: (id: string) => dispatch(getCollection(id) as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EditCollection);
