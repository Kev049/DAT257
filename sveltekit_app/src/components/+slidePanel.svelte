<script lang="ts">
    import { countryContentStore, countryGraphStore, countryConStore } from '../store/mapStore';
    import { onMount } from 'svelte'
    import { currentImage, currentTable, currentCon } from '../scripts/mapInteractions';
    import { html, packSiblings } from 'd3';
    import { get } from 'svelte/store';

    // let button: HTMLButtonElement;
    let tooltipInfo: string = 'No data available';

    onMount(() => {
        countryContent = currentTable; 
        countryGraph = currentImage;
        countryCon = currentCon;
    });
    

    $: countryContent = '';
    //let countryGraph : string;
    $: $countryGraphStore, updateProdButton();
    $: $countryConStore, updateConButton();
    $: countryGraph = '';
    $: countryCon = '';
    $: showImage = false;
    $: panelState = 0;
    $: tableButtonColor = 'grey';
    $: prodButtonColor = 'white';
    $: conButtonColor = 'white';
    let prodButtonDisabled = false;
    let conButtonDisabled = false;

    let src: string;
    
    countryContentStore.subscribe(value => {
        countryContent = value;
        // console.log("subscrib");
        // updateButtonStates();
        // tableButtonDisabled = !shouldShowPieChart();
    });

    async function updateProdButton() {
        prodButtonDisabled = !shouldShowProd();
        // document.getElementById("toggleProdChart")?.style.setProperty('-webkit-filter', 'grayscale(100%)');
        // console.log(document.querySelector("spDiv"));
        console.log(document.querySelectorAll("button"));

    }
            // filter: grayscale(100%);

    async function updateConButton() {
        conButtonDisabled = !shouldShowConLegend();
        goToTableIfNoData();
    }

    async function goToTableIfNoData() {
        if(panelState === 1 && prodButtonDisabled) {
            showTable();
        }
        if(panelState === 2 && conButtonDisabled) {
            showTable();
        }
    }

    function showTable() {
        console.log("eye");
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

    function shouldShowProd(){
        var tempObject = document.createElement('div');
        tempObject.innerHTML = $countryContentStore;
        var table = tempObject.querySelector('table');
        var rowLength = table?.rows.length;
        if(rowLength != undefined){
            if(rowLength > 3){
                return true;
            }
            return false;
        }
    }

    function shouldShowConLegend(){
        console.log(countryCon, "countryCon");
        var tempImgObject = document.createElement('div');
        tempImgObject.innerHTML = $countryConStore;
        var cImg = tempImgObject.querySelector('img');
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

    .h-1-8 {
        height: 10%;
    }

    .button-tab > img {
        object-fit: scale-down;
        width: 100%;
        height: auto;
        max-height: 100%;
    }

    .toggleChart:disabled {
        color: #666;
        background-color: #bdc3c7;
        -webkit-filter: grayscale(100%);
        filter: grayscale(100%);
    }

</style>

<div class="absolute top-0 right-0 bottom-0 w-1/4 flex flex-col px-6 bg-white text-gray-700 z-10 border-l-4 border-[#333333]">
    <div id="Button bar" class="grid grid-cols-3 h-1-8 mb-4 mt-4">
        <button style:background-color={tableButtonColor} class="py-2 px-4 rounded inline-flex button-tab;" on:click={showTable} id=toggleTable>
            <img id="toggleIcon" src="../../stats.png" alt="Icon"/>
        </button>
        <button style:background-color={prodButtonColor} class="toggleChart py-2 px-4 rounded inline-flex button-tab" on:click={showProd} disabled={prodButtonDisabled} id=toggleProdChart>
            <img id="toggleIcon" src="../../wind-turbine.png" alt="Icon"/>
        </button>
        <button style:background-color={conButtonColor} class="toggleChart py-2 px-4 rounded inline-flex button-tab" on:click={showCon} disabled={conButtonDisabled} id=toggleConsChart>
            <img id="toggleIcon" src="../../fire-place.png" alt="Icon"/>
            <!-- disabled ? 'disabled' : '' -->
        </button>
    </div>
    {#if panelState === 0}
        {@html countryContent}
    {/if}
    {#if panelState === 1}
        <img src="country_prod/ProdLegend.png" alt="Legend for production graphs">
        {@html $countryGraphStore}
    {/if}
    {#if panelState === 2}
        <img src="country_con/ConLegend.png" alt="Legend for consumption graphs">
        {@html $countryConStore}
    {/if}
</div>
