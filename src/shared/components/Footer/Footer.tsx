import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { Container } from '@viaa/avo2-components';

export const Footer: FunctionComponent = () => {
	return (
		<footer className="c-global-footer">
			<Container mode="horizontal" className="c-global-footer__inner">
				<ul>
					<li>
						Een realisatie van <a href="https://viaa.be">VIAA.be</a>
					</li>
					<li>
						<Link to="/terms-and-conditions">Gebruiksvoorwaarden</Link>
					</li>
					<li>
						<Link to="/privacy">Privacyverklaring</Link>
					</li>
					<li>
						<Link to="/cookies">Cookieverklaring</Link>
					</li>
				</ul>
				<ul>
					<li>
						<Link to="/help">Hulp</Link>
					</li>
				</ul>
			</Container>
		</footer>
	);
};
