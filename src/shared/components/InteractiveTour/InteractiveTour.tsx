import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

import { Button } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { RouteId } from '../../../constants';
import { CustomError } from '../../helpers';
import { InteractiveTourService, TourInfo } from '../../services/interactive-tour-service';
import { debounce } from 'lodash-es';

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

	const [tour, setTour] = useState<TourInfo | null>(null);

	const mapSteps = (dbSteps: Step[]): Step[] => {
		return dbSteps.map(
			(dbStep): Step => {
				const mappedStep: Partial<Step> = {};
				if (!dbStep.target) {
					mappedStep.placement = 'center';
					mappedStep.target = 'body';
				} else {
					mappedStep.target = dbStep.target;
				}
				mappedStep.disableBeacon = true;
				mappedStep.title = dbStep.title;
				mappedStep.content = (
					<div
						dangerouslySetInnerHTML={{
							__html: dbStep.content as string,
						}}
					/>
				);
				return mappedStep as Step;
			}
		);
	};

	const checkIfTourExistsForCurrentPage = useCallback(async () => {
		try {
			if (!user.profile) {
				console.error(
					new CustomError(
						'Failed to get steps for interactive tour because user does not contain a profile',
						null,
						{ user }
					)
				);
				return;
			}
			const tourTemp = await InteractiveTourService.fetchStepsForPage(
				routeId,
				user.profile.id
			);
			setTour(tourTemp);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to get the steps for the interactive tour from the database',
					err,
					{ routeId, user }
				)
			);
		}
	}, [setTour, routeId, user]);

	useEffect(() => {
		checkIfTourExistsForCurrentPage();
	}, [checkIfTourExistsForCurrentPage]);

	const markTourAsSeen = debounce(
		() => {
			if (!tour) {
				return;
			}
			InteractiveTourService.setInteractiveTourSeen(
				routeId,
				(user.profile as Avo.User.Profile).id,
				(tour as TourInfo).id
			).catch(err => {
				console.error(
					new CustomError('Failed to store interactive tour seen status', err, {
						routeId,
						profileId: (user.profile as Avo.User.Profile).id,
						tourId: (tour as TourInfo).id,
					})
				);
			});
			setTour({
				...tour,
				seen: true,
			});
		},
		100,
		{ trailing: true }
	);

	const handleJoyrideCallback = (data: CallBackProps) => {
		if (!tour) {
			return;
		}
		const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
		if (finishedStatuses.includes(data.status)) {
			markTourAsSeen();
		}
	};

	// Render
	if (tour) {
		return (
			<>
				<Joyride
					steps={mapSteps(tour.steps)}
					callback={handleJoyrideCallback}
					locale={{
						back: t('shared/components/interactive-tour/interactive-tour___terug'),
						close: t('shared/components/interactive-tour/interactive-tour___sluit'),
						last: t('shared/components/interactive-tour/interactive-tour___einde'),
						next: t('shared/components/interactive-tour/interactive-tour___volgende'),
						skip: t('shared/components/interactive-tour/interactive-tour___overslaan'),
					}}
					spotlightPadding={8}
					scrollOffset={200}
					continuous
					run={!tour.seen}
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
						label={t(
							'shared/components/interactive-tour/interactive-tour___rondleiding'
						)}
						icon="info"
						onClick={() => {
							setTour({ ...tour, seen: false });
						}}
					/>
				)}
			</>
		);
	}
	return null;
};

export default InteractiveTour;
