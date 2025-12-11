// Define interfaces for Snipe-IT API responses

// Generic type for custom fields in Snipe-IT responses
type CustomFields<T = any> = {
  [key: string]: {
    field: string;
    value: T;
  };
};

// Interface for Hardware endpoint
interface Hardware {
  id: number;
  name: string;
  serial: string;
  model: string;
  manufacturer: string;
  custom_fields: CustomFields;
}

// Interface for User endpoint
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  custom_fields: CustomFields;
}

export { CustomFields, Hardware, User };