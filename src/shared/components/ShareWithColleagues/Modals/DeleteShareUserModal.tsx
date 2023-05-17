import React, { FC, useEffect, useState } from 'react';

import useTranslation from '../../../hooks/useTranslation';
import ConfirmModal from '../../ConfirmModal/ConfirmModal';
import { DeleteShareUserModalContent, ShareUserInfo } from '../ShareWithColleagues.types';

type DeleteShareUserModalProps = {
	isOpen: boolean;
	onConfirm: () => void;
	onClose: () => void;
	user: ShareUserInfo;
	currentUser: ShareUserInfo;
};

const DeleteShareUserModal: FC<DeleteShareUserModalProps> = ({
	isOpen,
	onConfirm,
	onClose,
	user,
	currentUser,
}) => {
	const { tText } = useTranslation();
	const [content, setContent] = useState<DeleteShareUserModalContent | undefined>();

	useEffect(() => {
		if (currentUser && user) {
			if (currentUser.email === user.email) {
				setContent({
					title: tText(
						'shared/components/share-with-colleagues/modals/delete-share-user-modal___opdracht-verlaten'
					),
					body: tText(
						'shared/components/share-with-colleagues/modals/delete-share-user-modal___ben-je-zeker-dat-deze-opdracht-wilt-verlaten-als-kijker-deze-actie-kan-niet-ongedaan-gemaakt-worden'
					),
					confirm: tText(
						'shared/components/share-with-colleagues/modals/delete-share-user-modal___verlaat-opdracht'
					),
				});
			} else {
				setContent({
					title: tText(
						'shared/components/share-with-colleagues/modals/delete-share-user-modal___toegang-intrekken'
					),
					body: tText(
						'shared/components/share-with-colleagues/modals/delete-share-user-modal___ben-je-zeker-dat-je-voor-deze-lesgever-de-toegang-wil-intrekken-dit-wil-zeggen-dat-deze-persoon-de-opdracht-niet-meer-kan-bekijken-of-bewerken'
					),
					confirm: tText(
						'shared/components/share-with-colleagues/modals/delete-share-user-modal___trek-toegang-in'
					),
				});
			}
		}
	}, [user, currentUser]);

	return (
		<>
			{content && (
				<ConfirmModal
					title={content?.title}
					body={content?.body}
					confirmLabel={content?.confirm}
					isOpen={isOpen}
					confirmCallback={onConfirm}
					onClose={onClose}
				/>
			)}
		</>
	);
};

export default DeleteShareUserModal;
