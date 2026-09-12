/**
 * Ocean Vision 3D - Copilot & Nerida Agent Type Definitions
 * Strict TypeScript interfaces for application state, tools, actions, and messages.
 */

export type OceanParameter = 'sst' | 'salinity' | 'currents' | 'wave' | 'chlorophyll' | 'oxygen';

export type OceanViewMode = 'surface' | 'depth_slice' | 'volume' | 'volume_render' | 'isosurface' | 'iso_surface' | 'vector_field';

export type CopilotActionType = 
  | 'SET_BASIN'
  | 'SET_LOCATION'
  | 'SET_DEPTH'
  | 'SET_PARAMETER'
  | 'SET_VIEW_MODE'
  | 'SHOW_PROFILE'
  | 'SHOW_ANOMALY'
  | 'CLEAR_SELECTION';

export interface CopilotAction {
  type: CopilotActionType;
  value?: any;
  label?: string;
}

export interface OceanState {
  basin: string;
  basinId: string;
  latitude: number;
  longitude: number;
  depth: number;
  parameter: OceanParameter;
  viewMode: OceanViewMode;
  timestamp: string;
  surfaceSST: number;
  surfaceSalinity: number;
  waveHeight: number;
  currentSpeed: number;
  stormCategory?: string;
  stormProbability?: number;
  windSpeedKmH?: number;
}

export interface StructuredOceanData {
  success: boolean;
  parameter: OceanParameter;
  parameterName: string;
  location: string;
  coordinates?: string;
  depth: number;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
}

export interface BasinComparisonData {
  parameter: OceanParameter;
  parameterName: string;
  depth: number;
  unit: string;
  basin1: {
    id: string;
    name: string;
    value: number;
  };
  basin2: {
    id: string;
    name: string;
    value: number;
  };
  difference: number;
  higherBasin: string;
  scientificRationale: string;
}

export interface OceanProfileData {
  location: string;
  parameter: OceanParameter;
  parameterName: string;
  unit: string;
  depths: number[];
  values: number[];
  thermoclineDepth?: string;
  haloclineDepth?: string;
}

export interface OceanAnomalyData {
  location: string;
  parameter: OceanParameter;
  parameterName: string;
  depth: number;
  currentValue: number;
  baseline: number;
  anomaly: number;
  severity: 'NOMINAL' | 'LOW' | 'MODERATE' | 'CRITICAL';
  unit: string;
  confidence?: string;
}

export interface ToolResult {
  tool: string;
  status: 'executing' | 'success' | 'error';
  indicator: string;
  result?: any;
  error?: string;
}

export interface CopilotProvenance {
  type: 'OBSERVED' | 'FORECAST' | 'SIMULATED' | 'AI-DERIVED';
  label: string;
}

export interface CopilotMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  actions?: CopilotAction[];
  toolResults?: ToolResult[];
  data?: StructuredOceanData | BasinComparisonData | OceanProfileData | OceanAnomalyData | null;
  suggestions?: string[];
  provenance?: CopilotProvenance[];
  dataPointsUsed?: string[];
}

export interface CopilotRequest {
  message: string;
  oceanState: OceanState;
  conversationHistory: CopilotMessage[];
  language?: string;
}

export interface CopilotResponse {
  message: string;
  actions: CopilotAction[];
  toolResults: ToolResult[];
  data?: any;
  suggestions: string[];
  provenance: CopilotProvenance[];
  dataPointsUsed: string[];
  source?: 'cloud' | 'offline';
}
