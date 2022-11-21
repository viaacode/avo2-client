import { TranslationsOverviewV2 } from '@meemoo/admin-core-ui';
import { Button } from '@viaa/avo2-components';
import clsx from 'clsx';
import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

const TranslationsOverview: FunctionComponent<DefaultSecureRouteProps> = () => {
	const [t] = useTranslation();

	const renderPopup = ({
		onSave,
		onClose,
	}: {
		title: ReactNode;
		body: ReactNode;
		onSave: () => void;
		onClose: () => void;
	}) => {
		const renderFooter = () => {
			return (
				<div
					className={clsx(
						'u-px-32 u-py-24'
						//styles['c-translations-overview__blade-footer']
					)}
				>
					<Button
						onClick={onSave}
						label={t('pages/admin/vertalingen-v-2/index___bewaar-wijzigingen')}
					/>

					<Button
						onClick={onClose}
						label={t('pages/admin/vertalingen-v-2/index___annuleer')}
					/>
				</div>
			);
		};

		return <div>{renderFooter()}</div>;
	};

	return (
		<AdminLayout
			pageTitle={t('admin/translations/views/translations-overview___vertalingen')}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/translations/views/translations-overview___vertalingen-beheer-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/translations/views/translations-overview___vertalingen-beheer-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<TranslationsOverviewV2 renderPopup={renderPopup} />
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(TranslationsOverview as FunctionComponent);
