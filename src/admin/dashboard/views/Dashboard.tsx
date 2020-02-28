import React from 'react';
import { Trans } from 'react-i18next';

import { Container } from '@viaa/avo2-components';

import i18n from '../../../shared/translations/i18n';
import { AdminLayout } from '../../shared/layouts';

const Dashboard = () => (
	<AdminLayout pageTitle={i18n.t('admin/dashboard/views/dashboard___dashboard')}>
		<Container className="u-spacer-top-l" mode="vertical" size="small">
			<p>
				<Trans i18nKey="admin/dashboard/views/dashboard___introductie-beheer-dashboard">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam ducimus odio sunt
					quidem, sint libero corporis natus hic dolor omnis veniam laborum, aliquid enim
					dolorum laudantium delectus obcaecati rem. Mollitia?
				</Trans>
			</p>
		</Container>
	</AdminLayout>
);

export default Dashboard;
