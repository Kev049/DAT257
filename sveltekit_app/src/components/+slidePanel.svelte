<script lang="ts">
    import { countryContentStore, countryGraphStore } from '../store/mapStore';
    import { onMount } from 'svelte'
    import { currentImage, currentTable } from '../scripts/mapInteractions';
    import { packSiblings } from 'd3';

    onMount(() => {
        countryContent = currentTable; 
        countryGraph = currentImage;
    });

    $: showImage = false;
    $: countryContent = 'Hej';
    $: countryGraph = 'Da';
    let src: string;
    
    countryContentStore.subscribe(value => {
        countryContent = value;
    });

    countryGraphStore.subscribe(value => {
        countryGraph = value;
    });

    function toggleGraphs() {
        showImage = !showImage;
    }
</script>

<style>
    .dataframe > tbody > tr:first-child td {
      font-weight: bold;
    }
</style>

<div class="absolute top-0 right-0 bottom-0 w-1/4 flex flex-col px-6 bg-white text-gray-700 z-10 border-l-4 border-r-4 border-[#333333]">
    {#if !showImage}
        <!-- {console.log(countryContent)} -->
        {@html countryContent}
    {/if}
    <!-- {@html countryContent} -->
    <!-- {@html countryGraph} -->
    {#if showImage}
        {@html countryGraph}
    {/if}
    <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-1/4" on:click={toggleGraphs} id=toggleCharts>
        <img id="toggleIcon" src="../../pie-chart.png" alt="Icon"/>
    </button>
</div>