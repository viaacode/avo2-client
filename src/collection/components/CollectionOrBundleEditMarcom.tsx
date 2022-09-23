import { get, uniq } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, RouteComponentProps } from 'react-router-dom';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	DatePicker,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Select,
	Spacer,
	Spinner,
	Table,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { CheckboxDropdownModal } from '../../shared/components';
import { buildLink, CustomError, formatDate } from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { ToastService } from '../../shared/services';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
	GET_MARCOM_ENTRY_TABLE_COLUMNS,
} from '../collection.const';
import { CollectionService } from '../collection.service';
import { ContentTypeNumber, MarcomEntry } from '../collection.types';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditMarcomProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: RouteComponentProps['history'];
}

const CollectionOrBundleEditMarcom: FunctionComponent<
	CollectionOrBundleEditMarcomProps & UserProps
> = ({ collection, changeCollectionState }) => {
	const [t] = useTranslation();

	const isCollection = collection.type_id === ContentTypeNumber.collection;

	const [marcomDate, setMarcomDate] = useState<Date | null>(new Date());
	const [marcomChannelType, setMarcomChannelType] = useState<string | null>();
	const [marcomChannelName, setMarcomChannelName] = useState<string | null>();
	const [marcomLink, setMarcomLink] = useState<string>('');
	const [marcomEntries, setMarcomEntries] = useState<MarcomEntry[] | null>(null);
	const [selectedChannelTypes, setSelectedChannelTypes] = useState<string[]>([]);

	const fetchMarcomEntries = useCallback(async () => {
		try {
			setMarcomEntries(await CollectionService.getMarcomEntries(collection.id));
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch marcom entries from the database', err, {
					collectionId: collection.id,
				})
			);
			ToastService.danger(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-ophalen-van-de-marcom-entries-is-mislukt'
				)
			);
		}
	}, [collection.id, t, setMarcomEntries]);

	useEffect(() => {
		fetchMarcomEntries();
	}, [fetchMarcomEntries]);

	const renderMarcomTableCell = (
		rowData: Partial<MarcomEntry>,
		columnId: keyof MarcomEntry | 'actions'
	): ReactNode => {
		const value = get(rowData, columnId);
		switch (columnId) {
			case 'publish_date':
				return formatDate(value) || '-';

			case 'external_link': {
				const valueLink: string = (value || '').includes('//') ? value || '' : `//${value}`;
				return value ? (
					<a href={valueLink} target="_blank" rel="noopener noreferrer">
						{truncateTableValue(value)}
					</a>
				) : (
					'-'
				);
			}

			case 'channel_type':
				return truncateTableValue(
					get(
						GET_MARCOM_CHANNEL_TYPE_OPTIONS().find((option) => option.value === value),
						'label',
						'-'
					)
				);

			case 'channel_name':
				return truncateTableValue(
					get(
						GET_MARCOM_CHANNEL_NAME_OPTIONS().find((option) => option.value === value),
						'label',
						'-'
					)
				);
			case 'parent_collection':
				return value ? (
					<Link
						to={buildLink(APP_PATH.BUNDLE_EDIT_TAB.route, {
							id: get(value, 'id'),
							tabId: 'marcom',
						})}
					>
						<span>{get(value, 'title')}</span>
					</Link>
				) : (
					''
				);

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="delete"
							onClick={() => {
								if (rowData.id) {
									deleteMarcomEntry(rowData.id);
								}
							}}
							size="small"
							title={t(
								'collection/components/collection-or-bundle-edit-marcom___verwijder-de-marcom-entry'
							)}
							ariaLabel={t(
								'collection/components/collection-or-bundle-edit-marcom___verwijder-de-marcom-entry'
							)}
							type="danger-hover"
						/>
					</ButtonToolbar>
				);

			default:
				return truncateTableValue(value) || '-';
		}
	};

	const addMarcomEntry = async () => {
		let marcomEntry: Partial<MarcomEntry> | null = null;
		try {
			marcomEntry = {
				channel_type: marcomChannelType || null,
				channel_name: marcomChannelName || null,
				collection_id: collection.id,
				external_link: marcomLink.trim() || null,
				publish_date: marcomDate?.toISOString(),
			};
			await CollectionService.insertMarcomEntry([marcomEntry]);
			if (!isCollection) {
				// It's a bundle: add this entry to all included collections
				const collectionIds = uniq(
					collection.collection_fragments.map((fragment) => fragment.external_id)
				);
				await CollectionService.insertMarcomEntriesForBundleCollections(
					collection.id,
					collectionIds,
					marcomEntry
				);
			}
			await fetchMarcomEntries();
			ToastService.success(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-toevoegen-van-de-marcom-entry-is-gelukt'
				)
			);

			setMarcomChannelType(null);
			setMarcomChannelName(null);
			setMarcomLink('');
		} catch (err) {
			console.error(
				new CustomError('Failed to insert a new marcom entry into the database', err, {
					collectionId: collection.id,
				})
			);
			ToastService.danger(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-toevoegen-van-de-marcom-entry-is-mislukt'
				)
			);
		}
	};

	const deleteMarcomEntry = async (id: string) => {
		try {
			await CollectionService.deleteMarcomEntry(id);
			await fetchMarcomEntries();
			ToastService.success(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-verwijderen-van-de-marcom-entry-is-gelukt'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to remove marcom entry from the database', err, {
					id,
				})
			);
			ToastService.danger(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-verwijderen-van-de-marcom-entry-is-mislukt'
				)
			);
		}
	};

	const getEmptyMarcomTableMessage = () => {
		if (selectedChannelTypes?.length) {
			// With filters
			return t('Er zijn geen marcom entries die voldoen aan de geselecteerde filters');
		}
		if (isCollection) {
			// Collection
			// Without filters
			return t(
				'collection/components/collection-or-bundle-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-collectie'
			);
		} else {
			// Bundle
			// Without filters
			return t(
				'collection/components/collection-or-bundle-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-collectie'
			);
		}
	};

	const channelTypeOptions = GET_MARCOM_CHANNEL_TYPE_OPTIONS().map((option) => ({
		id: option.value,
		label: option.label,
		checked: selectedChannelTypes.includes(option.value),
	}));
	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<BlockHeading type="h3">
							{t(
								'collection/components/collection-or-bundle-edit-marcom___meest-recente-communicatie'
							)}
						</BlockHeading>
						<Flex justify="between" spaced="wide">
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___datum-communicatie'
									)}
								>
									<DatePicker onChange={setMarcomDate} value={marcomDate} />
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___kanaal-type'
									)}
								>
									<Select
										options={GET_MARCOM_CHANNEL_TYPE_OPTIONS()}
										placeholder={'-'}
										onChange={setMarcomChannelType}
										value={marcomChannelType}
										clearable
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___kanaal-naam'
									)}
								>
									<Select
										options={GET_MARCOM_CHANNEL_NAME_OPTIONS()}
										placeholder={'-'}
										onChange={setMarcomChannelName}
										value={marcomChannelName}
										clearable
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___link'
									)}
								>
									<TextInput
										onChange={setMarcomLink}
										value={marcomLink || undefined}
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup label=" ">
									<Button
										label={t(
											'collection/components/collection-or-bundle-edit-marcom___toevoegen'
										)}
										onClick={addMarcomEntry}
										type="primary"
									/>
								</FormGroup>
							</FlexItem>
						</Flex>
						<Spacer margin={['top-extra-large', 'bottom-large']}>
							<BlockHeading type="h3" className="u-padding-top u-padding-bottom">
								{t(
									'collection/components/collection-or-bundle-edit-marcom___eerdere-communicatie'
								)}
							</BlockHeading>
							{marcomEntries ? (
								<>
									<CheckboxDropdownModal
										label={t('Communicatie type')}
										id="communication_type"
										options={channelTypeOptions}
										onChange={(selected) => {
											setSelectedChannelTypes(selected);
										}}
									/>
									<Table
										data={
											selectedChannelTypes?.length
												? marcomEntries.filter((entry) =>
														selectedChannelTypes.includes(
															entry.channel_type || ''
														)
												  )
												: marcomEntries
										}
										columns={GET_MARCOM_ENTRY_TABLE_COLUMNS(isCollection)}
										renderCell={renderMarcomTableCell as any}
										emptyStateMessage={getEmptyMarcomTableMessage()}
										rowKey="id"
									/>
								</>
							) : (
								<Spacer margin={['top-large', 'bottom-large']}>
									<Flex center>
										<Spinner size="large" />
									</Flex>
								</Spacer>
							)}
						</Spacer>
						<FormGroup
							label={t(
								'collection/components/collection-or-bundle-edit-marcom___opmerkingen'
							)}
						>
							<TextArea
								value={get(collection, 'marcom_note.note', '')}
								onChange={(newNote: string) => {
									changeCollectionState({
										type: 'UPDATE_COLLECTION_PROP',
										collectionProp: 'marcom_note',
										collectionPropValue: {
											...get(collection, 'marcom_note', {}),
											note: newNote,
										},
									});
								}}
							/>
						</FormGroup>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default withUser(
	CollectionOrBundleEditMarcom
) as FunctionComponent<CollectionOrBundleEditMarcomProps>;
