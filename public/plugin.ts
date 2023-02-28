import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  MitreAttackPluginSetup,
  MitreAttackPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';

export class MitreAttackPlugin implements Plugin<MitreAttackPluginSetup, MitreAttackPluginStart> {
  public setup(core: CoreSetup): MitreAttackPluginSetup {
    core.application.register({
      id: 'mitreAttack',
      title: PLUGIN_NAME,
      euiIconType: 'tableDensityNormal',
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./application');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });
    return {};
  }

  public start(core: CoreStart): MitreAttackPluginStart {
    return {};
  }

  public stop() {}
}
