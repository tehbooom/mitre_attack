import React, { useState, useEffect, useCallback } from 'react';
import { i18n } from '@kbn/i18n';
import { I18nProvider } from '@kbn/i18n-react';
import {
  DataPublicPluginStart,
} from '../../../../src/plugins/data/public';
import { DataViewsServicePublic } from '@kbn/data-views-plugin/public';
import { BrowserRouter as Router } from 'react-router-dom';
import { DiscoverSidebarResponsive } from './sidebar';
// import { Storage } from '@kbn/kibana-utils-plugin/public';
import { useDiscoverServices } from '../../../../src/plugins/discover/public/hooks/use_discover_services';
import {
  EuiButton,
  EuiHeader,
  EuiPage,
  EuiPageBody,
  EuiText,
  EuiFormRow,
  EuiSelect,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldText,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID } from '../../common';
// export const SIDEBAR_CLOSED_KEY = 'discover:sidebarClosed';

// const SidebarMemoized = React.memo(DiscoverSidebarResponsive);


interface MitreAttackAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export const MitreAttackApp = ({
  basename,
  notifications,
  http,
  data,
  navigation,
}: MitreAttackAppDeps) => {
  // Use React hooks to manage state.
  // const {storage} = useDiscoverServices();
  // const initialSidebarClosed = Boolean(storage.get(SIDEBAR_CLOSED_KEY));
  // const [isSidebarClosed, setIsSidebarClosed] = useState(initialSidebarClosed);
  // const toggleSidebarCollapse = useCallback(() => {
  //   storage.set(SIDEBAR_CLOSED_KEY, !isSidebarClosed);
  //   setIsSidebarClosed(!isSidebarClosed);
  // }, [isSidebarClosed, storage]);

  const [hits, setHits] = useState<Array<Record<string, any>>>()
  const onClickHandler = async () => {
    const searchSource = await data.search.searchSource.create();
    const [dataView] = await data.dataViews.find('Kibana Sample Data eCommerce')
    const searchResponse = await searchSource
      .setField('index', dataView)
      .fetch();
    setHits([searchResponse.hits.hits]);
  };

  return (
    <Router basename={basename}>
      <I18nProvider>
      <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            showSaveQuery={true}
            showFilterBar={false}
            useDefaultBehaviors={true}
          />
          <EuiHeader >
          <EuiFlexGroup>
          <EuiFlexItem>
          {/* Change to drop down menu of data views */}
            <EuiFormRow label="Dataview" helpText="Select the Data View">  
              <EuiSelect
                id="guideSelect"
                options={[
                  { value: 'Operation', text: 'Operation' },
                  { value: 'Scenario', text: 'Scenario' },
                  { value: 'Adversary', text: 'Adversary' },
                  { value: 'Job', text: 'Job' },
                ]}
                value="urmom"
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            {/* Change to on selection of index pattern scroll through available terms */}
            <EuiFormRow label="Technique Field" helpText="Field containing the attack ID">
              <EuiFieldText
                value="attack.id"
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace>
              {/* onClick Handler execute script to run a for loop over dataview, timestamp, and field to gather all attack ids (do not gather duplicates), and generate navigator layer and populate it in iframe */}
              <EuiButton>Generate Layer</EuiButton>
            </EuiFormRow>
          </EuiFlexItem>
          </EuiFlexGroup>
          </EuiHeader>
          <EuiPage >
            <EuiPageBody >
              <iframe src="https://mitre-attack.github.io/attack-navigator/enterprise/" width="100%" height="100%"></iframe>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
