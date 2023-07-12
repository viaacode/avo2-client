import {
	ContributorInfo,
	ContributorInfoRights,
	ShareRightsType,
} from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import { tText } from '../../shared/helpers/translate';
import { ToastService } from '../../shared/services/toast-service';
import { CollectionService } from '../collection.service';

export async function onDeleteContributor(
	info: ContributorInfo,
	collectionId: string,
	fetchContributors: () => void
) {
	try {
		await CollectionService.deleteContributor(collectionId, info.contributorId, info.profileId);

		await fetchContributors();

		ToastService.success(
			tText(
				'collection/components/collection-or-bundle-edit___gebruiker-is-verwijderd-van-de-collectie'
			)
		);
	} catch (err) {
		ToastService.danger(
			tText(
				'collection/components/collection-or-bundle-edit___er-liep-iets-fout-met-het-verwijderen-van-een-collega'
			)
		);
	}
}

export async function onEditContributor(
	user: ContributorInfo,
	newRights: ShareRightsType,
	collectionId: string,
	fetchContributors: () => void,
	fetchCollection: () => void
) {
	try {
		if (collectionId) {
			if (newRights === ContributorInfoRights.OWNER) {
				await CollectionService.transferCollectionOwnerShip(
					collectionId,
					user.contributorId as string
				);

				await fetchCollection();

				await fetchContributors();

				ToastService.success(
					tText(
						'collection/components/collection-or-bundle-edit___eigenaarschap-succesvol-overgedragen'
					)
				);
			} else {
				await CollectionService.editContributorRights(
					collectionId,
					user.contributorId as string,
					newRights
				);

				await fetchContributors();

				ToastService.success(
					tText(
						'collection/components/collection-or-bundle-edit___rol-van-de-gebruiker-is-aangepast'
					)
				);
			}
		}
	} catch (err) {
		ToastService.danger(
			tText(
				'collection/components/collection-or-bundle-edit___er-liep-iets-fout-met-het-aanpassen-van-de-collega-rol'
			)
		);
	}
}

export async function onAddContributor(
	info: Partial<ContributorInfo>,
	collectionId: string,
	fetchContributors: () => void
) {
	try {
		await CollectionService.addContributor(collectionId, info);

		await fetchContributors();

		ToastService.success(
			tText(
				'collection/components/collection-or-bundle-edit___uitnodiging-tot-samenwerken-is-verstuurd'
			)
		);
	} catch (err) {
		ToastService.danger(
			tText(
				'collection/components/collection-or-bundle-edit___er-liep-iets-fout-met-het-uitnodigen-van-een-collega'
			)
		);
	}
}
