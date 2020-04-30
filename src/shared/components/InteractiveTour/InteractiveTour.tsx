import { debounce, get, reverse, toPairs } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { matchPath, withRouter } from 'react-router';
import { compose } from 'redux';

import { Button } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { Color } from '../../../admin/shared/types';
import { SecuredRouteProps } from '../../../authentication/components/SecuredRoute';
import { APP_PATH, RouteInfo } from '../../../constants';
import { CustomError } from '../../helpers';
import withUser from '../../hocs/withUser';
import { InteractiveTourService, TourInfo } from '../../services/interactive-tour-service';

import './InteractiveTour.scss';

export interface InteractiveTourProps {
	showButton: boolean;
}

const InteractiveTour: FunctionComponent<InteractiveTourProps & SecuredRouteProps> = ({
	showButton,
	user,
	location,
}) => {
	const [t] = useTranslation();

	const [tour, setTour] = useState<TourInfo | null>(null);
	const [routeId, setRouteId] = useState<string | null>(null);

	const mapSteps = (dbSteps: Avo.InteractiveTour.Step[]): Avo.InteractiveTour.Step[] => {
		return dbSteps.map(
			(dbStep): Avo.InteractiveTour.Step => {
				const mappedStep: Partial<Avo.InteractiveTour.Step> = {};
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
				return mappedStep as Avo.InteractiveTour.Step;
			}
		);
	};

	const checkIfTourExistsForCurrentPage = useCallback(async () => {
		try {
			// Resolve current page location to route id, so we know which interactive tour to show
			// We reverse the order of the routes, since more specific routes are always declared later in the list
			const interactiveRoutePairs = reverse(
				toPairs(APP_PATH).filter(pair => pair[1].showForInteractiveTour)
			);
			const matchingRoutePair: [string, RouteInfo] | undefined = interactiveRoutePairs.find(
				pair => {
					const route = pair[1].route;
					const currentRoute = location.pathname;
					const match = matchPath(currentRoute, route);
					return !!match;
				}
			);

			let routeId: string | undefined;
			if (matchingRoutePair) {
				// static page
				routeId = matchingRoutePair[0];
			} else {
				// check content pages
				routeId = location.pathname;
			}

			// Get all routes that have an interactive tour
			const routeIdsWithTour: string[] = await InteractiveTourService.fetchInteractiveTourRouteIds();
			if (!routeIdsWithTour.includes(routeId)) {
				// No tour available for this page
				return;
			}

			// Fetch interactive tours for current user and their seen status
			const tourTemp = await InteractiveTourService.fetchStepsForPage(
				routeId,
				get(user, 'profile.id')
			);
			setTour(tourTemp);
			setRouteId(routeId);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to get the steps for the interactive tour from the database',
					err,
					{ user, pathName: location.pathname }
				)
			);
		}
	}, [setTour, location.pathname, user]);

	useEffect(() => {
		checkIfTourExistsForCurrentPage();
	}, [checkIfTourExistsForCurrentPage]);

	const markTourAsSeen = debounce(
		async () => {
			try {
				if (!tour || !routeId) {
					return;
				}
				const profileId = get(user, 'profile.id');
				await InteractiveTourService.setInteractiveTourSeen(
					routeId,
					profileId,
					(tour as TourInfo).id
				);
				setTour({
					...tour,
					seen: true,
				});
			} catch (err) {
				console.error(
					new CustomError('Failed to store interactive tour seen status', err, {
						routeId,
						user,
						tourId: (tour as TourInfo).id,
					})
				);
			}
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
					floaterProps={{ disableAnimation: true }}
					styles={{
						options: {
							primaryColor: Color.TealBright,
						},
					}}
				/>
				{showButton && (
					<Button
						type="primary"
						label={t(
							'shared/components/interactive-tour/interactive-tour___rondleiding'
						)}
						title={t(
							'shared/components/interactive-tour/interactive-tour___start-een-rondleiding-om-wegwijs-te-geraken-op-deze-pagina'
						)}
						icon="info"
						onClick={() => {
							setTour({ ...tour, seen: false });
						}}
						className="c-interactive-tour__button"
					/>
				)}
			</>
		);
	}
	return null;
};

export default compose(withRouter, withUser)(InteractiveTour) as FunctionComponent<
	InteractiveTourProps
>;
