import { oracle } from '../sveltekit_app/src/scripts/oracleTest';
import { translateCountry, countries } from '../sveltekit_app/src/scripts/mapInteractions';
import { twoLetterCountryCodes, threeLetterCountryCodes } from '../sveltekit_app/src/scripts/countryCodes';

// Describe the test suite for the oracle function
describe('oracle', () => {
  // Test case to check if the oracle function returns true
  it('returns true', () => {
    // Call the oracle function and expect it to return true
    expect(oracle()).toBe(true);
  });
});

describe('HAHAHA', () => {
  it('should pass', () => {
    expect(translateCountry("CHL")).toBe("Chile");
  });
});