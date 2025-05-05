import { useMutation } from '@tanstack/react-query';

import { EmbedCodeService } from '../embed-code-service';

export const useDeleteEmbedCode = () => {
	return useMutation(
		(embedCodeId: string): Promise<void> => EmbedCodeService.deleteEmbedCode(embedCodeId)
	);
};
