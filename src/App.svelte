<script lang="ts">
  import Counter from "./components/Counter.svelte";
  import TimePicker from "./components/TimePicker.svelte";
  import StatsDisplay from "./components/StatsDisplay.svelte";

  let duration: number = $state(10);
  let count: number = $state(0);
  let runs: number[] = $state([]);
  let running: boolean = $state(false);
  let timeLeft: number = $state(0);
  let clickTimes: number[] = $state([]);

  const onRunComplete = () => {
    runs = [...runs, count];
  };
</script>

<main class="min-h-svh relative flex items-center justify-center">
  <div class="absolute left-8">
    <TimePicker bind:duration {running} />
  </div>
  <Counter
    {duration}
    bind:count
    bind:running
    bind:timeLeft
    bind:clickTimes
    {onRunComplete}
  />
  <div class="absolute right-8">
    <StatsDisplay {runs} {duration} {count} {timeLeft} {running} {clickTimes} />
  </div>
</main>
