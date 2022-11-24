import { TranslationsOverviewV2 } from '@meemoo/admin-core-ui';
import { Modal } from '@meemoo/react-components';
import { Button } from '@viaa/avo2-components';
import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import styles from './TranslationsOverviewV2.module.scss';

const TranslationsOverview: FunctionComponent<DefaultSecureRouteProps> = () => {
	const [t] = useTranslation();

	const renderPopup = ({
		title,
		body,
		isOpen,
		onSave,
		onClose,
	}: {
		title: string;
		body: ReactNode;
		onSave: () => void;
		onClose: () => void;
		isOpen: boolean;
	}) => {
		const closeButton = () => {
			return <Button icon="close" onClick={onClose} />;
		};

		const renderHeader = () => {
			return (
				<div className={styles['test']}>
					{title}
					{closeButton()}
				</div>
			);
		};

		const renderFooter = () => {
			return (
				<div className="u-px-32 u-py-24">
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

		return (
			<>
				{/* the div disables the background */}
				<div
					className={styles['c-translations-overview__modal']}
					style={{ background: 'black', width: '200vh', height: '100vh', opacity: 0.5 }}
					hidden={!isOpen}
					onClick={() => onClose()}
				/>
				<Modal
					className={styles['c-translations-overview__modal']}
					isOpen={isOpen}
					closeButtonProps={{ hidden: true }}
					heading={renderHeader()}
					footer={renderFooter()}
					onClose={onClose}
				>
					{body}
				</Modal>
			</>
		);
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
				<TranslationsOverviewV2
					renderPopup={renderPopup}
					className={styles['c-translations-overview']}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(TranslationsOverview as FunctionComponent);
