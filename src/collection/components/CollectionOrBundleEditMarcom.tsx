import H from 'history';
import React, { FunctionComponent } from 'react';
// import { useTranslation } from 'react-i18next';

import { Column, Container, Form, Grid, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import withUser, { UserProps } from '../../shared/hocs/withUser';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditMarcomProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: H.History;
}

const CollectionOrBundleEditMarcom: FunctionComponent<
	CollectionOrBundleEditMarcomProps & UserProps
	// @ts-ignore
> = ({ collection, changeCollectionState }) => {
	// const [t] = useTranslation();

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">TODO Database voorzien om marcom velden</Column>
								<Column size="3-5">
									<></>
								</Column>
							</Grid>
						</Spacer>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default withUser(CollectionOrBundleEditMarcom) as FunctionComponent<
	CollectionOrBundleEditMarcomProps
>;
