import { get } from 'svelte/store';
import { countryStore, tooltipToggler, sidepanelToggler, countryContentStore, xStore, yStore} from '../store/mapStore';
import { twoLetterCountryCodes, threeLetterCountryCodes } from './countryCodes';
import { zoomToCountry } from './zoom';
import { viewBox, svgElement } from '../components/+map.svelte';
import { count } from 'd3';

export let tooltipContent: string = '';
export let countries: Set<string> = new Set<string>();
export let current_selected: string = '';

export function handleFormSubmit(event: Event) {
    console.log(get(countryStore));
    event.preventDefault();
    updateHighlights();
}

function toggleSidePanel(country: string, content: string): void {
    console.log(countries);
    if (!get(sidepanelToggler) || country !== get(countryStore)) {
        sidepanelToggler.set(true);
        countryContentStore.set(content);
    }
    else {
        sidepanelToggler.set(false);
    }
}

function updateHighlights() {
    // Remove highlights from all countries
    const groups = document.querySelectorAll('svg g');

    groups.forEach(g => {
        g.querySelectorAll('path').forEach(path => {
            path.classList.remove('highlight');
        });
    });

    // Add highlight to correct country if there is one and toggle sidepanel
    groups.forEach(g => {
        let translatedCountry = translateCountry(get(countryStore));

        if (translatedCountry === undefined) {
            return;
        }
        const paths = g.querySelectorAll('path');
        if (g.id.toLowerCase() === translatedCountry.toLowerCase()) {
            // console.log(g.id)
            // toggleSidePanel(g.id);
            zoomToCountry(svgElement, viewBox, g.id)
            paths.forEach(path => {
                path.classList.add('highlight');
            });
        }
    });
}

export function countriesTest(input: string): Set<string> {
    let countrySet: Set<string> = new Set<string>;
    let lowerInput = input.toLowerCase();
    
    for (const country of countries) {
        if (country.toLowerCase().startsWith(lowerInput)) {
            countrySet.add(country); // Add the matched country from the set to list
        }
    }

    const regex = new RegExp(lowerInput, 'i'); // Create case-insensitive regex pattern from input
    for (const country of countries) {
        if (regex.test(country.toLowerCase())) {
            countrySet.add(country); // Return the matched country from the set
        }
    }
    
    return countrySet;
}

function translateCountry(input: string): string | undefined {
    // let upperInput = input.toUpperCase(); 

    // // Check if input is two letter country code
    // if (upperInput in twoLetterCountryCodes) {
    //     return twoLetterCountryCodes[upperInput];
    // }

    // // Check if inut is three letter country code
    // if (upperInput in threeLetterCountryCodes) {
    //     return threeLetterCountryCodes[upperInput];
    // }

    let lowerInput = input.toLowerCase(); // Convert input to lowercase for case-insensitive comparison
    
    // First check if input matches the start of any country string
    for (const country of countries) {
        if (country.toLowerCase().startsWith(lowerInput)) {
            return country; // Return the matched country from the set
        }
    }

    // If no match found at the start, use regex to find matches anywhere within country strings
    const regex = new RegExp(lowerInput, 'i'); // Create case-insensitive regex pattern from input
    for (const country of countries) {
        if (regex.test(country.toLowerCase())) {
            return country; // Return the matched country from the set
        }
    }

    return undefined; // Return undefined if no match is found
}

export function initializeCountryMap() {
    const groups = document.querySelectorAll("svg g");
    let arr: string[] = new Array();
    groups.forEach(g => {
        arr.push(g.id)        
    })
    arr.sort();
    countries = new Set(arr);
}

export function setupMapInteractions(svgElement : SVGSVGElement) {
    svgElement.addEventListener('mouseover', handleMouseOver);
    svgElement.addEventListener('mousemove', handleMouseMove);
    svgElement.addEventListener('mouseout', handleMouseOut);
    svgElement.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscapeDown);
    document.addEventListener('click', handleClickOnSite);

    function handleMouseOver(event: MouseEvent) {
        if (event.target) {
            const target = event.target as Element;
            const closestGroup = target.closest('g');
            if (closestGroup) {
                tooltipToggler.set(true);
                tooltipContent = closestGroup.id;
            }
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (tooltipToggler) {
            let tooltipX = event.pageX < window.innerWidth - 100 ? event.pageX + 10 : event.pageX - 35;
            let tooltipY = event.pageY - 25;
            xStore.set(tooltipX);
            yStore.set(tooltipY);
        }
    }

    function handleMouseOut() {
        tooltipToggler.set(false);
    }

    async function handleClick(event: MouseEvent) {
        if (event.target) {
            const target = event.target as Element;
            const closestGroup = target.closest('g');
            if (closestGroup) {
                tooltipToggler.set(!get(tooltipToggler));
                const response = await fetch(`http://127.0.0.1:5000/${closestGroup.id}`);
                current_selected = await response.text();
                toggleSidePanel(closestGroup.id ,current_selected);
            }
        }
    }

    function handleEscapeDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            sidepanelToggler.set(false);
        }
    }

    function handleClickOnSite(event: MouseEvent) {
        const target = event.target as Element | null;
        if (!target?.closest('g')) {
            if (get(sidepanelToggler)) {
                sidepanelToggler.set(false);
            }
        }
    }

    return () => {
        svgElement.removeEventListener('mouseover', handleMouseOver);
        svgElement.removeEventListener('mousemove', handleMouseMove);
        svgElement.removeEventListener('mouseout', handleMouseOut);
        svgElement.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleEscapeDown);
        document.removeEventListener('click', handleClickOnSite);
    };
}