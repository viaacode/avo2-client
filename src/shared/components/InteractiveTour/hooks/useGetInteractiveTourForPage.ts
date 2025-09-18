import { useQuery } from '@tanstack/react-query';
import { compact, reverse, sortBy, toPairs } from 'lodash-es';
import { matchPath } from 'react-router';
import { type PathMatch } from 'react-router-dom';

import { APP_PATH, type RouteId, type RouteInfo } from '../../../../constants';
import { QUERY_KEYS } from '../../../constants/query-keys';
import { InteractiveTourService, type TourInfo } from '../../../services/interactive-tour.service';

async function getInteractiveTourForPage(
	currentPath: string,
	tourDisplayDates: { [tourId: string]: string } | null,
	profileId: string | undefined
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

	const matchingRoutePairs: [string, RouteInfo, PathMatch][] = compact(
		interactiveRoutePairs.map((pair) => {
			const route = pair[1].route;
			const match = matchPath(currentPath, route);
			if (match) {
				return [...pair, match];
			} else {
				return null;
			}
		})
	);

	const matchingRoutePairsSorted = sortBy(matchingRoutePairs, (pair) => {
		if (pair[2].pathname === pair[2].pathnameBase) {
			// Exact match always should be considered first
			// eg: /opdrachten/maak is better than /opdrachten/:id
			return -1000;
		} else {
			// A more specific path should be used first
			// eg: /opdrachten/:id/bewerk/:tabId is better than /opdrachten/:id
			return -pair[2].pathname.length;
		}
	});

	// Prefer exact route matches over matches with a parameter
	const matchingRoutePair = matchingRoutePairsSorted[0];

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

	const firstStep = tourTemp?.steps[0];

	if (document.querySelector(firstStep?.target)) {
		return {
			tour: tourTemp,
			routeId,
		};
	} else {
		console.warn(`Could not find target for first step "${firstStep?.title}}"`, {
			target: firstStep?.target,
		});

		return {
			tour: null,
			routeId: null,
		};
	}
}

export const useGetInteractiveTourForPage = (
	currentPath: string,
	tourDisplayDates: { [tourId: string]: string } | null,
	profileId: string | undefined,
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
