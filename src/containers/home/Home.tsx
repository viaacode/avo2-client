import React, { FunctionComponent } from 'react'; // let's also import Component

type HomeProps = {};

export const Home: FunctionComponent<HomeProps> = (props: HomeProps) => {
	return (
		<div>
			<h2>Home page</h2>
		</div>
	);
};
