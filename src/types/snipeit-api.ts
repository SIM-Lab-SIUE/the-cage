// src/types/snipeit-api.ts

/**
 * Snipe-IT API Type Definitions
 * Based on official Snipe-IT API documentation
 * Matches real API response structure
 */

export interface SnipeITStatusLabel {
  id: number;
  name: string;
  status_type: 'pending' | 'deployable' | 'deleted' | 'archived' | 'undeployable';
}

export interface SnipeITCategory {
  id: number;
  name: string;
  category_type: 'asset' | 'accessory' | 'consumable' | 'component' | 'license';
}

export interface SnipeITCompany {
  id: number;
  name: string;
}

export interface SnipeITManufacturer {
  id: number;
  name: string;
}

export interface SnipeITModel {
  id: number;
  name: string;
}

export interface SnipeITLocation {
  id: number;
  name: string;
}

export interface SnipeITUser {
  id: number;
  name: string;
  email: string;
  username: string;
  employee_num?: string;
}

export interface SnipeITCustomField {
  field: string;
  value: string | number | boolean | null;
}

export interface SnipeITAsset {
  id: number;
  name: string;
  asset_tag: string;
  serial: string | null;
  model: SnipeITModel | null;
  model_number?: string;
  status_label: SnipeITStatusLabel;
  category: SnipeITCategory;
  manufacturer: SnipeITManufacturer | null;
  company: SnipeITCompany | null;
  location: SnipeITLocation | null;
  assigned_to?: SnipeITUser | null;
  purchase_date?: string | null;
  purchase_cost?: string | null;
  custom_fields: Record<string, SnipeITCustomField>;
  created_at: SnipeITTimestamp;
  updated_at: SnipeITTimestamp;
}

export interface SnipeITTimestamp {
  datetime: string;
  formatted: string;
}

export interface SnipeITCheckoutResponse {
  status: 'success' | 'error';
  messages?: string[];
  payload?: SnipeITAsset;
}

export interface SnipeITCheckinResponse {
  status: 'success' | 'error';
  messages?: string[];
  payload?: SnipeITAsset;
}

export interface SnipeITPaginatedResponse<T> {
  total: number;
  rows: T[];
  per_page: number;
  current_page: number;
}

export interface SnipeITHardwareListResponse extends SnipeITPaginatedResponse<SnipeITAsset> {}
