import React, { useState, useEffect, useCallback } from 'react';
import { i18n } from '@kbn/i18n';
import { I18nProvider } from '@kbn/i18n-react';
import {
  DataPublicPluginStart,
} from '../../../../src/plugins/data/public';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageSection,
  EuiAutoSizer,
  EuiPanel,
  logicalSizeCSS,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { UnifiedSearchPublicPluginStart } from '../../../../src/plugins/unified_search/public'
import { SearchExamplesApp } from './search/app';

interface MitreAttackAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
  data: DataPublicPluginStart;
}

export const MitreAttackApp = ({
  basename,
  notifications,
  http,
  data,
  navigation,
  unifiedSearch,
}: MitreAttackAppDeps) => {

  const containerStyles = css`
    ${logicalSizeCSS('100%', '1000px')}
  `;

  const panelStyles = css`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  `;


  return (
    <Router basename={basename}>
      <I18nProvider>
        <>  
          <EuiPageHeader 
            pageTitle="MITRE ATT&CK Navigator"
            iconType="logoKibana"
            description='Select the Data View, Attack ID field, and the time frame of the operation, scenario or advesary. Then press "Generate Layer" to populate the Navigator with a new layer.'
            paddingSize='m'
          >
          </EuiPageHeader>
          <EuiPage>
            <EuiPageBody>
              <EuiPageSection
                color='subdued'
              >
                <SearchExamplesApp
                  notifications={notifications}
                  navigation={navigation}
                  data={data}
                  http={http}
                  unifiedSearch={unifiedSearch}
                />
              </EuiPageSection>
              < div css={containerStyles}>
                <EuiAutoSizer>
                  {({ height, width }) => (
                    <EuiPanel paddingSize="s" css={[panelStyles, { height, width }]}>
                        <iframe src="https://mitre-attack.github.io/attack-navigator/enterprise/" width="100%" height="100%"></iframe>
                    </EuiPanel>
                  )}
                </EuiAutoSizer>
              </div>                  
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
