// Global setup for Allure reporting
beforeAll(async () => {
  // Add global test metadata
});

// Helper to add steps to Allure reports
global.allureStep = (name, fn) => {
  return fn();
};

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    try {
      return JSON.stringify(String(value));
    } catch {
      return '"[unserializable]"';
    }
  }
}

global.smokeStep = async (name, fn, meta = {}) => {
  const start = Date.now();
  const input = Object.prototype.hasOwnProperty.call(meta, 'input') ? meta.input : undefined;
  console.log(`[SMOKE_STEP_START] ${name} input=${safeStringify(input)}`);

  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    const output = Object.prototype.hasOwnProperty.call(meta, 'output') ? meta.output : result;
    console.log(
      `[SMOKE_STEP_END] ${name} durationMs=${durationMs} output=${safeStringify(output)}`
    );
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    console.log(
      `[SMOKE_STEP_FAIL] ${name} durationMs=${durationMs} error=${safeStringify({ message: error?.message, stack: error?.stack })}`
    );
    throw error;
  }
};
