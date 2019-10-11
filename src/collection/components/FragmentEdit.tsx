import { get, orderBy } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { withApollo } from 'react-apollo';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Column,
	convertToHtml,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Grid,
	MenuContent,
	TextInput,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { FlowPlayer } from '../../shared/components/FlowPlayer/FlowPlayer';
import { fetchPlayerTicket } from '../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';
import { isMediaFragment } from '../helpers';
import FragmentAdd from './FragmentAdd';
import CutFragmentModal from './modals/CutFragmentModal';

interface FragmentEditProps extends RouteComponentProps {
	index: number;
	collection: Avo.Collection.Collection;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateFragmentProperty: (value: any, fieldName: string, fragmentId: number) => void;
	openOptionsId: number | null;
	setOpenOptionsId: React.Dispatch<React.SetStateAction<number | null>>;
	fragment: Avo.Collection.Fragment;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
	updateCollection: (collection: Avo.Collection.Collection) => void;
}

const FragmentEdit: FunctionComponent<FragmentEditProps> = ({
	index,
	collection,
	swapFragments,
	updateFragmentProperty,
	openOptionsId,
	setOpenOptionsId,
	fragment,
	reorderFragments,
	updateCollection,
}) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [useCustomFields, setUseCustomFields] = useState<boolean>(fragment.use_custom_fields);
	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
	const [cuePoints, setCuePoints] = useState({
		start: fragment.start_oc,
		end: fragment.end_oc,
	});

	// Check whether the current fragment is the first and/or last fragment in collection
	const isFirst = (index: number) => index === 0;
	const isLast = (index: number) => index === collection.collection_fragments.length - 1;

	// Render methods
	const renderReorderButton = (fragmentId: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			onClick={() => swapFragments(fragmentId, direction)}
		/>
	);

	const onChangeToggle = () => {
		updateFragmentProperty(!useCustomFields, 'use_custom_fields', fragment.id);
		setUseCustomFields(!useCustomFields);
	};

	const renderForm = (
		fragment: Avo.Collection.Fragment,
		itemMetaData: Avo.Item.Item,
		index: number
	) => {
		const disableVideoFields: boolean = !useCustomFields && !!isMediaFragment(fragment);

		const onChangeTitle = (value: string) =>
			updateFragmentProperty(value, 'custom_title', fragment.id);

		const onChangeDescription = (html: string) =>
			updateFragmentProperty(html, 'custom_description', fragment.id);

		const getFragmentProperty = (
			itemMetaData: Avo.Item.Item,
			fragment: Avo.Collection.Fragment,
			useCustomFields: Boolean,
			prop: 'title' | 'description'
		) => {
			if (useCustomFields || !itemMetaData) {
				return get(fragment, `custom_${prop}`) || '';
			}
			return get(itemMetaData, prop, '');
		};

		return (
			<Form>
				{itemMetaData && (
					<FormGroup label="Alternatieve Tekst" labelFor="customFields">
						<Toggle id="customFields" checked={useCustomFields} onChange={onChangeToggle} />
					</FormGroup>
				)}
				<FormGroup label={`Tekstblok titel`} labelFor="title">
					<TextInput
						id="title"
						type="text"
						value={getFragmentProperty(itemMetaData, fragment, useCustomFields, 'title')}
						placeholder="Titel"
						onChange={onChangeTitle}
						disabled={disableVideoFields}
					/>
				</FormGroup>
				<FormGroup label="Tekstblok beschrijving" labelFor={`beschrijving_${index}`}>
					<WYSIWYG
						id={`beschrijving_${index}`}
						data={convertToHtml(
							getFragmentProperty(itemMetaData, fragment, useCustomFields, 'description')
						)}
						onChange={onChangeDescription}
						disabled={disableVideoFields}
					/>
				</FormGroup>
			</Form>
		);
	};

	const onDuplicateFragment = (fragmentId: number) => {
		setOpenOptionsId(null);
		toastService('Fragment is succesvol gedupliceerd', TOAST_TYPE.SUCCESS);
	};

	const onMoveFragment = () => {
		setOpenOptionsId(null);
		toastService('Fragment is succesvol verplaatst', TOAST_TYPE.SUCCESS);
	};

	const onCopyFragmentToCollection = () => {
		setOpenOptionsId(null);
		toastService('Fragment is succesvol gekopiëerd naar collectie', TOAST_TYPE.SUCCESS);
	};

	const onMoveFragmentToCollection = () => {
		setOpenOptionsId(null);
		toastService('Fragment is succesvol verplaatst naar collectie', TOAST_TYPE.SUCCESS);
	};

	// Delete fragment from collection
	const onDeleteFragment = (fragmentId: number) => {
		setOpenOptionsId(null);

		// Sort fragments by position
		const orderedFragments = orderBy(
			collection.collection_fragments.filter(
				(fragment: Avo.Collection.Fragment) => fragment.id !== fragmentId
			),
			['position'],
			['asc']
		);

		const positionedFragments = reorderFragments(orderedFragments);

		updateCollection({
			...collection,
			collection_fragments: positionedFragments,
			collection_fragment_ids: positionedFragments.map(fragment => fragment.id),
		});

		toastService('Fragment is succesvol verwijderd', TOAST_TYPE.SUCCESS);
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(fragment.external_id)
			.then(data => setPlayerTicket(data))
			.catch(() => toastService('Play ticket kon niet opgehaald worden.', TOAST_TYPE.DANGER));

	const itemMetaData = (fragment as any).item_meta;

	return (
		<>
			<div className="c-panel">
				<div className="c-panel__header">
					<Toolbar>
						<ToolbarLeft>
							<ToolbarItem>
								<div className="c-button-toolbar">
									{!isFirst(index) && renderReorderButton(fragment.position, 'up')}
									{!isLast(index) && renderReorderButton(fragment.position, 'down')}
									{itemMetaData && (
										<Button
											icon="scissors"
											label="Knippen"
											type="secondary"
											onClick={() => setIsCutModalOpen(true)}
										/>
									)}
								</div>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<ControlledDropdown
									isOpen={openOptionsId === fragment.id}
									onOpen={() => setOpenOptionsId(fragment.id)}
									onClose={() => setOpenOptionsId(null)}
									placement="bottom-end"
									autoSize
								>
									<DropdownButton>
										<Button type="secondary" icon="more-horizontal" ariaLabel="Meer opties" />
									</DropdownButton>
									<DropdownContent>
										<MenuContent
											menuItems={[
												{ icon: 'copy', id: 'duplicate', label: 'Dupliceren' },
												{ icon: 'arrow-right', id: 'move', label: 'Verplaatsen' },
												{ icon: 'delete', id: 'delete', label: 'Verwijderen' },
												{
													icon: 'copy',
													id: 'copyToCollection',
													label: 'Kopiëren naar andere collectie',
												},
												{
													icon: 'arrow-right',
													id: 'moveToCollection',
													label: 'Verplaatsen naar andere collectie',
												},
											]}
											onClick={itemId => {
												switch (itemId) {
													case 'duplicate':
														onDuplicateFragment(fragment.id);
														break;
													case 'move':
														onMoveFragment();
														break;
													case 'delete':
														onDeleteFragment(fragment.id);
														break;
													case 'copyToCollection':
														onCopyFragmentToCollection();
														break;
													case 'moveToCollection':
														onMoveFragmentToCollection();
														break;
													default:
														return null;
												}
											}}
										/>
									</DropdownContent>
								</ControlledDropdown>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</div>
				<div className="c-panel__body">
					{isMediaFragment(fragment) ? ( // TODO: Replace publisher, published_at by real publisher
						<Grid>
							<Column size="3-6">
								<FlowPlayer
									src={playerTicket ? playerTicket.toString() : null}
									poster={itemMetaData.thumbnail_path}
									title={itemMetaData.title}
									onInit={initFlowPlayer}
									start={cuePoints.start}
									end={cuePoints.end}
									subtitles={['30-12-2011', 'VRT']}
								/>
							</Column>
							<Column size="3-6">{renderForm(fragment, itemMetaData, index)}</Column>
						</Grid>
					) : (
						<Form>{renderForm(fragment, itemMetaData, index)}</Form>
					)}
				</div>
			</div>
			<FragmentAdd
				index={index}
				collection={collection}
				updateCollection={updateCollection}
				reorderFragments={reorderFragments}
			/>
			{itemMetaData && (
				<CutFragmentModal
					isOpen={isCutModalOpen}
					onClose={() => setIsCutModalOpen(false)}
					itemMetaData={itemMetaData}
					updateFragmentProperty={updateFragmentProperty}
					fragment={fragment}
					updateCuePoints={setCuePoints}
				/>
			)}
		</>
	);
};

export default withRouter(withApollo(FragmentEdit));
