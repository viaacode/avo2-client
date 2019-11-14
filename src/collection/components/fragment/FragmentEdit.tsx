import { get, orderBy } from 'lodash-es';
import React, { FunctionComponent, ReactText, SetStateAction, useState } from 'react';
import { withApollo } from 'react-apollo';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Column,
	convertToHtml,
	DropdownButton,
	DropdownContent,
	FlowPlayer,
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

import { ControlledDropdown, DeleteObjectModal } from '../../../shared/components';
import { createDropdownMenuItem, getEnv } from '../../../shared/helpers';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { IconName } from '../../../shared/types/types';

import { CutFragmentModal, FragmentAdd } from '../';
import { isMediaFragment } from '../../collection.helpers';
import { FragmentPropertyUpdateInfo } from '../../collection.types';

interface FragmentEditProps extends RouteComponentProps {
	index: number;
	collection: Avo.Collection.Collection;
	swapFragments: (currentId: number, direction: 'up' | 'down') => void;
	updateFragmentProperties: (updateInfos: FragmentPropertyUpdateInfo[]) => void;
	openOptionsId: number | null;
	setOpenOptionsId: React.Dispatch<SetStateAction<number | null>>;
	fragment: Avo.Collection.Fragment;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
	updateCollection: (collection: Avo.Collection.Collection) => void;
}

