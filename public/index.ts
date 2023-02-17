import './index.scss';

import { MitreAttackPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new MitreAttackPlugin();
}
export { MitreAttackPluginSetup, MitreAttackPluginStart } from './types';
