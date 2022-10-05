import { Button, Container, Icon, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { intersection } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UrlUpdateType } from 'use-query-params';

import {
	PermissionName,
	PermissionService,
} from '../../../../authentication/helpers/permission-service';
import { ErrorView } from '../../../../error/views';
import { AddToAssignmentModal } from '../../../../item/components';
import { ItemTrimInfo } from '../../../../item/item.types';
import ItemDetail from '../../../../item/views/ItemDetail';
import { PupilCollectionService } from '../../../../pupil-collection/pupil-collection.service';
import { SearchFiltersAndResults } from '../../../../search/components';
import { FilterState } from '../../../../search/search.types';
import withUser, { UserProps } from '../../../../shared/hocs/withUser';
import { useScrollToSelector } from '../../../../shared/hooks/scroll-to-selector';
import { ToastService } from '../../../../shared/services';
import { trackEvents } from '../../../../shared/services/event-logging-service';
import {
	ENABLED_FILTERS_PUPIL_SEARCH,
	ENABLED_ORDER_PROPERTIES_PUPIL_SEARCH,
	ENABLED_TYPE_FILTER_OPTIONS_PUPIL_SEARCH,
} from '../../../assignment.const';
import { AssignmentService } from '../../../assignment.service';
import { PupilSearchFilterState } from '../../../assignment.types';

interface AssignmentResponseSearchTabProps {
	assignment: Avo.Assignment.Assignment_v2 | null;
	assignmentResponse: Assignment_Response_v2 | null;
	filterState: any;
	setFilterState: any;
	appendBlockToPupilCollection: (block: Avo.Core.BlockItemBase) => void; // Appends a block to the end of the list of blocks of the current (unsaved) pupil collection
}

const AssignmentResponseSearchTab: FunctionComponent<
	AssignmentResponseSearchTabProps & UserProps
> = ({
	filterState,
	setFilterState,
	assignment,
	assignmentResponse,
	appendBlockToPupilCollection,
	user,
}) => {
	const [t] = useTranslation();

	// Data

	// UI
	const [isAddToAssignmentModalOpen, setIsAddToAssignmentModalOpen] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<Avo.Item.Item | null>(null);
	useScrollToSelector(filterState.focus ? `#search-result-${filterState.focus}` : null);

	// HTTP

	// Effects

	// Events
	const goToDetailLink = (id: string): void => {
		setFilterState({
			...(filterState as PupilSearchFilterState),
			selectedSearchResultId: id,
		});
	};

	const goToSearchLink = (newFilters: FilterState): void => {
		setFilterState({ ...filterState, ...newFilters });
	};

	const handleAddToPupilCollection = async (item: Avo.Item.Item): Promise<void> => {
		if (!assignment) {
			ToastService.info(
				t(
					'assignment/views/assignment-response-edit___het-laden-van-de-opdracht-is-mislukt'
				)
			);
			return;
		}
		if (AssignmentService.isOwnerOfAssignment(assignment, user)) {
			ToastService.info(
				t(
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
				t(
					'assignment/views/assignment-response-edit___het-fragment-is-toegevoegd-aan-je-collectie'
				)
			);
		} else {
			ToastService.danger(
				t(
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
					resource: newFilterState.filters,
				},
				user
			);
		}
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
					className={classnames('c-button--relative-link', className)}
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
		if (assignment?.assignment_type !== 'BOUW') {
			return null;
		}
		return (
			<Button
				type="tertiary"
				icon="collection"
				label={t('assignment/views/assignment-response-edit___voeg-toe-aan-mijn-collectie')}
				title={t(
					'assignment/views/assignment-response-edit___knip-fragment-bij-en-of-voeg-toe-aan-mijn-collectie'
				)}
				ariaLabel={t(
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
				id={filterState.selectedSearchResultId}
				renderDetailLink={renderDetailLink}
				renderSearchLink={renderSearchLink}
				goToDetailLink={goToDetailLink}
				goToSearchLink={goToSearchLink}
				enabledMetaData={ENABLED_FILTERS_PUPIL_SEARCH}
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
								onClick={() => {
									setFilterState({
										...filterState,
										focus: filterState.selectedSearchResultId,
										selectedSearchResultId: undefined,
									});
								}}
							>
								<Icon name="chevron-left" size="small" type="arrows" />
								{t('assignment/views/assignment-response-edit___zoekresultaten')}
							</Button>
						</Container>
					</Container>
					{renderSearchResultDetailPage()}
				</>
			);
		}
		// This form receives its parent's state because we don't care about rerender performance here
		if (!PermissionService.hasPerm(user, PermissionName.SEARCH_IN_ASSIGNMENT)) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___je-hebt-geen-rechten-om-te-zoeken-binnen-een-opdracht'
					)}
					actionButtons={['home', 'helpdesk']}
					icon="lock"
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
	}, [filterState, handleNewFilterState, renderDetailLink, renderSearchLink, user]);

	return (
		<>
			{renderSearchContent()}
			{selectedItem && (
				<AddToAssignmentModal
					itemMetaData={selectedItem}
					isOpen={isAddToAssignmentModalOpen}
					onClose={() => setIsAddToAssignmentModalOpen(false)}
					onAddToAssignmentCallback={handleAddToPupilCollectionConfirmed}
				/>
			)}
		</>
	);
};

export default withUser(
	AssignmentResponseSearchTab
) as FunctionComponent<AssignmentResponseSearchTabProps>;
