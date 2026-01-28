import { allure } from 'allure-playwright';

// Global setup for Allure reporting
beforeAll(async () => {
  allure.epic('CosmicForge Testing');
  allure.feature('Game Mechanics');
});

// Helper to add steps to Allure reports
global.allureStep = (name, fn) => {
  return allure.step(name, fn);
};
