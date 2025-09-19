import { Button, Container, Icon, IconName, Spacer } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { useAtomValue } from 'jotai';
import { intersection } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { type UrlUpdateType } from 'use-query-params';

import { commonUserAtom } from '../../../../authentication/authentication.store';
import { PermissionService } from '../../../../authentication/helpers/permission-service';
import { ErrorView } from '../../../../error/views/ErrorView';
import { CutFragmentForAssignmentModal } from '../../../../item/components/modals/CutFragmentForAssignmentModal';
import { type ItemTrimInfo } from '../../../../item/item.types';
import { ItemDetail } from '../../../../item/views/ItemDetail';
import { PupilCollectionService } from '../../../../pupil-collection/pupil-collection.service';
import { SearchFiltersAndResults } from '../../../../search/components/SearchFiltersAndResults';
import { searchAtom } from '../../../../search/search.store';
import { type FilterState } from '../../../../search/search.types';
import { EducationLevelId } from '../../../../shared/helpers/lom';
import { useTranslation } from '../../../../shared/hooks/useTranslation';
import { trackEvents } from '../../../../shared/services/event-logging-service';
import { ObjectTypesAll } from '../../../../shared/services/related-items-service';
import { ToastService } from '../../../../shared/services/toast-service';
import {
	ENABLED_FILTERS_PUPIL_SEARCH,
	ENABLED_ORDER_PROPERTIES_PUPIL_SEARCH,
	ENABLED_TYPE_FILTER_OPTIONS_PUPIL_SEARCH,
} from '../../../assignment.const';
import { AssignmentService } from '../../../assignment.service';
import { AssignmentType, type PupilSearchFilterState } from '../../../assignment.types';

interface AssignmentResponseSearchTabProps {
	assignment: Avo.Assignment.Assignment | null;
	assignmentResponse: Avo.Assignment.Response | null;
	filterState: any;
	setFilterState: any;
	appendBlockToPupilCollection: (block: Avo.Core.BlockItemBase) => void; // Appends a block to the end of the list of blocks of the current (unsaved) pupil collection
}

