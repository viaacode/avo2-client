import { Color } from '@meemoo/admin-core-ui';
import { Button, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact, debounce } from 'lodash-es';
import React, { type FunctionComponent, useCallback, useEffect, useState } from 'react';
import Joyride, { type CallBackProps } from 'react-joyride';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import { type SecuredRouteProps } from '../../../authentication/components/SecuredRoute';
import useTranslation from '../../../shared/hooks/useTranslation';
import { type AppState } from '../../../store';
import { selectShowNudgingModal } from '../../../store/selectors';
import { CustomError } from '../../helpers';
import withUser from '../../hocs/withUser';
import { InteractiveTourService, type TourInfo } from '../../services/interactive-tour.service';
import Html from '../Html/Html';

import './InteractiveTour.scss';
import { useGetInteractiveTourForPage } from './hooks/useGetInteractiveTourForPage';

export const TOUR_DISPLAY_DATES_LOCAL_STORAGE_KEY = 'AVO.tour_display_dates';

export interface InteractiveTourProps {
	showButton: boolean;
}

interface UiStateProps {
	showNudgingModal: boolean;
}

const INTERACTIVE_TOUR_IN_PROGRESS_CLASS = 'c-interactive-tour--in-progress';

const InteractiveTour: FunctionComponent<
	InteractiveTourProps & SecuredRouteProps & UiStateProps
> = ({ showButton, commonUser, location, showNudgingModal }) => {
	const { tText } = useTranslation();

	// Sometimes we render things with displayDesktopMobile so elements can be loaded but should not initialize since they are hidden for that media query (eg: mobile)
	const [tourDisplayDates, setTourDisplayDates] = useState<{ [tourId: string]: string } | null>(
		null
	);
	const { data: interactiveTourInfo } = useGetInteractiveTourForPage(
		location.pathname,
		tourDisplayDates,
		commonUser.profileId
	);
	const tour = interactiveTourInfo?.tour;
	const routeId = interactiveTourInfo?.routeId;
	const [seen, setSeen] = useState<boolean | null>(tour?.seen ?? null);

	console.info({ tour });

	useEffect(() => {
		if (tour) {
			setSeen(tour.seen);
		}
	}, [tour]);

	const getTourDisplayDates = useCallback(() => {
		try {
			setTourDisplayDates(
				JSON.parse(
					(localStorage && localStorage.getItem(TOUR_DISPLAY_DATES_LOCAL_STORAGE_KEY)) ||
						'{}'
				)
			);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to parse tour dates in local storage. Possibly local storage is not available (iframe/incognito browser)',
					err
				)
			);
		}
	}, [setTourDisplayDates]);

	const updateTourDisplayDate = useCallback(
		(tourId: string) => {
			const newTourDisplayDates = { ...tourDisplayDates, [tourId]: new Date().toISOString() };
			try {
				if (localStorage) {
					localStorage.setItem(
						TOUR_DISPLAY_DATES_LOCAL_STORAGE_KEY,
						JSON.stringify(newTourDisplayDates)
					);
				}
			} catch (err) {
				console.error(
					new CustomError(
						'Failed to parse tour dates in local storage. Possibly local storage is not available (iframe/incognito browser)',
						err
					)
				);
			}
		},
		[tourDisplayDates]
	);

	useEffect(() => {
		getTourDisplayDates();
	}, [getTourDisplayDates]);

	const mapSteps = (dbSteps: Avo.InteractiveTour.Step[]): Avo.InteractiveTour.Step[] => {
		return compact(
			dbSteps.map((dbStep): Avo.InteractiveTour.Step | null => {
				const mappedStep: Partial<Avo.InteractiveTour.Step> = {};
				if (!dbStep.target) {
					mappedStep.placement = 'center';
					mappedStep.target = 'body';
				} else {
					mappedStep.target = dbStep.target;
				}
				mappedStep.disableBeacon = true;
				mappedStep.title = dbStep.title;
				mappedStep.content = <Html content={dbStep.content as string} type="div" />;
				mappedStep.placement = 'bottom';

				// Remove steps for which the target isn't found
				if (!document.querySelector(mappedStep.target)) {
					console.warn(`Could not find target for step "${mappedStep.title}}"`, {
						target: mappedStep.target,
					});
					return null;
				}

				return mappedStep as Avo.InteractiveTour.Step;
			})
		);
	};

	const markTourAsSeen = debounce(
		async () => {
			try {
				if (!tour || !routeId) {
					return;
				}
				await InteractiveTourService.setInteractiveTourSeen(
					routeId,
					commonUser.profileId,
					(tour as TourInfo).id
				);
				setSeen(true);
			} catch (err) {
				console.error(
					new CustomError('Failed to store interactive tour seen status', err, {
						routeId,
						profileId: commonUser.profileId,
						tourId: (tour as TourInfo).id,
					})
				);
			}
		},
		100,
		{ trailing: true }
	);

	const handleJoyrideCallback = async (data: CallBackProps) => {
		if (!tour) {
			return;
		}
		if (data.action === 'start') {
			document.body.classList.add(INTERACTIVE_TOUR_IN_PROGRESS_CLASS);
		}
		if (data.action === 'stop' || data.action === 'close' || data.status === 'finished') {
			document.body.classList.remove(INTERACTIVE_TOUR_IN_PROGRESS_CLASS);
		}
		if (data.action === 'close' || data.action === 'skip' || data.status === 'finished') {
			setSeen(true);
			if (data.action === 'close' || data.status === 'finished') {
				await markTourAsSeen();
			} else {
				// skip
				if ((tourDisplayDates || {})[tour.id]) {
					// if date was set already => hide the tour forever
					await markTourAsSeen();
				} else {
					// if date was not set => keep track of date in localstorage
					updateTourDisplayDate(String(tour.id));
				}
			}
		}
	};

	// Render
	if (tour && tourDisplayDates) {
		return (
			<div className="c-interactive-tour">
				<Joyride
					steps={mapSteps(tour.steps)}
					callback={handleJoyrideCallback}
					locale={{
						back: tText('shared/components/interactive-tour/interactive-tour___terug'),
						close: tText('shared/components/interactive-tour/interactive-tour___sluit'),
						last: tText('shared/components/interactive-tour/interactive-tour___einde'),
						next: tText(
							'shared/components/interactive-tour/interactive-tour___volgende'
						),
						skip: tText(
							'shared/components/interactive-tour/interactive-tour___overslaan'
						),
					}}
					spotlightPadding={8}
					scrollOffset={220}
					continuous
					run={!seen && !showNudgingModal}
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
						type="borderless"
						label={tText(
							'shared/components/interactive-tour/interactive-tour___rondleiding'
						)}
						title={tText(
							'shared/components/interactive-tour/interactive-tour___start-een-rondleiding-om-wegwijs-te-geraken-op-deze-pagina'
						)}
						icon={IconName.info}
						onClick={() => {
							setSeen(false);
						}}
						className="c-interactive-tour__button"
					/>
				)}
			</div>
		);
	}
	return null;
};

const mapStateToProps = (state: AppState) => ({
	showNudgingModal: selectShowNudgingModal(state),
});

export default compose(
	connect(mapStateToProps),
	withRouter,
	withUser
)(InteractiveTour) as FunctionComponent<InteractiveTourProps>;
