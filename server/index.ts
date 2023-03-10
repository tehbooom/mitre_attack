import { PluginInitializerContext } from '../../../src/core/server';
import { MitreAttackPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new MitreAttackPlugin(initializerContext);
}

export { MitreAttackPluginSetup, MitreAttackPluginStart } from './types';
