// Define the BrandingConfig interface
export interface BrandingConfig {
  departmentName: string;
  institutionName: string;
  logoUrl: string;
  supportEmail: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Default configuration object
export const brandingConfig: BrandingConfig = {
  departmentName: "The Cage",
  institutionName: "SIUE Mass Communications",
  logoUrl: "https://example.com/logo.png", // Replace with the actual logo URL
  supportEmail: "aleith@siue.edu", // Temporary support contact until dedicated address is set up
  theme: {
    primary: "#e31837", // SIUE Red
    secondary: "#ffffff", // Default white
    accent: "#000000" // Default black
  }
};

export default brandingConfig;