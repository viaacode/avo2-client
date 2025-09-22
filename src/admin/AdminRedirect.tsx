import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC } from 'react';
import { type ClientLoaderFunctionArgs, redirect } from 'react-router';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
	throw redirect(request.url.replace(/^\/beheer/g, '/admin'));
}

clientLoader.hydrate = true as const;

export const AdminRedirect: FC = () => {
	return (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	);
};
