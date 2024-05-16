import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event'
import Map from '../src/components/+map.svelte';

beforeEach(async () => {
    await render(Map);
});

// Heatmaps
describe("Solar map rendering", () => {
    test("Check if heatmap and legend for solar irradiance renders", () => {
        const worldMap = screen.getByRole('application').querySelector('svg');
        waitFor(async () => {
            const solarMap = document.querySelector('#Solarmap');
            const solarMapLegend = document.querySelector('#Solarmap-legend');
            expect(worldMap).toContain(solarMap);
            expect(worldMap).toContain(solarMapLegend);
        });
    });
});
 
describe("Wind map rendering", () => {
    test("Check if heatmap and legend for wind speed renders", () => {
        const worldMap = screen.getByRole('application').querySelector('svg');
        waitFor(async () => {
            const windMap = document.querySelector('#Windmap');
            const windMapLegend = document.querySelector('#Windmap-legend');
            expect(worldMap).toContain(windMap);
            expect(worldMap).toContain(windMapLegend);
        });
    });
});

describe("Switching heatmaps", () => {
    test("Heatmap switches on mode click", () => {
        const modeButtons = screen.getByRole('application').querySelectorAll("button");
        waitFor(async () => {
            const windMap = document.querySelector('#Windmap');
            const solarMap = document.querySelector('#Solarmap');

            userEvent.click(modeButtons[1]);
            expect(windMap?.classList.contains('hidden')).toBe(false);
            expect(solarMap?.classList.contains('hidden')).toBe(true);

            userEvent.click(modeButtons[0]);
            expect(solarMap?.classList.contains('hidden')).toBe(false);
            expect(windMap?.classList.contains('hidden')).toBe(true);
        });
    });
});

// Map interactions
describe("Clicking on country", () => {
    test("Clicking on country highlights the country selected", () => {
        const worldMap = screen.getByRole('application').querySelector('svg');
        const countries = worldMap?.querySelectorAll('country');
        countries?.forEach(country => {
            userEvent.click(country);
            expect(country.classList.contains('highlight')).toBe(true);
        });
    });
});

describe("Exiting country selection (ESC)", () => {
    test("Pressing ESC exits country selection", () => {
        render(Map);
        const worldMap = screen.getByRole('application').querySelector('svg');
        const countries = worldMap?.querySelectorAll('country');    
        expect(countries).not.toBeNull()
        if (countries) {
            expect(countries.length).toBeGreaterThan(0);
            userEvent.click(countries[0]); 
            userEvent.keyboard('{Escape}')
            expect(countries[0].classList.contains('highlight')).toBe(false);
        }
    });
});

