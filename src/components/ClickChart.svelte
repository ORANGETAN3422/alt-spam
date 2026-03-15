<script lang="ts">
    import { Line } from "svelte-chartjs";
    import {
        Chart,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        type ChartOptions,
    } from "chart.js";

    Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

    let { clickTimes, running }: { clickTimes: number[]; running: boolean } =
        $props();

    const hasRun = $derived(clickTimes.length > 0);

    const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
    const accentBg = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-bg")
        .trim();

    const data = $derived({
        labels: clickTimes.map((_, i) => i + 1),
        datasets: [
            {
                data: clickTimes,
                borderColor: accent,
                backgroundColor: accentBg,
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                fill: true,
            },
        ],
    });

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 600,
            easing: "easeOutQuart",
        } as any,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: {
                ticks: {
                    color: accent,
                    maxTicksLimit: 5,
                },
                grid: {
                    color: accentBg,
                },
                border: { display: false },
            },
        },
    };
</script>

{#if hasRun && !running}
    <div class="w-xl h-48">
        <Line {data} {options} />
    </div>
{/if}
