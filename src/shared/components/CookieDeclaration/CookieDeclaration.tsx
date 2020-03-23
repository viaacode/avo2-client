import React, { FunctionComponent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ToastId } from 'react-toastify';

import { Button } from '@viaa/avo2-components';

import { ToastService } from '../../services';

import './CookieDeclaration.scss';

const AVO_COOKIE_ACCEPT_KEY = 'AVO_COOKIE_ACCEPT_KEY';

export interface CookieDeclarationProps {}

const CookieDeclaration: FunctionComponent<CookieDeclarationProps> = () => {
	const [t] = useTranslation();

	const [toastId, setToastId] = useState<ToastId | undefined>();
	const [accepted, setAccepted] = useState<boolean>(
		localStorage.getItem(AVO_COOKIE_ACCEPT_KEY) === 'true'
	);

	useEffect(() => {
		if (accepted) {
			localStorage.setItem(AVO_COOKIE_ACCEPT_KEY, 'true');
			ToastService.close(toastId);
		}
	}, [accepted, toastId]);

	useEffect(() => {
		if (localStorage.getItem(AVO_COOKIE_ACCEPT_KEY) !== 'true') {
			setToastId(
				ToastService.info(
					<p>
						{t(
							'Deze website maakt gebruik van cookies om uw gebruikservaring te verbeteren.'
						)}
						<br />
						<Link to={t('/cookies')}>
							<Trans>Meer informatie</Trans>
						</Link>
						<br />
						<br />
						<Button label={t('Akkoord')} onClick={() => setAccepted(true)} />
					</p>,
					true,
					{
						autoClose: false,
						position: 'bottom-center',
						className: 'c-cookie-declaration',
					}
				)
			);
		}
	}, [t, setToastId, setAccepted]);

	return null;
};

export default CookieDeclaration;
