import { useMutation } from '@tanstack/react-query';

import { EmbedCodeService } from '../embed-code-service.js';
import { type EmbedCode } from '../embed-code.types.js';

export const useUpdateEmbedCode = () => {
	return useMutation(
		(embedCode: EmbedCode): Promise<void> => EmbedCodeService.updateEmbedCode(embedCode)
	);
};