const FragmentEdit: FunctionComponent<FragmentEditProps> = ({
	index,
	collection,
	swapFragments,
	updateFragmentProperties,
	openOptionsId,
	setOpenOptionsId,
	fragment,
	reorderFragments,
	updateCollection,
}) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [useCustomFields, setUseCustomFields] = useState<boolean>(fragment.use_custom_fields);
	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [cuePoints, setCuePoints] = useState({
		start: fragment.start_oc,
		end: fragment.end_oc,
	});

	// Check whether the current fragment is the first and/or last fragment in collection
	const isFirst = (index: number) => index === 0;
	const isLast = (index: number) => index === collection.collection_fragments.length - 1;

	const FRAGMENT_DROPDOWN_ITEMS = [
		// TODO: DISABLED FEATURE
		// createDropdownMenuItem('duplicate', 'Dupliceren', 'copy'),
		// createDropdownMenuItem('move', 'Verplaatsen', 'arrow-right'),
		createDropdownMenuItem('delete', 'Verwijderen'),
		// TODO: DISABLED FEATURE
		// createDropdownMenuItem('copyToCollection', 'Kopiëren naar andere collectie', 'copy'),
		// createDropdownMenuItem('moveToCollection', 'Verplaatsen naar andere collectie', 'arrow-right'),
	];

	// Get correct fragment property according to fragment type
	const getFragmentProperty = (
		itemMetaData: Avo.Item.Item,
		fragment: Avo.Collection.Fragment,
		useCustomFields: Boolean,
		prop: 'title' | 'description'
	) =>
		useCustomFields || !itemMetaData
			? get(fragment, `custom_${prop}`, '')
			: get(itemMetaData, prop, '');

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(fragment.external_id)
			.then(data => setPlayerTicket(data))
			.catch(() => toastService('Play ticket kon niet opgehaald worden.', TOAST_TYPE.DANGER));

	const itemMetaData = (fragment as any).item_meta;

	// Listeners
	const onChangeToggle = () => {
		const propsToUpdate = [
			{
				value: !useCustomFields,
				fieldName: 'use_custom_fields' as keyof Avo.Collection.Fragment,
				fragmentId: fragment.id,
			},
		];

		// If empty title or description, apply item title and description
		const propsToTransfer: string[] = ['title', 'description'];

		propsToTransfer.forEach((prop: string) => {
			const customProp = `custom_${prop}` as keyof Avo.Collection.Fragment;

			if (!fragment[customProp] && itemMetaData[prop]) {
				propsToUpdate.push({
					value: itemMetaData[prop],
					fieldName: customProp,
					fragmentId: fragment.id,
				});
			}
		});

		updateFragmentProperties(propsToUpdate);
		setUseCustomFields(!useCustomFields);
	};

	const onChangeText = (field: 'title' | 'description', value: string) =>
		updateFragmentProperties([
			{
				value,
				fieldName: `custom_${field}` as 'custom_title' | 'custom_description',
				fragmentId: fragment.id,
			},
		]);

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

	// TODO: DISABLED FEATURE
	// const onDuplicateFragment = () => {
	// 	setOpenOptionsId(null);
	// 	toastService('Fragment is succesvol gedupliceerd', TOAST_TYPE.SUCCESS);
	// };

	// const onMoveFragment = () => {
	// 	setOpenOptionsId(null);
	// 	toastService('Fragment is succesvol verplaatst', TOAST_TYPE.SUCCESS);
	// };

	// const onCopyFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	toastService('Fragment is succesvol gekopiëerd naar collectie', TOAST_TYPE.SUCCESS);
	// };

	// const onMoveFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	toastService('Fragment is succesvol verplaatst naar collectie', TOAST_TYPE.SUCCESS);
	// };

	const onClickDropdownItem = (item: ReactText) => {
		switch (item) {
			// TODO: DISABLED FEATURE
			// case 'duplicate':
			// 	onDuplicateFragment();
			// 	break;
			// case 'move':
			// 	onMoveFragment();
			// 	break;
			case 'delete':
				setDeleteModalOpen(true);
				break;

			// TODO: DISABLED FEATURE
			// case 'copyToCollection':
			// 	onCopyFragmentToCollection();
			// 	break;
			// case 'moveToCollection':
			// 	onMoveFragmentToCollection();
			// 	break;
			default:
				return null;
		}

		setOpenOptionsId(null);
	};

	// Render functions
	const renderReorderButton = (fragmentId: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			onClick={() => swapFragments(fragmentId, direction)}
		/>
	);

	const renderForm = (fragment: Avo.Collection.Fragment, itemMetaData: Avo.Item.Item) => {
		const disableVideoFields: boolean = !useCustomFields && !!isMediaFragment(fragment);

		return (
			<Form>
				{itemMetaData && (
					<FormGroup label="Alternatieve tekst" labelFor="customFields">
						<Toggle id="customFields" checked={useCustomFields} onChange={onChangeToggle} />
					</FormGroup>
				)}
				<FormGroup label="Tekstblok titel" labelFor={`title_${fragment.id}`}>
					<TextInput
						id={`title_${fragment.id}`}
						type="text"
						value={getFragmentProperty(itemMetaData, fragment, useCustomFields, 'title')}
						placeholder="Geef hier de titel van je tekstblok in..."
						onChange={(value: string) => onChangeText('title', value)}
						disabled={disableVideoFields}
					/>
				</FormGroup>
				<FormGroup label="Tekstblok beschrijving" labelFor={`description_${fragment.id}`}>
					<WYSIWYG
						id={`description_${fragment.id}`}
						placeholder="Geef hier de inhoud van je tekstblok in..."
						data={convertToHtml(
							getFragmentProperty(itemMetaData, fragment, useCustomFields, 'description')
						)}
						onChange={(value: string) => onChangeText('description', value)}
						disabled={disableVideoFields}
					/>
				</FormGroup>
			</Form>
		);
	};

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
									menuWidth="fit-content"
									onOpen={() => setOpenOptionsId(fragment.id)}
									onClose={() => setOpenOptionsId(null)}
									placement="bottom-end"
								>
									<DropdownButton>
										<Button type="secondary" icon="more-horizontal" ariaLabel="Meer opties" />
									</DropdownButton>
									<DropdownContent>
										<MenuContent
											menuItems={FRAGMENT_DROPDOWN_ITEMS}
											onClick={onClickDropdownItem}
										/>
									</DropdownContent>
								</ControlledDropdown>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</div>
				<div className="c-panel__body">
					{isMediaFragment(fragment) && itemMetaData ? ( // TODO: Replace publisher, published_at by real publisher
						<Grid>
							<Column size="3-6">
								<FlowPlayer
									src={playerTicket ? playerTicket.toString() : null}
									poster={itemMetaData.thumbnail_path}
									title={itemMetaData.title}
									onInit={initFlowPlayer}
									subtitles={['30-12-2011', 'VRT']}
									token={getEnv('FLOW_PLAYER_TOKEN')}
									dataPlayerId={getEnv('FLOW_PLAYER_ID')}
									{...cuePoints}
								/>
							</Column>
							<Column size="3-6">{renderForm(fragment, itemMetaData)}</Column>
						</Grid>
					) : (
						<Form>{renderForm(fragment, itemMetaData)}</Form>
					)}
				</div>
			</div>

			<FragmentAdd
				index={index}
				collection={collection}
				updateCollection={updateCollection}
				reorderFragments={reorderFragments}
			/>

			<DeleteObjectModal
				title={`Ben je zeker dat je dit fragment wil verwijderen?`}
				body="Deze actie kan niet ongedaan gemaakt worden"
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				deleteObjectCallback={() => onDeleteFragment(fragment.id)}
			/>

			{itemMetaData && (
				<CutFragmentModal
					isOpen={isCutModalOpen}
					onClose={() => setIsCutModalOpen(false)}
					itemMetaData={itemMetaData}
					updateFragmentProperties={updateFragmentProperties}
					fragment={fragment}
					updateCuePoints={setCuePoints}
				/>
			)}
		</>
	);
};

export default withRouter(withApollo(FragmentEdit));
