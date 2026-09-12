/**
 * Ocean Vision 3D - Safe AI Tool Registry & Action Dispatcher
 * Maps validated LLM tool calls directly to React state handlers with strict parameter bounds.
 * Prevents arbitrary execution and provides user-friendly status pills for executed actions.
 */

import { REGIONS, createLocationData } from '../../data/oceanData';

export const VALID_PARAMETERS = ['sst', 'salinity', 'currents', 'wave', 'chlorophyll', 'oxygen'];
export const VALID_VIEW_MODES = ['depth_slice', 'iso_surface', 'vector_field', 'volume_render'];
export const VALID_MODALS = [
  'alerts', 
  'fleet', 
  'location', 
  'datePicker', 
  'stormNews', 
  'analyticReport', 
  'depthPressure', 
  'colorbarSettings', 
  'netcdfIngestion'
];

/**
 * Executes an array of tool calls safely against the application's state handlers.
 * Returns an array of execution result objects for display in the UI.
 */
export function executeToolCalls(toolCalls = [], handlers = {}) {
  const results = [];

  for (const call of toolCalls) {
    const { tool, params = {} } = call;
    try {
      switch (tool) {
        case 'setOceanParameter': {
          const param = params.param?.toLowerCase();
          if (VALID_PARAMETERS.includes(param) && handlers.setSelectedParam) {
            handlers.setSelectedParam(param);
            const labels = {
              sst: 'Sea Surface Temperature (°C)',
              salinity: 'Salinity (PSU)',
              currents: 'Current Velocity (m/s)',
              wave: 'Significant Wave Height (m)',
              chlorophyll: 'Chlorophyll-a (mg/m³)',
              oxygen: 'Dissolved Oxygen (mg/L)'
            };
            results.push({
              tool,
              success: true,
              message: `Switched active layer to ${labels[param] || param}.`
            });
          } else {
            results.push({
              tool,
              success: false,
              message: `Invalid parameter '${params.param}'. Valid options: ${VALID_PARAMETERS.join(', ')}`
            });
          }
          break;
        }

        case 'setDepth': {
          const rawDepth = typeof params.depth === 'number' ? params.depth : parseFloat(params.depth);
          if (!isNaN(rawDepth) && rawDepth >= 0 && rawDepth <= 2000 && handlers.setDepth) {
            handlers.setDepth(rawDepth);
            results.push({
              tool,
              success: true,
              message: `Adjusted 3D depth slice to ${rawDepth} meters.`
            });
          } else {
            results.push({
              tool,
              success: false,
              message: `Depth must be between 0m and 2000m.`
            });
          }
          break;
        }

        case 'changeBasin': {
          const regionKey = params.regionId?.toLowerCase()?.replace(/\s+/g, '_');
          if (REGIONS[regionKey] && handlers.setActiveRegion) {
            handlers.setActiveRegion(REGIONS[regionKey]);
            if (handlers.setActiveTab) handlers.setActiveTab('3D View');
            results.push({
              tool,
              success: true,
              message: `Navigated workstation to ${REGIONS[regionKey].name}.`
            });
          } else {
            results.push({
              tool,
              success: false,
              message: `Unknown basin '${params.regionId}'. Available: Bay of Bengal, Arabian Sea, South China Sea, Equatorial Pacific, North Atlantic, Gulf of Mexico.`
            });
          }
          break;
        }

        case 'setCustomCoords': {
          const lat = parseFloat(params.lat);
          const lon = parseFloat(params.lon);
          if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            if (handlers.onCustomCoords) {
              handlers.onCustomCoords(lat, lon);
            } else if (handlers.setActiveRegion) {
              const newReg = createLocationData(lat, lon, params.name || `Target (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
              handlers.setActiveRegion(newReg);
            }
            if (handlers.setActiveTab) handlers.setActiveTab('3D View');
            results.push({
              tool,
              success: true,
              message: `Repositioned digital twin to coordinates (${lat.toFixed(3)}°, ${lon.toFixed(3)}°).`
            });
          } else {
            results.push({
              tool,
              success: false,
              message: `Invalid coordinates: Latitude must be [-90, 90], Longitude [-180, 180].`
            });
          }
          break;
        }

        case 'setVisualizationMode': {
          const mode = params.mode?.toLowerCase();
          if (VALID_VIEW_MODES.includes(mode) && handlers.setViewMode) {
            handlers.setViewMode(mode);
            const modeLabels = {
              depth_slice: 'Horizontal Depth Slice',
              iso_surface: '3D Isosurface',
              vector_field: '3D Vector Field',
              volume_render: 'Volumetric Density'
            };
            results.push({
              tool,
              success: true,
              message: `Changed 3D visualization to ${modeLabels[mode] || mode}.`
            });
          } else {
            results.push({
              tool,
              success: false,
              message: `Unknown visualization mode '${params.mode}'.`
            });
          }
          break;
        }

        case 'setStormLayer': {
          const active = params.active === true || params.active === 'true' || params.enabled === true;
          if (handlers.setIsStormLayerActive) {
            handlers.setIsStormLayerActive(active);
            results.push({
              tool,
              success: true,
              message: `${active ? 'Activated' : 'Deactivated'} Storm & Rain Threat Radar layer.`
            });
          }
          break;
        }

        case 'openModal': {
          const modal = params.modalName;
          const modalMap = {
            alerts: handlers.setIsAnomalyModalOpen,
            fleet: handlers.setIsFleetModalOpen,
            location: handlers.setIsLocationModalOpen,
            datePicker: handlers.setIsDatePickerModalOpen,
            stormNews: handlers.setIsStormNewsModalOpen,
            analyticReport: handlers.setIsAnalyticReportOpen,
            depthPressure: handlers.setIsDepthPressureOpen,
            colorbarSettings: handlers.setIsColorbarSettingsOpen,
            netcdfIngestion: handlers.setIsNetcdfIngestionOpen
          };

          if (modalMap[modal]) {
            modalMap[modal](true);
            results.push({
              tool,
              success: true,
              message: `Opened modal dialog: ${modal}.`
            });
          } else {
            results.push({
              tool,
              success: false,
              message: `Modal '${modal}' not recognized.`
            });
          }
          break;
        }

        case 'generateOceanBrief': {
          if (handlers.setIsAnalyticReportOpen) {
            handlers.setIsAnalyticReportOpen(true);
            results.push({
              tool,
              success: true,
              message: `Generated and launched Oceanographic Telemetry & Digital Twin Dossier.`
            });
          }
          break;
        }

        default:
          results.push({
            tool,
            success: false,
            message: `Tool '${tool}' is not registered.`
          });
      }
    } catch (err) {
      results.push({
        tool,
        success: false,
        message: `Execution failed: ${err.message}`
      });
    }
  }

  return results;
}
