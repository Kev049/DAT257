<script lang="ts">
    import { onMount } from 'svelte';
    import { tooltipContent, setupMapInteractions, initializeCountryMap} from '../scripts/mapInteractions';
    import { tooltipToggler, sidepanelToggler, xStore, yStore } from '../store/mapStore';
    import { svgElement, initialiseHeatmapPoints } from '../components/+map.svelte';
    import Map from '../components/+map.svelte';
    import Nav from '../components/+nav.svelte';
    import SlidePanel from '../components/+slidePanel.svelte';

    let tooltipVisible: boolean = false;
    let tooltipX: number = 0;
    let tooltipY: number = 0;
    let showSidePanel: boolean = false;

    onMount(() => {
        const cleanup = setupMapInteractions(svgElement);
        initialiseHeatmapPoints();
        initializeCountryMap();
        return cleanup;
    });

    //Store variables

    tooltipToggler.subscribe(value => {
        tooltipVisible = value;
    });

    sidepanelToggler.subscribe(value => {
        showSidePanel = value;
    });

    xStore.subscribe(value => {
        tooltipX = value;
    });

    yStore.subscribe(value => {
        tooltipY = value;
    });
</script>

<div class="flex flex-col w-full h-auto max-h-full overflow-hidden overscroll-contain items-center justify-center bg-[#5cb5e1] backdrop-blur-lg">
    <Nav></Nav>
    <div class="flex items-center justify-center bg-[#c8ebff] w-full h-screen relative">
        {#if showSidePanel}
            <SlidePanel></SlidePanel>
        {/if}
        <Map></Map>
    </div>
    {#if tooltipVisible}
    <div class="tooltip visible fixed left-[var(--tooltip-x)] top-[var(--tooltip-y)] bg-[#323638] z-10 text-white p-[0.5rem] rounded-lg font-dosis pointer-events-none" style="--tooltip-x: {tooltipX}px; --tooltip-y: {tooltipY}px;">
        {tooltipContent}
    </div>
    {/if}
</div>
