import { useMutation } from '@tanstack/react-query';

import { EmbedCodeService } from '../embed-code-service';
import { type EmbedCode } from '../embed-code.types';

export const useUpdateEmbedCode = () => {
	return useMutation(
		(embedCode: EmbedCode): Promise<void> => EmbedCodeService.updateEmbedCode(embedCode)
	);
};
