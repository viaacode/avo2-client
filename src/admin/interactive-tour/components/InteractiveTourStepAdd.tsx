import { Button, Container, IconName, Toolbar, ToolbarItem } from '@viaa/avo2-components';
import { cloneDeep } from 'lodash-es';
import React, { type FC } from 'react';

import { generateRandomId } from '../../../shared/helpers/uuid';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { type InteractiveTourAction } from '../helpers/reducers';
import {
	type EditableInteractiveTour,
	type EditableStep,
	InteractiveTourEditActionType,
} from '../interactive-tour.types';

interface InteractiveTourAddProps {
	index: number;
	interactiveTour: EditableInteractiveTour;
	changeInteractiveTourState: (action: InteractiveTourAction) => void;
}

export const InteractiveTourAdd: FC<InteractiveTourAddProps> = ({
	index,
	interactiveTour,
	changeInteractiveTourState,
}) => {
	const { tText } = useTranslation();

	const getStepsAfterInsertNewStep = (): EditableStep[] => {
		const steps = cloneDeep(interactiveTour.steps || []);

		steps.splice(index, 0, {
			title: '',
			content: '',
			contentState: undefined,
			target: '',
			id: generateRandomId(),
		});
		return steps;
	};

	// Listeners
	const handleAddStepClick = () => {
		changeInteractiveTourState({
			type: InteractiveTourEditActionType.UPDATE_INTERACTIVE_TOUR_PROP,
			interactiveTourProp: 'steps',
			interactiveTourPropValue: getStepsAfterInsertNewStep(),
		});
	};

	// Render methods
	const renderDivider = () => (
		<ToolbarItem grow>
			<div className="c-hr" />
		</ToolbarItem>
	);

	return (
		<Container>
			<Toolbar justify>
				{renderDivider()}
				<ToolbarItem>
					<Button
						type="secondary"
						icon={IconName.add}
						onClick={handleAddStepClick}
						ariaLabel={tText(
							'admin/interactive-tour/components/interactive-tour-step-add___stap-toevoegen'
						)}
						title={tText(
							'admin/interactive-tour/components/interactive-tour-step-add___stap-toevoegen'
						)}
					/>
				</ToolbarItem>
				{renderDivider()}
			</Toolbar>
		</Container>
	);
};