export const AssignmentResponseSearchTab: FC<AssignmentResponseSearchTabProps> = ({
	filterState,
	setFilterState,
	assignment,
	assignmentResponse,
	appendBlockToPupilCollection,
}) => {
	const { tText, tHtml } = useTranslation();

	// Data
	const searchResults = useAtomValue(searchAtom);
	const commonUser = useAtomValue(commonUserAtom);

	// UI
	const [isAddToAssignmentModalOpen, setIsAddToAssignmentModalOpen] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<Avo.Item.Item | null>(null);

	// HTTP

	// Effects

	useEffect(() => {
		// If search results change, wait for render and scroll down to result if available
		setTimeout(() => {
			const item = document.querySelector(
				`#search-result-${filterState.focus}`
			) as HTMLElement | null;
			item?.scrollIntoView({ block: 'center' });
		}, 100);
	}, [filterState.focus, searchResults]);

	useEffect(() => {
		// Is the assignment intended for elementary
		if (assignment?.education_level_id === EducationLevelId.lagerOnderwijs) {
			if (filterState.filters?.elementary !== true) {
				setFilterState({
					...filterState,
					filters: {
						...filterState.filters,
						elementary: true,
					},
				});
			}
		}
	}, [assignment, filterState, setFilterState]);

	// Events
	const goToDetailLink = (id: string): void => {
		setFilterState({
			...(filterState as PupilSearchFilterState),
			selectedSearchResultId: id,
			focus: undefined,
		});
	};

	const goToSearchLink = (newFilters: FilterState): void => {
		setFilterState({ ...filterState, ...newFilters });
	};

	const handleAddToPupilCollection = async (item: Avo.Item.Item): Promise<void> => {
		if (!assignment) {
			ToastService.info(
				tHtml(
					'assignment/views/assignment-response-edit___het-laden-van-de-opdracht-is-mislukt'
				)
			);
			return;
		}
		if (AssignmentService.isOwnerOfAssignment(assignment, commonUser)) {
			ToastService.info(
				tHtml(
					'assignment/views/assignment-response-edit___je-kan-geen-antwoord-indienen-op-je-eigen-opdracht'
				)
			);
			return;
		}
		setSelectedItem(item);
		setIsAddToAssignmentModalOpen(true);
	};

	const handleAddToPupilCollectionConfirmed = async (
		itemTrimInfo?: ItemTrimInfo
	): Promise<void> => {
		setIsAddToAssignmentModalOpen(false);
		if (selectedItem && assignmentResponse?.id) {
			const block = await PupilCollectionService.importFragmentToPupilCollection(
				selectedItem,
				assignmentResponse.id,
				itemTrimInfo
			);
			appendBlockToPupilCollection(block);

			ToastService.success(
				tHtml(
					'assignment/views/assignment-response-edit___het-fragment-is-toegevoegd-aan-je-collectie'
				)
			);
		} else {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-response-edit___het-toevoegen-van-het-fragment-aan-je-collectie-is-mislukt'
				)
			);
		}
	};

	const handleNewFilterState = (newFilterState: FilterState, urlPushType?: UrlUpdateType) => {
		setFilterState(
			{
				...newFilterState,
			},
			urlPushType
		);

		// Trigger search event
		if (assignment?.id) {
			trackEvents(
				{
					object: assignment.id,
					object_type: 'avo_assignment',
					action: 'search',
					resource: {
						...newFilterState.filters,
						education_level: String(assignment?.education_level_id),
					},
				},
				commonUser
			);
		}
	};

	const handleReturnToSearchResults = () => {
		setIsAddToAssignmentModalOpen(false);
		setSelectedItem(null);
		setFilterState({
			...filterState,
			focus: filterState.selectedSearchResultId,
			selectedSearchResultId: undefined,
		});
	};

	// Render

	const renderDetailLink = (linkText: string | ReactNode, id: string) => {
		return (
			<Button
				type="inline-link"
				className="c-button--relative-link"
				onClick={() => goToDetailLink(id)}
			>
				{linkText}
			</Button>
		);
	};

	const renderSearchLink = (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => {
		// Only render links for the filters that are enabled:
		const filters = Object.keys(newFilters.filters || {});
		if (intersection(ENABLED_FILTERS_PUPIL_SEARCH, filters).length > 0) {
			return (
				<Button
					type="inline-link"
					className={clsx('c-button--relative-link', className)}
					onClick={() =>
						setFilterState({
							...filterState,
							...newFilters,
							selectedSearchResultId: undefined,
						})
					}
				>
					{linkText}
				</Button>
			);
		} else {
			// Just render the text for the filters that are not enabled
			return linkText;
		}
	};

	const renderItemDetailActionButton = (item: Avo.Item.Item) => {
		if (!assignment?.lom_learning_resource_type?.includes(AssignmentType.BOUW)) {
			return null;
		}
		return (
			<Button
				type="tertiary"
				icon={IconName.collection}
				label={tText(
					'assignment/views/assignment-response-edit___voeg-toe-aan-mijn-collectie'
				)}
				title={tText(
					'assignment/views/assignment-response-edit___knip-fragment-bij-en-of-voeg-toe-aan-mijn-collectie'
				)}
				ariaLabel={tText(
					'assignment/views/assignment-response-edit___knip-fragment-bij-en-of-voeg-toe-aan-mijn-collectie'
				)}
				onClick={() => handleAddToPupilCollection(item)}
			/>
		);
	};

	const renderSearchResultDetailPage = () => {
		// Render fragment detail page
		return (
			<ItemDetail
				key={'item-detail-' + filterState.selectedSearchResultId}
				id={filterState.selectedSearchResultId}
				renderDetailLink={renderDetailLink}
				renderSearchLink={renderSearchLink}
				goToDetailLink={goToDetailLink}
				goToSearchLink={goToSearchLink}
				enabledMetaData={ENABLED_FILTERS_PUPIL_SEARCH}
				relatedObjectTypes={ObjectTypesAll.items}
				renderActionButtons={renderItemDetailActionButton}
				renderBookmarkCount={() => null}
				renderInteractiveTour={() => null}
			/>
		);
	};

	const renderSearchContent = useCallback(() => {
		if (filterState.selectedSearchResultId) {
			return (
				<>
					<Container bordered>
						<Container mode="horizontal">
							<Button
								type="link"
								className="c-return--search-results"
								onClick={handleReturnToSearchResults}
							>
								<Icon name={IconName.chevronLeft} size="small" type="arrows" />
								{tText(
									'assignment/views/assignment-response-edit___zoekresultaten'
								)}
							</Button>
						</Container>
					</Container>
					{renderSearchResultDetailPage()}
				</>
			);
		}
		// This form receives its parent's state because we don't care about rerender performance here
		if (!PermissionService.hasPerm(commonUser, PermissionName.SEARCH_IN_ASSIGNMENT)) {
			return (
				<ErrorView
					message={tHtml(
						'assignment/views/assignment-response-edit___je-hebt-geen-rechten-om-te-zoeken-binnen-een-opdracht'
					)}
					actionButtons={['home', 'helpdesk']}
					icon={IconName.lock}
				/>
			);
		}
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<SearchFiltersAndResults
					enabledFilters={ENABLED_FILTERS_PUPIL_SEARCH}
					enabledTypeOptions={ENABLED_TYPE_FILTER_OPTIONS_PUPIL_SEARCH}
					enabledOrderProperties={ENABLED_ORDER_PROPERTIES_PUPIL_SEARCH}
					bookmarks={false}
					filterState={filterState}
					setFilterState={handleNewFilterState}
					renderDetailLink={renderDetailLink}
					renderSearchLink={renderSearchLink}
				/>
			</Spacer>
		);
	}, [
		filterState,
		handleNewFilterState,
		renderDetailLink,
		renderSearchLink,
		commonUser,
		tText,
		tHtml,
	]);

	return (
		<>
			{renderSearchContent()}
			{selectedItem && isAddToAssignmentModalOpen && (
				<CutFragmentForAssignmentModal
					key={'cut-fragment-modal-' + selectedItem.external_id}
					itemMetaData={selectedItem}
					isOpen={isAddToAssignmentModalOpen}
					onClose={() => setIsAddToAssignmentModalOpen(false)}
					afterCutCallback={handleAddToPupilCollectionConfirmed}
				/>
			)}
		</>
	);
};
