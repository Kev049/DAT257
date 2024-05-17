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
    $: panelState = 0;
    $: tableButtonColor = 'grey';
    $: prodButtonColor = 'white';
    $: conButtonColor = 'white';

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
        //TODO: kolla det ovan och fixa det på rad 55(under var cImg i shouldShowPieChart())
    }

    function showTable() {
        panelState = 0;
        tableButtonColor = 'grey';
        prodButtonColor = 'white';
        conButtonColor = 'white';
    }

    function showProd() {
        panelState = 1;
        tableButtonColor = 'white';
        prodButtonColor = 'grey';
        conButtonColor = 'white';
    }

    function showCon() {
        panelState = 2;
        tableButtonColor = 'white';
        prodButtonColor = 'white';
        conButtonColor = 'grey';
    }

    function shouldShowPieChart(){
        console.log("got here");
        var tempObject = document.createElement('div');
        tempObject.innerHTML = countryContent;
        var table = tempObject.querySelector('table');
        var rowLength = table?.rows.length;
        if(rowLength != undefined){
            if(rowLength > 3){
                console.log(rowLength)
                return true;
            }
            return false;
        }
    }
    function showConLegend(){
        var tempImgObject = document.createElement('div');
        tempImgObject.innerHTML = countryGraph;
        var cImg = tempImgObject.querySelector('img');
        console.log(cImg);
        if(cImg != null){
            return true;
        }
        return false;
    }
</script>

<style>
    .dataframe > tbody > tr:first-child td {
      font-weight: bold;
    }

    .disabled {
    background-color: #ccc;
  }
</style>

<div class="absolute top-0 right-0 bottom-0 w-1/4 flex flex-col px-6 bg-white text-gray-700 z-10 border-l-4 border-r-4 border-[#333333]">
    <div id="Button bar">
        <button style:background-color={tableButtonColor} class="disabled ? 'disabled' : '' bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-1/4" on:click={showTable} id=toggleCharts>
            <img id="toggleIcon" src="../../stats.png" alt="Icon"/>
        </button>
        <button style:background-color={prodButtonColor} class="disabled ? 'disabled' : '' bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-1/4" on:click={showProd} id=toggleCharts>
            <img id="toggleIcon" src="../../wind-turbine.png" alt="Icon"/>
        </button>
        <button style:background-color={conButtonColor} class="disabled ? 'disabled' : '' bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-1/4" on:click={showCon} id=toggleCharts>
            <img id="toggleIcon" src="../../fire-place.png" alt="Icon"/>
        </button>
    </div>
    {#if panelState === 0}
        {@html countryContent}
    {/if}
    {#if panelState === 1}
        <img src="country_prod/ProdLegend.png" alt="Legend for production graphs">
        {@html countryGraph}
    {/if}
    {#if panelState === 2}
        <img src="country_con/ConLegend.png" alt="Legend for consumption graphs">
        {@html countryCon}
        <!-- {#if showConLegend()}
            <img src="country_con/ConLegend.png" alt="Legend for consumption graphs">
            {@html countryCon}
        {/if} -->
    {/if}
    
</div>
