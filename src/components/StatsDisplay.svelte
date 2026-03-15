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

    type DevianceMode = "all" | "even" | "odd";

    function calculateDeviance(times: number[], mode: DevianceMode = "all") {
        const filtered =
            mode === "all"
                ? times
                : times.filter((_, i) =>
                      mode === "even" ? i % 2 === 0 : i % 2 !== 0,
                  );

        if (filtered.length === 0) return null;

        const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
        const variance =
            filtered.reduce((sum, t) => sum + (t - mean) ** 2, 0) /
            filtered.length;

        return Math.sqrt(variance);
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
            <div class="flex flex-col items-end gap-0.5">
                <span
                    >{clickTimes.length > 2
                        ? calculateDeviance(clickTimes, "all")!.toFixed(2) +
                          "ms"
                        : "—"}</span
                >
            </div>
        </div>
        <div class="flex justify-between gap-6">
            <span class="text-[12px] text-left" style="color: var(--text)">
                input 1 ·
                {clickTimes.length > 1
                    ? calculateDeviance(clickTimes, "odd")!.toFixed(2) + "ms"
                    : "—"}
                <br />
                input 2 ·
                {clickTimes.length > 1
                    ? calculateDeviance(clickTimes, "even")!.toFixed(2) + "ms"
                    : "—"}
            </span>
        </div>
    </div>
</div>
