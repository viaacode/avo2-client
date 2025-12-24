import { createRoot } from 'react-dom/client';

import { EmbedRoot } from './EmbedApp';

createRoot(document.getElementById('embed-root') as HTMLDivElement).render(<EmbedRoot />);
