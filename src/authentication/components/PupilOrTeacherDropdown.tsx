import { Button, Container, Spacer } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FC } from 'react';
import { useNavigate } from 'react-router';

import { APP_PATH } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import useTranslation from '../../shared/hooks/useTranslation';
import { redirectToClientPage } from '../helpers/redirects/redirect-to-client-page';

interface PupilOrTeacherDropdownProps {
	closeDropdown?: () => void;
}

const PupilOrTeacherDropdown: FC<PupilOrTeacherDropdownProps> = ({ closeDropdown = noop }) => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();

	return (
		<Container className="c-register-pupil-or-teacher-dropdown" mode="horizontal">
			<Container mode="vertical">
				<h4 className="c-h4">
					{tHtml('authentication/components/pupil-or-teacher-dropdown___ben-je-lesgever')}
				</h4>
				<p>
					{tHtml(
						'authentication/components/pupil-or-teacher-dropdown___krijg-toegang-tot-audiovisueel-lesmateriaal-maak-eigen-collecties'
					)}
				</p>
				<Spacer margin={['bottom-large', 'top-small']}>
					<Button
						block
						type="primary"
						label={tText(
							'authentication/components/pupil-or-teacher-dropdown___maak-je-gratis-account-aan'
						)}
						onClick={() => {
							closeDropdown();
							redirectToClientPage(APP_PATH.STAMBOEK.route, navigateFunc);
						}}
					/>
				</Spacer>
				<Spacer margin="top-large">
					<h4 className="c-h4">
						{tHtml(
							'authentication/components/pupil-or-teacher-dropdown___ben-je-leerling-secundair'
						)}
					</h4>
					<p>
						{tHtml(
							'authentication/components/pupil-or-teacher-dropdown___krijg-toegang-tot-opdrachten-klaargezet-door-jouw-leerkrachten'
						)}
					</p>
					<Spacer margin="top-small">
						<Button
							block
							type="primary"
							label={tText(
								'authentication/components/pupil-or-teacher-dropdown___toegang-voor-leerlingen'
							)}
							onClick={() => {
								closeDropdown();
								redirectToClientPage(`/${ROUTE_PARTS.pupils}`, navigateFunc);
							}}
						/>
					</Spacer>
				</Spacer>
			</Container>
		</Container>
	);
};

export default PupilOrTeacherDropdown;
