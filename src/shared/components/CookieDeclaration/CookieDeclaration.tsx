import React, { FunctionComponent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ToastId } from 'react-toastify';

import { Button } from '@viaa/avo2-components';

import { ToastService } from '../../services';

import './CookieDeclaration.scss';

const AVO_COOKIE_ACCEPT_KEY = 'AVO_COOKIE_ACCEPT_KEY';

const CookieDeclaration: FunctionComponent = () => {
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
							'shared/components/cookie-declaration/cookie-declaration___deze-website-maakt-gebruik-van-cookies-om-uw-gebruikservaring-te-verbeteren'
						)}
						<br />
						<Link
							to={t(
								'shared/components/cookie-declaration/cookie-declaration___cookies'
							)}
						>
							<Trans i18nKey="shared/components/cookie-declaration/cookie-declaration___meer-informatie">
								Meer informatie
							</Trans>
						</Link>
						<br />
						<br />
						<Button
							label={t(
								'shared/components/cookie-declaration/cookie-declaration___akkoord'
							)}
							title={t(
								'shared/components/cookie-declaration/cookie-declaration___ga-akkoord-met-de-cookie-voorwaarden'
							)}
							onClick={() => setAccepted(true)}
						/>
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
