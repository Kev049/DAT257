<script lang="ts">
    import { handleFormSubmit, translateCountry, translateCountries } from "../scripts/mapInteractions";
    import { countryStore } from '../store/mapStore';

    let svgElement : SVGSVGElement;
    let searchBar: HTMLInputElement | null;

    let selectedCountry : string = $countryStore;
    let autocompleteSuggestions: Set<string> = new Set<string>;
    let showDropdown = false;

    function updateCountry(event: Event) {
        const input = event.target as HTMLInputElement;
        selectedCountry = input.value;
        countryStore.set(selectedCountry);

        autocompleteSuggestions = translateCountries($countryStore);
        showDropdown = autocompleteSuggestions.size > 0 && selectedCountry.length > 0;
    }

    // Updates store variable and search bar text
    function updateSearch(country: string) {
        // Remove space before a parenthesis and everything in the parenthesis
        const cleanedCountry = country.replace(/\s*\(.*?\)/, '');
        $countryStore = cleanedCountry;

        if (searchBar !== null) {
            searchBar.value = cleanedCountry;
        }
    }

    function fillSearchBar() {
        console.log("HELLO BITCH");
        if (searchBar === null) {
            return;
        }

        const country = translateCountry($countryStore);
        if (country !== undefined) {
            searchBar.value = country;
        }
    }


    // Function to bold the matched part of the suggestion
    function boldMatch(input: string, selectedCountry: string): string {
        const index = input.toLowerCase().indexOf(selectedCountry.toLowerCase());
        
        if (index === -1) {
            return boldParentheses(input, selectedCountry);
        }

        const endIndexOfMatch = index + selectedCountry.length;

        const beforeMatch = input.substring(0, index);
        const matchedPart = input.substring(index, endIndexOfMatch);
        const afterMatch = input.substring(endIndexOfMatch);

        const resultWithMatchBolded = `${beforeMatch}<strong>${matchedPart}</strong>${afterMatch}`;
        return boldParentheses(resultWithMatchBolded, selectedCountry);
    }

    function boldParentheses(text: string, selectedCountry: string): string {
        const regex = new RegExp(`\\(([^)]+)\\)`, 'g');
        return text.replace(regex, (match, p1) => {
            if (p1.toLowerCase() === selectedCountry.toLowerCase()) {
                return `(<strong>${p1}</strong>)`;
            }
            return match;
        });
    }

</script>

<nav class="w-full h-20 lg:h-24 grid grid-cols-3 bg-white border-4 border-[#333333]">
    <div class="flex justify-start pl-16 items-center m-0 font-ubuntu text-black text-4xl max-h-full gap-2">
        know your energy
    </div>
    <div class="flex justify-center items-center m-0 text-white text-4xl font-dosis">
        <form class="relative w-full flex max-h-full" on:submit="{handleFormSubmit}" on:submit={() => fillSearchBar()} on:submit={() => showDropdown = false}>
            <input type="search" bind:this={searchBar} bind:value={selectedCountry} on:input="{updateCountry}" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 outline-none font-dosis" placeholder="Search countries, continents..." required />
            <button type="submit" class="absolute border-2 right-2 top-2 text-white bg-[#323638] hover:opacity-[75%] focus:ring-4 focus:outline-none font-dosis rounded-lg text-sm px-4 py-2 ">Search</button>
            {#if showDropdown}
                <ul class="absolute top-11 z-10 bg-white w-full mt-2 rounded-lg border border-gray-300">
                    {#each autocompleteSuggestions as suggestion}
                    <button class="block w-full text-left px-4 py-2 focus:outline-none hover:bg-gray-100 text-black text-4xl font-dosis border-t border-b" on:click={() => updateSearch(suggestion)}  on:click={handleFormSubmit} on:click={() => showDropdown=false}>
                        {@html boldMatch(suggestion, selectedCountry)}
                    </button>
                    {/each}
                </ul>
            {/if}
        </form>
    </div>
</nav>