import React from 'react';

import { Trans } from 'react-i18next';
import { AdminLayout } from '../../shared/layouts';

const Dashboard = () => (
	<AdminLayout pageTitle="Dashboard">
		<p>
			<Trans i18nKey="admin/dashboard/views/dashboard___lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-totam-ducimus-odio-sunt-quidem-sint-libero-corporis-natus-hic-dolor-omnis-veniam-laborum-aliquid-enim-dolorum-laudantium-delectus-obcaecati-rem-mollitia">Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam ducimus odio sunt quidem,
 sint libero corporis natus hic dolor omnis veniam laborum, aliquid enim dolorum laudantium
 delectus obcaecati rem. Mollitia?</Trans>
		</p>
	</AdminLayout>
);

export default Dashboard;
