// Define the BrandingConfig interface
export interface BrandingConfig {
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
const config: BrandingConfig = {
  institutionName: "SIUE Mass Communications",
  logoUrl: "https://example.com/logo.png", // Replace with the actual logo URL
  supportEmail: "support@siue.edu", // Replace with the actual support email
  theme: {
    primary: "#e31837", // SIUE Red
    secondary: "#ffffff", // Default white
    accent: "#000000" // Default black
  }
};

export default config;