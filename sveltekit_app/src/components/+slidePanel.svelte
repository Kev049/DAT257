<script lang="ts">
    import { countryContentStore, countryGraphStore, countryConStore } from '../store/mapStore';
    import { onMount } from 'svelte'
    import { currentImage, currentTable, currentCon } from '../scripts/mapInteractions';
    import { html, packSiblings } from 'd3';

    let button: HTMLButtonElement;

    onMount(() => {
        countryContent = currentTable; 
        countryGraph = currentImage;
        countryCon = currentCon;
    });
    

    $: countryContent = '';
    $: countryGraph = '';
    $: countryCon = '';
    $: showImage = false;
    let src: string;
    
    countryContentStore.subscribe(value => {
        countryContent = value;
    });

    countryGraphStore.subscribe(value => {
        countryGraph = value;
    });

    countryConStore.subscribe(value => {
        countryCon = value;
    })

    function toggleGraphs() {
        showImage = !showImage;

        //console.log(table instanceof HTMLTableElement)
        // console.log(countryGraph)
    }

    function shouldShowPieChart(){
        var tempObject = document.createElement('div');
        tempObject.innerHTML = countryContent;
        var table = tempObject.querySelector('table');
        var rowLength = table?.rows.length;
        if( rowLength != undefined){
            if(rowLength <= 3){
                return false;
            }
        }
    }

    function updateButtonState() {
        if (shouldShowPieChart()) {
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            button.classList.add('opacity-50', 'cursor-not-allowed');
        }
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
        <img src="country_prod/ProdLegend.png" alt="Legend for production graphs">
        {@html countryGraph}
        <img src="country_con/ConLegend.png" alt="Legend for consumption graphs">
        {@html countryCon}
    {/if}
    <!-- {#if !countryGraph} -->
    <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-1/4" on:click={toggleGraphs} id=toggleCharts>
        <img id="toggleIcon" src="../../pie-chart.png" alt="Icon"/>
    </button>
</div>
