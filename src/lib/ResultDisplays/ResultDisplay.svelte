<script>
    import AdvancedResultsDropdown from "./AdvancedResultsDropdown.svelte";
    import ResultsGraph from "./ResultsGraph.svelte";
    import StopTestButton from "../StopTestButton.svelte";
    import WaveSimulator from "./WaveSimulator.svelte";

    export let testActive;
    export let timeLeft;
    export let clickIntervals;
    export let testTime;
    export let currTestTime;
    export let debouncing;
    export let releaseTimes;
    export let clickTimes;

    let showGraph = true;
    let showWave = true;

    function formatMilliseconds(ms) {
        let minutes = Math.floor(ms / 60000);
        let seconds = ((ms % 60000) / 1000).toFixed(0);

        return minutes === 0
            ? seconds.toString() + "s"
            : `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
    }
</script>

<main>
    <h1>
        {testActive ? formatMilliseconds(timeLeft) : " "}
    </h1>
    <br />
    <p>
        {clickIntervals.length} clicks
    </p>
    <br />
    {#if clickIntervals}
        {#if showGraph}
            <ResultsGraph {clickIntervals} />
            <br />
        {/if}
        {#if showWave}
            <WaveSimulator {clickTimes} {releaseTimes} {testActive} {testTime} />
        {/if}
    {/if}
</main>

<section class="left-section">
    <h2>Statistics</h2>
    <div class="general-wrapper">
        Test time: {formatMilliseconds(testTime * 1000)}
        <br />
        {!testActive
            ? Math.round((clickIntervals.length / currTestTime) * 10) / 10
            : "0"} cps
    </div>
    <StopTestButton bind:testActive bind:debouncing />
    <br />
    <button on:click={() => {showGraph = !showGraph}}>{showGraph ? "Hide Graph" : "Show Graph"}</button>
    <button on:click={() => {showWave = !showWave}}>{showWave ? "Hide Wave" : "Show Wave"}</button>
    <div class="dropdown-wrapper">
        <b>More Stats</b>
        <AdvancedResultsDropdown bind:clickIntervals />
    </div>
</section>

<style>
    .dropdown-wrapper {
        top: 10px;
        left: 2%;
        width: 96%;
        position: inherit;
        margin-top: 400px;
    }

    div {
        width: 100%;
    }

    section {
        position: absolute;
        top: 0;
        height: 100%;
        width: 23%;

        background-color: rgba(0, 0, 0, 0.15);
    }

    .left-section {
        left: 0;
    }
</style>
