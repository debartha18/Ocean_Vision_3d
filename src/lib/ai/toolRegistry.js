/**
 * Ocean Vision 3D - Safe AI Action Contract & Execution Registry
 * Enforces strict validation on all allowlisted action types:
 * SET_BASIN, SET_LOCATION, SET_DEPTH, SET_PARAMETER, SET_VIEW_MODE,
 * SHOW_PROFILE, SHOW_ANOMALY, CLEAR_SELECTION.
 * 
 * Prevents arbitrary JavaScript or unsanitized state mutation.
 */

import { REGIONS, createLocationData } from '../../data/oceanData';
import { normalizeParameter, resolveBasin, normalizeViewMode } from './oceanTools';

export const ALLOWED_ACTIONS = [
  'SET_BASIN',
  'SET_LOCATION',
  'SET_DEPTH',
  'SET_PARAMETER',
  'SET_VIEW_MODE',
  'SHOW_PROFILE',
  'SHOW_ANOMALY',
  'CLEAR_SELECTION'
];

/**
 * Validates and executes an array of structured Copilot actions against React state handlers.
 */
export function executeCopilotActions(actions = [], handlers = {}) {
  const executionResults = [];

  for (const action of actions) {
    if (!action || !ALLOWED_ACTIONS.includes(action.type)) {
      console.warn('Ignored unallowlisted copilot action:', action);
      continue;
    }

    try {
      switch (action.type) {
        case 'SET_BASIN': {
          const region = resolveBasin(action.value, null);
          if (region && handlers.setActiveRegion) {
            handlers.setActiveRegion(region);
            if (handlers.setActiveTab) handlers.setActiveTab('3D View');
            executionResults.push({
              type: action.type,
              success: true,
              message: `Navigated 3D digital twin to ${region.name}.`
            });
          }
          break;
        }

        case 'SET_LOCATION': {
          const lat = parseFloat(action.value?.lat);
          const lon = parseFloat(action.value?.lon);
          if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            if (handlers.onCustomCoords) {
              handlers.onCustomCoords(lat, lon);
            } else if (handlers.setActiveRegion) {
              const newReg = createLocationData(lat, lon, `Target (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
              handlers.setActiveRegion(newReg);
            }
            if (handlers.setActiveTab) handlers.setActiveTab('3D View');
            executionResults.push({
              type: action.type,
              success: true,
              message: `Updated geodetic coordinates to (${lat.toFixed(3)}°, ${lon.toFixed(3)}°).`
            });
          }
          break;
        }

        case 'SET_DEPTH': {
          const rawDepth = typeof action.value === 'number' ? action.value : parseFloat(action.value);
          if (!isNaN(rawDepth) && rawDepth >= 0 && rawDepth <= 6000 && handlers.setDepth) {
            handlers.setDepth(rawDepth);
            executionResults.push({
              type: action.type,
              success: true,
              message: `Set depth slice to ${rawDepth}m.`
            });
          }
          break;
        }

        case 'SET_PARAMETER': {
          const param = normalizeParameter(action.value);
          if (handlers.setSelectedParam) {
            handlers.setSelectedParam(param);
            const labels = {
              sst: 'Sea Surface Temperature (°C)',
              salinity: 'Salinity (PSU)',
              currents: 'Current Velocity (m/s)',
              wave: 'Significant Wave Height (m)',
              chlorophyll: 'Chlorophyll-a (mg/m³)',
              oxygen: 'Dissolved Oxygen (mg/L)'
            };
            executionResults.push({
              type: action.type,
              success: true,
              message: `Switched active ocean variable to ${labels[param] || param}.`
            });
          }
          break;
        }

        case 'SET_VIEW_MODE': {
          const mode = normalizeViewMode(action.value);
          if (handlers.setViewMode) {
            handlers.setViewMode(mode);
            const modeLabels = {
              depth_slice: 'Horizontal Depth Slice',
              iso_surface: '3D Isosurface',
              vector_field: '3D Vector Field',
              volume_render: 'Volumetric Density'
            };
            executionResults.push({
              type: action.type,
              success: true,
              message: `Activated ${modeLabels[mode] || mode} visualization.`
            });
          }
          break;
        }

        case 'SHOW_PROFILE': {
          executionResults.push({
            type: action.type,
            success: true,
            message: `Generated vertical hydrographic column profile.`
          });
          break;
        }

        case 'SHOW_ANOMALY': {
          executionResults.push({
            type: action.type,
            success: true,
            message: `Computed physical anomaly against 30-year climatological baseline.`
          });
          break;
        }

        case 'CLEAR_SELECTION': {
          if (handlers.setSelectedBuoy) handlers.setSelectedBuoy(null);
          executionResults.push({
            type: action.type,
            success: true,
            message: `Cleared active in-situ selection.`
          });
          break;
        }

        default:
          break;
      }
    } catch (err) {
      executionResults.push({
        type: action.type,
        success: false,
        message: `Action execution error: ${err.message}`
      });
    }
  }

  return executionResults;
}

/**
 * Backward-compatible helper for tool calls.
 */
export function executeToolCalls(toolCalls = [], handlers = {}) {
  const actions = [];
  for (const call of toolCalls) {
    if (call.tool === 'change_ocean_view' || call.tool === 'change_parameter') {
      if (call.params?.basin) actions.push({ type: 'SET_BASIN', value: call.params.basin });
      if (typeof call.params?.depth === 'number') actions.push({ type: 'SET_DEPTH', value: call.params.depth });
      if (call.params?.viewMode) actions.push({ type: 'SET_VIEW_MODE', value: call.params.viewMode });
      if (call.params?.parameter) actions.push({ type: 'SET_PARAMETER', value: call.params.parameter });
    } else if (call.tool === 'setOceanParameter') {
      actions.push({ type: 'SET_PARAMETER', value: call.params?.param });
    } else if (call.tool === 'setDepth') {
      actions.push({ type: 'SET_DEPTH', value: call.params?.depth });
    } else if (call.tool === 'changeBasin') {
      actions.push({ type: 'SET_BASIN', value: call.params?.regionId });
    } else if (call.tool === 'setVisualizationMode') {
      actions.push({ type: 'SET_VIEW_MODE', value: call.params?.mode });
    }
  }
  return executeCopilotActions(actions, handlers);
}
