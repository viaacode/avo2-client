import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

import { Button } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { RouteId } from '../../../constants';
import { CustomError } from '../../helpers';

import './InteractiveTour.scss';

export interface InteractiveTourProps {
	routeId: RouteId;
	user: Avo.User.User;
	showButton: boolean;
}

const InteractiveTour: FunctionComponent<InteractiveTourProps> = ({
	routeId,
	user,
	showButton,
}) => {
	const [t] = useTranslation();

	const [steps, setSteps] = useState<Step[] | null>(null);
	const [run, setRun] = useState<boolean>(false);

	const mapSteps = (dbSteps: Step[]): Step[] => {
		return dbSteps.map(dbStep => {
			if (!dbStep.target) {
				return {
					...dbStep,
					position: 'center',
				};
			}
			return dbStep;
		});
	};

	const checkIfTourExistsForCurrentPage = useCallback(async () => {
		try {
			// TODO get steps from database if page has a tour that the user hasn't seen yet
			setSteps(
				mapSteps([
					{
						title: 'De rondleiding',
						content: 'Welkom bij de rondleiding voor de zoek pagina',
						placement: 'center',
						target: 'body',
					},
					{
						content: 'In het zoekveld kan je een zoekterm ingeven',
						target: '#query',
					},
					{
						content: 'Met de zoek knop kan je de lijst met resultaten updaten',
						target:
							'#root > div > div.c-search-view.o-container > div.c-navbar.c-navbar--bordered-bottom.c-navbar--auto > div > div > div > div > div > div.o-form-group.o-form-group--inline-shrink > div > button > div > div',
					},
				])
			);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to get the steps for the interactive tour from the database',
					err,
					{ routeId, user }
				)
			);
		}
	}, [setSteps, routeId, user]);

	useEffect(() => setRun(!!steps), [steps]);

	useEffect(() => {
		checkIfTourExistsForCurrentPage();
	}, [checkIfTourExistsForCurrentPage]);

	const handleJoyrideCallback = (data: CallBackProps) => {
		const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
		if (finishedStatuses.includes(data.status)) {
			setRun(false);
		}
	};

	// Render
	if (steps) {
		return (
			<>
				<Joyride
					steps={steps}
					callback={handleJoyrideCallback}
					locale={{
						back: t('Terug'),
						close: t('Sluit'),
						last: t('Einde'),
						next: t('Volgende'),
						skip: t('Overslaan'),
					}}
					spotlightPadding={8}
					scrollOffset={200}
					continuous
					run={run}
					showSkipButton
					styles={{
						options: {
							primaryColor: '#25A4CF',
						},
					}}
				/>
				{showButton && (
					<Button
						type="primary"
						label={t('Rondleiding')}
						icon="info"
						onClick={() => setRun(true)}
					/>
				)}
			</>
		);
	}
	return null;
};

export default InteractiveTour;
