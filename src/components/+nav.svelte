<script lang="ts">
    import { handleFormSubmit, countriesTest } from "../scripts/mapInteractions";
    import { countryStore } from '../store/mapStore';
    let svgElement : SVGSVGElement;

    let selectedCountry : string = $countryStore;
    let autocompleteSuggestions: Set<string> = new Set<string>;
    let showDropdown = false;

    function updateCountry(event: Event) {
        const input = event.target as HTMLInputElement;
        countryStore.set(input.value);

        autocompleteSuggestions = countriesTest($countryStore);
        showDropdown = autocompleteSuggestions.size > 0 && selectedCountry.length > 0;
    }

    function selectSuggestion(suggestion: string) {
        $countryStore = suggestion;
        console.log("in selectSuggestion, " + $countryStore);
        showDropdown = false; // Hide dropdown after selection
    }


    // Function to bold the matched part of the suggestion
    function boldMatch(input: string, selectedCountry: string): string {
        const index = input.toLowerCase().indexOf(selectedCountry.toLowerCase());
        const endIndexOfMatch = index + selectedCountry.length;

        const beforeMatch = input.substring(0, index);
        const matchedPart = input.substring(index, endIndexOfMatch);
        const afterMatch = input.substring(endIndexOfMatch);

    return `${beforeMatch}<strong>${matchedPart}</strong>${afterMatch}`;
}

</script>

<nav class="w-full h-20 lg:h-24 grid grid-cols-3 bg-[#323638]">
    <div class="flex justify-start pl-16 items-center m-0 font-dosis text-white text-2xl max-h-full gap-2">
        <img src="/logo.png" alt="logo" class="max-w-full max-h-full object-contain h-[75px]">
        reKnewable
    </div>
    <div class="flex justify-center items-center m-0 text-white text-4xl font-dosis">
        <form class="relative w-full flex max-h-full" on:submit="{handleFormSubmit}">
            <input type="search" bind:value={selectedCountry} on:input="{updateCountry}" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 outline-none font-dosis" placeholder="Search countries, continents..." required />
            <button type="submit" class="absolute border-2 right-2 top-2 text-white bg-[#323638] hover:opacity-[75%] focus:ring-4 focus:outline-none font-dosis rounded-lg text-sm px-4 py-2 ">Search</button>
            {#if showDropdown}
                <ul class="absolute top-11 z-10 bg-white w-full mt-2 rounded-lg border border-gray-300">
                    {#each autocompleteSuggestions as suggestion}
                    <button class="block w-full text-left px-4 py-2 focus:outline-none hover:bg-gray-100 text-black text-4xl font-dosis border-t border-b" on:click={handleFormSubmit} on:click={showDropdown=false}>
                        {@html boldMatch(suggestion, selectedCountry)}
                    </button>
                    {/each}
                </ul>
            {/if}
        </form>
    </div>
    <div class="flex justify-end pr-16 items-center m-0 font-dosis text-white text-2xl">
        Menu
    </div>
</nav>