import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  MitreAttackPluginSetup,
  MitreAttackPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME, PLUGIN_ID } from '../common';

export class MitreAttackPlugin implements Plugin<MitreAttackPluginSetup, MitreAttackPluginStart> {
  public setup(core: CoreSetup): MitreAttackPluginSetup {
    const mitreLogo: string = `${core.http.basePath.get()}/plugins/${PLUGIN_ID}/assets/`;

    core.application.register({
      id: 'mitreAttack',
      title: PLUGIN_NAME,
      euiIconType: 'logoKibana',
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): MitreAttackPluginStart {
    return {};
  }

  public stop() {}
}
