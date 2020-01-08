import { get, isNil, orderBy } from 'lodash-es';
import React, { FunctionComponent, ReactText, SetStateAction, useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useTranslation } from 'react-i18next';

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
	IconName,
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

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionNames,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { ControlledDropdown, DeleteObjectModal } from '../../../shared/components';
import { WYSIWYG_OPTIONS_AUTHOR, WYSIWYG_OPTIONS_DEFAULT } from '../../../shared/constants';
import { createDropdownMenuItem, getEnv } from '../../../shared/helpers';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import toastService from '../../../shared/services/toast-service';
import { FragmentPropertyUpdateInfo } from '../../collection.types';
import { getFragmentProperty, isMediaFragment } from '../../helpers';

import { CutFragmentModal, FragmentAdd } from '../';

interface FragmentEditProps extends DefaultSecureRouteProps {
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
	user,
}) => {
	const [t] = useTranslation();

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [useCustomFields, setUseCustomFields] = useState<boolean>(fragment.use_custom_fields);
	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [cuePoints, setCuePoints] = useState({
		start: fragment.start_oc,
		end: fragment.end_oc,
	});
	const [allowedToAddLinks, setAllowedToAddLinks] = useState<boolean | null>(null);

	// Check whether the current fragment is the first and/or last fragment in collection
	const isFirst = (fragmentIndex: number) => fragmentIndex === 0;
	const isLast = (fragmentIndex: number) =>
		fragmentIndex === collection.collection_fragments.length - 1;

	const FRAGMENT_DROPDOWN_ITEMS = [
		// TODO: DISABLED FEATURE
		// createDropdownMenuItem('duplicate', 'Dupliceren', 'copy'),
		// createDropdownMenuItem('move', 'Verplaatsen', 'arrow-right'),
		createDropdownMenuItem('delete', 'Verwijderen'),
		// TODO: DISABLED FEATURE
		// createDropdownMenuItem('copyToCollection', 'Kopiëren naar andere collectie', 'copy'),
		// createDropdownMenuItem('moveToCollection', 'Verplaatsen naar andere collectie', 'arrow-right'),
	];

	useEffect(() => {
		PermissionService.hasPermission(PermissionNames.ADD_HYPERLINK_COLLECTIONS, null, user)
			.then(hasPermission => {
				setAllowedToAddLinks(hasPermission);
			})
			.catch(err => {
				console.error(
					'Failed to check permissions for adding hyperlinks in collection fragment editors',
					err,
					{ user, permission: PermissionNames.ADD_HYPERLINK_COLLECTIONS }
				);
				toastService.danger(t('Het controleren van je account rechten is mislukt'));
			});
	}, [user, t]);

	const initFlowPlayer = () =>
		!playerTicket &&
		fetchPlayerTicket(fragment.external_id)
			.then(data => setPlayerTicket(data))
			.catch(() => toastService.danger('Play ticket kon niet opgehaald worden.'));

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
				({ id: collectionFragmentId }: Avo.Collection.Fragment) =>
					collectionFragmentId !== fragmentId
			),
			['position'],
			['asc']
		);

		const positionedFragments = reorderFragments(orderedFragments);

		updateCollection({
			...collection,
			collection_fragments: positionedFragments,
			collection_fragment_ids: positionedFragments.map(positionedFragment => positionedFragment.id),
		});

		toastService.success('Fragment is succesvol verwijderd');
	};

	// TODO: DISABLED FEATURE
	// const onDuplicateFragment = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success('Fragment is succesvol gedupliceerd');
	// };

	// const onMoveFragment = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success('Fragment is succesvol verplaatst');
	// };

	// const onCopyFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success('Fragment is succesvol gekopiëerd naar collectie');
	// };

	// const onMoveFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success('Fragment is succesvol verplaatst naar collectie');
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

	const renderForm = () => {
		const disableVideoFields: boolean = !useCustomFields && !!isMediaFragment(fragment);

		return (
			<Form>
				{itemMetaData && (
					<FormGroup
						label={t('collection/components/fragment/fragment-edit___alternatieve-tekst')}
						labelFor="customFields"
					>
						<Toggle id="customFields" checked={useCustomFields} onChange={onChangeToggle} />
					</FormGroup>
				)}
				<FormGroup
					label={t('collection/components/fragment/fragment-edit___tekstblok-titel')}
					labelFor={`title_${fragment.id}`}
				>
					<TextInput
						id={`title_${fragment.id}`}
						type="text"
						value={getFragmentProperty(itemMetaData, fragment, useCustomFields, 'title')}
						placeholder={t(
							'collection/components/fragment/fragment-edit___geef-hier-de-titel-van-je-tekstblok-in'
						)}
						onChange={(value: string) => onChangeText('title', value)}
						disabled={disableVideoFields}
					/>
				</FormGroup>
				<FormGroup
					label={t('collection/components/fragment/fragment-edit___tekstblok-beschrijving')}
					labelFor={`description_${fragment.id}`}
				>
					{!isNil(allowedToAddLinks) && (
						<WYSIWYG
							id={`description_${fragment.id}`}
							buttons={allowedToAddLinks ? WYSIWYG_OPTIONS_AUTHOR : WYSIWYG_OPTIONS_DEFAULT}
							placeholder={t(
								'collection/components/fragment/fragment-edit___geef-hier-de-inhoud-van-je-tekstblok-in'
							)}
							data={convertToHtml(
								getFragmentProperty(itemMetaData, fragment, useCustomFields, 'description')
							)}
							onChange={(value: string) => onChangeText('description', value)}
							disabled={disableVideoFields}
						/>
					)}
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
											label={t('collection/components/fragment/fragment-edit___knippen')}
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
										<Button
											type="secondary"
											icon="more-horizontal"
											ariaLabel={t('collection/components/fragment/fragment-edit___meer-opties')}
										/>
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
									logo={get(itemMetaData, 'organisation.logo_url')}
									{...cuePoints}
								/>
							</Column>
							<Column size="3-6">{renderForm()}</Column>
						</Grid>
					) : (
						<Form>{renderForm()}</Form>
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

export default withApollo(FragmentEdit);
