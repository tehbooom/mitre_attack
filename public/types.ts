import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '@kbn/data-plugin/public';

export interface MitreAttackPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MitreAttackPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart
}
