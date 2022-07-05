import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { ReactNode, useMemo } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
	AssignmentBlockListSorter,
	ListSorterItem,
	ListSorterProps,
} from '../../shared/components';
import {
	ASSIGNMENT_CREATE_UPDATE_BLOCK_ICONS,
	ASSIGNMENT_CREATE_UPDATE_BLOCK_LABELS,
} from '../assignment.const';
import { AssignmentFormState } from '../assignment.types';
import { switchAssignmentBlockPositions } from '../helpers/switch-positions';

export function useAssignmentBlocksList(
	assignment: AssignmentFormState,
	setAssignment: React.Dispatch<React.SetStateAction<AssignmentFormState>>,
	setValue: UseFormSetValue<AssignmentFormState>,
	config?: {
		listSorter?: Partial<ListSorterProps<AssignmentBlock>>;
		listSorterItem?: Partial<ListSorterItem>;
	}
): [ReactNode, (AssignmentBlock & ListSorterItem)[]] {
	const [t] = useTranslation();

	const items = useMemo(() => {
		return assignment.blocks.map((block) => {
			const mapped: AssignmentBlock & ListSorterItem = {
				...block,
				...config?.listSorterItem,
				icon: ASSIGNMENT_CREATE_UPDATE_BLOCK_ICONS()[block.type],
				onPositionChange: (item, delta) => {
					const switched = switchAssignmentBlockPositions(assignment.blocks, item, delta);

					setAssignment((prev) => ({
						...prev,
						blocks: switched,
					}));

					setValue('blocks', switched, { shouldDirty: true, shouldTouch: true });
				},
			};

			return mapped;
		});
	}, [assignment.blocks, setAssignment, setValue, config]);

	const ui = useMemo(
		() => (
			<AssignmentBlockListSorter
				{...config?.listSorter}
				heading={(item) => item && ASSIGNMENT_CREATE_UPDATE_BLOCK_LABELS(t)[item.type]}
				items={items}
			/>
		),
		[items, config]
	);

	return [ui, items];
}
