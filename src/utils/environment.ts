interface EnvironmentValidation {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

export function validateEnvironment(): EnvironmentValidation {
  const requiredEnvVars = [
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_FIREBASE_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);
  const errors: string[] = [];

  if (missingVars.length > 0) {
    errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate Google Maps API key format
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (mapsApiKey && !mapsApiKey.startsWith('AIza')) {
    errors.push('Invalid Google Maps API key format');
  }

  return {
    isValid: errors.length === 0,
    missingVars,
    errors,
  };
}

export function getEnvironmentErrors(): string[] {
  const { errors } = validateEnvironment();
  return errors;
}

export function isEnvironmentValid(): boolean {
  return validateEnvironment().isValid;
} 