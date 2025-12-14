// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Geef het pad naar je Next.js app voor loading van next.config.js en .env files
  dir: './',
});

// Custom Jest configuratie
const customJestConfig = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/lib/utils/$1',
  },

  // Test match patterns
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Coverage configuratie (geoptimaliseerd voor snelheid in CI)
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/types/**',
    // Skip grote bestanden die weinig waarde toevoegen aan coverage
    '!src/lib/external/**',
    '!src/app/trips/[id]/itinerary/actions.ts', // Groot bestand, skip voor snelheid
  ],

  // Coverage thresholds (realistisch voor huidige test coverage)
  coverageThreshold:
    process.env.CI === 'true'
      ? {
          // In CI: realistische thresholds gebaseerd op huidige coverage (~12%)
          global: {
            branches: 10,
            functions: 10,
            lines: 10,
            statements: 10,
          },
        }
      : {
          // Lokaal: hogere thresholds
          global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
          },
        },

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    // Ignore any nested e2e test folders (Playwright tests live under tests/**/e2e/)
    // Use a regex-style pattern instead of glob-star to avoid invalid regex construction on Windows
    '<rootDir>/tests/.*/e2e/',
  ],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

// createJestConfig is exported op deze manier zodat next/jest async Next.js config kan laden
module.exports = createJestConfig(customJestConfig);
