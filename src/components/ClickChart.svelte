<script lang="ts">
    import { onMount } from "svelte";
    import {
        Chart,
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
    } from "chart.js";

    Chart.register(
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
    );

    let { clickTimes }: { clickTimes: number[] } = $props();

    const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
    const accentBg = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-bg")
        .trim();

    let canvas: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        data: [],
                        borderColor: accent,
                        backgroundColor: accentBg,
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 200, easing: "easeOutQuart" } as any,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        ticks: {
                            color: accent,
                            maxTicksLimit: 5,
                            callback: (value) => `${value}ms`,
                            font: {
                                family: getComputedStyle(
                                    document.documentElement,
                                )
                                    .getPropertyValue("--mono")
                                    .trim(),
                            },
                        },
                        grid: { color: accentBg },
                        border: { display: false },
                    },
                },
            },
        });
    });

    $effect(() => {
        if (!chart) return;
        const len = clickTimes.length;
        if (len === 0) {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.update("none");
            return;
        }
        chart.data.labels = clickTimes.map((_, i) => i + 1);
        chart.data.datasets[0].data.push(clickTimes[len - 1]);
        chart.update("active");
    });
</script>

<div class="flex flex-col items-center gap-1">
    <div style="width: 600px; height: 200px;">
        <canvas bind:this={canvas}></canvas>
    </div>
    <span
        class="text-xs font-bold"
        style="color: var(--accent); font-family: var(--mono)"
        >Time Between Clicks</span
    >
</div>
