import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '@kbn/data-plugin/public';
import { UnifiedSearchPublicPluginStart } from '../../../src/plugins/unified_search/public'

export interface MitreAttackPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MitreAttackPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}
