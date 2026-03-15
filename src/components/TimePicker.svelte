<script lang="ts">
    let {
        duration = $bindable(),
        running = false,
    }: { duration: number; running: boolean } = $props();
    const options = [5, 10, 15, 30, 60];
</script>

<div class="flex flex-col gap-1">
    <span class="text-xs" style="color: var(--text)">duration</span>
    {#each options as option}
        <button
            class:active={duration === option}
            disabled={running}
            onclick={() => (duration = option)}
        >
            {option}s
        </button>
    {/each}
</div>
