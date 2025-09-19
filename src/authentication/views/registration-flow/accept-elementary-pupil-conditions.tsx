import './accept-elementary-pupil-conditions.scss';

import {
	BlockHeading,
	BlockRichText,
	BlockVideoWrapper,
} from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Button,
	Column,
	Container,
	Grid,
	Spacer,
	Spinner,
	Toolbar,
	ToolbarCenter,
} from '@viaa/avo2-components';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { type FC, useRef, useState } from 'react';

import poster from '../../../assets/images/elementary-pupil-terms-of-service__poster.png';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useDisablePictureInPicture } from '../../../shared/hooks/useDisablePictureInPicture';
import { NotificationService } from '../../../shared/services/notification-service';
import { ToastService } from '../../../shared/services/toast-service';
import { acceptConditionsAtom, commonUserAtom } from '../../../store/store';

const ACCEPTED_ELEMENTARY_PUPIL_TERMS_OF_USE = 'ACCEPTED_ELEMENTARY_PUPIL_TERMS_OF_USE';

export const AcceptElementaryPupilConditions: FC = () => {
	const section = useRef<HTMLElement>(null);
	useDisablePictureInPicture(section);

	const [loading, setLoading] = useState(false);
	const [finished, setFinished] = useState(false);

	const commonUser = useAtomValue(commonUserAtom);
	const acceptConditions = useSetAtom(acceptConditionsAtom);

	const handleAcceptPupilConditions = async () => {
		try {
			setLoading(true);
			await NotificationService.setNotification(
				ACCEPTED_ELEMENTARY_PUPIL_TERMS_OF_USE,
				commonUser.profileId,
				true,
				true
			);

			acceptConditions();
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to set accept conditions notification in the database',
					err,
					{ commonUser }
				)
			);

			ToastService.danger(
				tHtml(
					'authentication/views/registration-flow/accept-elementary-pupil-conditions___het-opslaan-van-je-voorkeuren-is-niet-gelukt'
				)
			);

			setLoading(false); // Disable spinner on error, if success => we redirect to other route
		}
	};

	return (
		<section ref={section}>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Grid>
						<Column size="1-12">
							<Spacer margin="medium">
								<BlockHeading type="h1">
									{tHtml(
										'authentication/views/registration-flow/accept-elementary-pupil-conditions___welkom-op-het-archief-voor-lager-onderwijs'
									)}
								</BlockHeading>
							</Spacer>

							<Spacer
								margin="medium"
								className="c-accept-elementary-pupil-conditions__intro"
							>
								<BlockRichText
									elements={{
										content: tText(
											'authentication/views/registration-flow/accept-elementary-pupil-conditions___bekijk-dit-filmpje-voor-een-overzicht-wat-je-als-leerling-lager-mag-verwachten'
										),
									}}
								/>
							</Spacer>

							<Spacer margin="medium">
								<BlockVideoWrapper
									title={tText(
										'authentication/views/registration-flow/accept-elementary-pupil-conditions___toegankelijkheids-titel-van-het-introductiefilmpje-voor-leerlingen-lager'
									)}
									src={tText(
										'authentication/views/registration-flow/accept-elementary-pupil-conditions___url-van-het-introductiefilmpje-voor-leerlingen-lager'
									)}
									ui={4 | 1} // NO_MUTE | NO_FULLSCREEN
									seekable={false}
									speed={null}
									onEnded={() => setFinished(true)}
									poster={poster}
								/>
							</Spacer>

							<Spacer
								margin="medium"
								className="c-accept-elementary-pupil-conditions__outro"
							>
								<BlockRichText
									elements={{
										content: tText(
											'authentication/views/registration-flow/accept-elementary-pupil-conditions___met-deze-informatie-ben-je-helemaal-klaar-om-het-archief-voor-lager-onderwijs-te-verkennen'
										),
									}}
								/>
							</Spacer>

							<Toolbar>
								<ToolbarCenter>
									{loading ? (
										<Spinner size={'large'} />
									) : (
										<Button
											disabled={!finished}
											label={tText(
												'authentication/views/registration-flow/accept-elementary-pupil-conditions___ik-snap-het'
											)}
											title={tText(
												'authentication/views/registration-flow/accept-elementary-pupil-conditions___ik-snap-het'
											)}
											type="primary"
											onClick={handleAcceptPupilConditions}
										/>
									)}
								</ToolbarCenter>
							</Toolbar>
						</Column>
					</Grid>
				</Container>
			</Container>
		</section>
	);
};
