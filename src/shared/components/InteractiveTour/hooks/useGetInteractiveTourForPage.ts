import { useQuery } from '@tanstack/react-query';
import { reverse, toPairs } from 'lodash-es';
import { matchPath } from 'react-router';

import { APP_PATH, RouteId, RouteInfo } from '../../../../constants';
import { QUERY_KEYS } from '../../../constants/query-keys';
import { InteractiveTourService, TourInfo } from '../../../services/interactive-tour.service';

async function getInteractiveTourForPage(
	currentPath: string,
	tourDisplayDates: { [tourId: string]: string } | null,
	profileId: string
): Promise<{ tour: TourInfo | null; routeId: RouteId | null }> {
	if (!tourDisplayDates) {
		return {
			tour: null,
			routeId: null,
		};
	}
	// Resolve current page location to route id, so we know which interactive tour to show
	// We reverse the order of the routes, since more specific routes are always declared later in the list
	const interactiveRoutePairs = reverse(
		toPairs(APP_PATH).filter((pair) => pair[1].showForInteractiveTour)
	);

	const matchingRoutePair: [string, RouteInfo] | undefined = interactiveRoutePairs.find(
		(pair) => {
			const route = pair[1].route;
			const match = matchPath(currentPath, route);
			return !!match;
		}
	);

	let routeId: RouteId | undefined;
	if (matchingRoutePair) {
		// static page
		routeId = matchingRoutePair[0] as RouteId;
	} else {
		// check content pages
		routeId = location.pathname as RouteId;
	}

	// Get all routes that have an interactive tour
	const routeIdsWithTour: string[] = await InteractiveTourService.fetchInteractiveTourRouteIds();

	if (!routeIdsWithTour.includes(routeId)) {
		// No tour available for this page
		return {
			tour: null,
			routeId: routeId,
		};
	}

	// Fetch interactive tours for current user and their seen status
	const tourTemp = await InteractiveTourService.fetchStepsForPage(
		routeId,
		profileId,
		tourDisplayDates
	);
	return {
		tour: tourTemp,
		routeId,
	};
}

export const useGetInteractiveTourForPage = (
	currentPath: string,
	tourDisplayDates: { [tourId: string]: string } | null,
	profileId: string,
	options?: {
		enabled: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	}
) => {
	return useQuery(
		[QUERY_KEYS.GET_INTERACTIVE_TOUR_FOR_PAGE, currentPath, tourDisplayDates, profileId],
		() => {
			return getInteractiveTourForPage(currentPath, tourDisplayDates, profileId);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			...options,
		}
	);
};
