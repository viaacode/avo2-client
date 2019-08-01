import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

export const Footer: FunctionComponent = () => {
	return (
		<footer className="c-global-footer">
			<div className="c-global-footer__inner o-container">
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
			</div>
		</footer>
	);
};
