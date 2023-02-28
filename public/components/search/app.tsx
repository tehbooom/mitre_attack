/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  EuiHeader,
  EuiButton,
  EuiFlexGroup,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiComboBox,
  EuiSuperDatePicker,
  EuiFormRow,
  EuiFormLabel,
  OnRefreshProps,
  EuiFlexItem,
  OnTimeChangeProps,
} from '@elastic/eui';
import { CoreStart } from '@kbn/core/public';
import { IInspectorInfo } from '@kbn/data-plugin/common';
import {
  DataPublicPluginStart,
  IKibanaSearchResponse,
  isCompleteResponse,
  isErrorResponse,
} from '@kbn/data-plugin/public';
import { SearchResponseWarning } from '@kbn/data-plugin/public/search/types';
import type { DataView, DataViewField } from '@kbn/data-views-plugin/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { RequestAdapter } from '@kbn/inspector-plugin/common';
import { toMountPoint } from '@kbn/kibana-react-plugin/public';
import { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';
import { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import React, { useEffect, useState } from 'react';
import { lastValueFrom } from 'rxjs';
import { PLUGIN_ID, PLUGIN_NAME } from '../../../common';

interface SearchExamplesAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}

function getNumeric(fields?: DataViewField[]) {
  if (!fields) return [];
  return fields?.filter((f) => f.type === 'number' && f.aggregatable);
}

function getAggregatableStrings(fields?: DataViewField[]) {
  if (!fields) return [];
  return fields?.filter((f) => f.type === 'string' && f.aggregatable);
}

function formatFieldToComboBox(field?: DataViewField | null) {
  if (!field) return [];
  return formatFieldsToComboBox([field]);
}

function formatFieldsToComboBox(fields?: DataViewField[]) {
  if (!fields) return [];

  return fields?.map((field) => {
    return {
      label: field.displayName || field.name,
    };
  });
}

const bucketAggType = 'terms';
const metricAggType = 'median';

export const SearchExamplesApp = ({
  http,
  notifications,
  navigation,
  data,
  unifiedSearch,
}: SearchExamplesAppDeps) => {
  const { IndexPatternSelect } = unifiedSearch.ui;
  const [total, setTotal] = useState<number>(100);
  const [loaded, setLoaded] = useState<number>(0);
  const [dataView, setDataView] = useState<DataView | null>();
  const [fields, setFields] = useState<DataViewField[]>();
  const [selectedFields, setSelectedFields] = useState<DataViewField[]>([]);
  const [selectedNumericField, setSelectedNumericField] = useState<
    DataViewField | null | undefined
  >();
  const [selectedBucketField, setSelectedBucketField] = useState<
    DataViewField | null | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAbortController, setAbortController] = useState<AbortController>();
  const [request, setRequest] = useState<Record<string, any>>({});
  const [rawResponse, setRawResponse] = useState<Record<string, any>>({});
  const [warningContents, setWarningContents] = useState<SearchResponseWarning[]>([]);


  function setResponse(response: IKibanaSearchResponse) {
    setWarningContents([]);
    setRawResponse(response.rawResponse);
    setLoaded(response.loaded!);
    setTotal(response.total!);
  }

  // Fetch the default data view using the `data.dataViews` service, as the component is mounted.
  useEffect(() => {
    const setDefaultDataView = async () => {
      const defaultDataView = await data.dataViews.getDefault();
      setDataView(defaultDataView);
    };

    setDefaultDataView();
  }, [data]);

  // Update the fields list every time the data view is modified.
  useEffect(() => {
    setFields(dataView?.fields);
  }, [dataView]);
  useEffect(() => {
    setSelectedBucketField(fields?.length ? getAggregatableStrings(fields)[0] : null);
    setSelectedNumericField(fields?.length ? getNumeric(fields)[0] : null);
  }, [fields]);

  const onSearchSourceClickHandler = (
    withOtherBucket: boolean,
    showWarningToastNotifications: boolean
  ) => {
    doSearchSourceSearch(withOtherBucket, showWarningToastNotifications);
  };

  const doSearchSourceSearch = async (
    otherBucket: boolean,
    showWarningToastNotifications = true
  ) => {
    if (!dataView) return;

    const query = data.query.queryString.getQuery();
    const filters = data.query.filterManager.getFilters();
    const timefilter = data.query.timefilter.timefilter.createFilter(dataView);
    if (timefilter) {
      filters.push(timefilter);
    }

    try {
      const searchSource = await data.search.searchSource.create();

      searchSource
        .setField('index', dataView)
        .setField('filter', filters)
        .setField('query', query)
        .setField('fields', selectedFields.length ? selectedFields.map((f) => f.name) : [''])
        .setField('size', selectedFields.length ? 100 : 0)
        .setField('trackTotalHits', 100);

      const aggDef = [];
      if (selectedBucketField) {
        aggDef.push({
          type: bucketAggType,
          schema: 'split',
          params: { field: selectedBucketField.name, size: 2, otherBucket },
        });
      }
      if (selectedNumericField) {
        aggDef.push({ type: metricAggType, params: { field: selectedNumericField.name } });
      }
      if (aggDef.length > 0) {
        const ac = data.search.aggs.createAggConfigs(dataView, aggDef);
        searchSource.setField('aggs', ac);
      }
      setRequest(searchSource.getSearchRequestBody());
      setRawResponse({});
      setWarningContents([]);
      const abortController = new AbortController();

      const inspector: Required<IInspectorInfo> = {
        adapter: new RequestAdapter(),
        title: 'Example App Inspector!',
        id: 'greatest-example-app-inspector',
        description: 'Use the `description` field for more info about the inspector.',
      };

      setAbortController(abortController);
      setIsLoading(true);
      const result = await lastValueFrom(
        searchSource.fetch$({
          abortSignal: abortController.signal,
          disableShardFailureWarning: !showWarningToastNotifications,
          inspector,
        })
      );
      setRawResponse(result.rawResponse);

      /* Here is an example of using showWarnings on the search service, using an optional callback to
       * intercept the warnings before notification warnings are shown.
       *
       * Suppressing the shard failure warning notification from appearing by default requires setting
       * { disableShardFailureWarning: true } in the SearchSourceSearchOptions passed to $fetch
       */
      if (showWarningToastNotifications) {
        setWarningContents([]);
      } else {
        const warnings: SearchResponseWarning[] = [];
        data.search.showWarnings(inspector.adapter, (warning) => {
          warnings.push(warning);
          return false; // allow search service from showing this warning on its own
        });
        // click the warnings tab to see the warnings
        setWarningContents(warnings);
      }

      notifications.toasts.addSuccess(
        {
          title: 'Success!',
          text: 'See generated layer in the Navigator!',
        },
        {
          toastLifeTimeMs: 300000,
        }
      );
    } catch (e) {
      setRawResponse(e.body);
      data.search.showError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const [start, setStart] = useState('now-30m');

  const [end, setEnd] = useState('now');
  
  const onTimeChange = ({ start, end }: OnTimeChangeProps) => {
    setStart(start);
    setEnd(end);
    setIsLoading(true);
    startLoading();
  };
    
  const startLoading = () => {
    setTimeout(stopLoading, 1000);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  const onRefresh = ({ start, end, refreshInterval }: OnRefreshProps) => {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    }).then(() => {
      console.log(start, end, refreshInterval);
    });
  };

  return (
    <div>
      <EuiFlexGroup gutterSize='m'>
        <EuiFlexItem  >
          <IndexPatternSelect
            placeholder={i18n.translate('searchSessionExample.selectDataViewPlaceholder', {
              defaultMessage: 'Select data view',
            })}
            indexPatternId={dataView?.id || ''}
            onChange={async (dataViewId?: string) => {
              if (dataViewId) {
                const newDataView = await data.dataViews.get(dataViewId);
                setDataView(newDataView);
              } else {
                setDataView(undefined);
              }
            }}
            isClearable={false}
            data-test-subj="dataViewSelector"
          />
        </EuiFlexItem>
        <EuiFlexItem  >
          <EuiComboBox
            options={formatFieldsToComboBox(getAggregatableStrings(fields))}
            selectedOptions={formatFieldToComboBox(selectedBucketField)}
            singleSelection={true}
            onChange={(option) => {
              if (option.length) {
                const fld = dataView?.getFieldByName(option[0].label);
                setSelectedBucketField(fld || null);
              } else {
                setSelectedBucketField(null);
              }
            }}
            sortMatchesBy="startsWith"
            data-test-subj="searchBucketField"
          />
        </EuiFlexItem>
        <EuiFlexItem  >
          <EuiButton
              color="primary"
              fill
              onClick={() => onSearchSourceClickHandler(true, true)}
            >
              Generate Layer
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem  >
          <EuiSuperDatePicker
            isLoading={isLoading}
            start={start}
            end={end}
            onTimeChange={onTimeChange}
            onRefresh={onRefresh}
            width="auto"
            showUpdateButton={false}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
    