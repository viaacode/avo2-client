import { cloneDeep } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Container, Toolbar, ToolbarItem } from '@viaa/avo2-components';

import { generateRandomId } from '../../../shared/helpers/uuid';
import { InteractiveTourAction } from '../helpers/reducers';
import {
	EditableInteractiveTour,
	EditableStep,
	InteractiveTourEditActionType,
} from '../interactive-tour.types';

interface InteractiveTourAddProps {
	index: number;
	interactiveTour: EditableInteractiveTour;
	changeInteractiveTourState: (action: InteractiveTourAction) => void;
}

const InteractiveTourAdd: FunctionComponent<InteractiveTourAddProps> = ({
	index,
	interactiveTour,
	changeInteractiveTourState,
}) => {
	const [t] = useTranslation();

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
						icon="add"
						onClick={handleAddStepClick}
						ariaLabel={t(
							'admin/interactive-tour/components/interactive-tour-step-add___stap-toevoegen'
						)}
						title={t(
							'admin/interactive-tour/components/interactive-tour-step-add___stap-toevoegen'
						)}
					/>
				</ToolbarItem>
				{renderDivider()}
			</Toolbar>
		</Container>
	);
};

export default InteractiveTourAdd;
