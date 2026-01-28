// Global setup for Allure reporting
beforeAll(async () => {
  // Add global test metadata
});

// Helper to add steps to Allure reports
global.allureStep = (name, fn) => {
  return fn();
};
