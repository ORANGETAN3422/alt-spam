<script lang="ts">
    let {
        runs,
        duration,
        count,
        timeLeft,
        running,
        clickTimes,
    }: {
        runs: number[];
        duration: number;
        count: number;
        timeLeft: number;
        running: boolean;
        clickTimes: number[];
    } = $props();

    const elapsed = $derived(duration - timeLeft);
    const liveCps = $derived(elapsed > 0 ? count / elapsed : 0);

    let frozenCps: number | null = $state(null);

    function calculateDeviance() {
        if (clickTimes.length === 0) return null;
        let sum = 0;
        const mean = clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length;

        for (const time of clickTimes) {
            sum += (time - mean) ** 2;
        }

        const variance = sum / clickTimes.length;
        const standardDeviation = Math.sqrt(variance);

        return standardDeviation;
    }

    $effect(() => {
        if (!running && runs.length > 0) {
            const last = runs.at(-1)!;
            frozenCps = last / duration;
        }
    });

    const displayCps = $derived(running ? liveCps : frozenCps);
</script>

<div class="flex flex-col gap-1">
    <span class="text-xs" style="color: var(--text)">stats</span>

    <div
        class="flex flex-col gap-1 font-mono text-sm"
        style="color: var(--text-h)"
    >
        <div class="flex justify-between gap-6">
            <span style="color: var(--text)">count</span>
            <span>{count || "—"}</span>
        </div>
        <div class="flex justify-between gap-6">
            <span style="color: var(--text)">cps</span>
            <span>{displayCps != null ? displayCps.toFixed(1) : "—"}</span>
        </div>
        <div class="flex justify-between gap-6">
            <span style="color: var(--text)">deviance</span>
            <span
                >{calculateDeviance() != null
                    ? calculateDeviance()!.toFixed(2) + "ms"
                    : "—"}</span
            >
        </div>
    </div>
</div>
