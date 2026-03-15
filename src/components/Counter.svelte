<script lang="ts">
  const STORAGE_KEY = "keybinds";

  let keys: [string, string] = $state(
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? [
      "ArrowLeft",
      "ArrowRight",
    ],
  );
  let rebinding: 0 | 1 | null = $state(null);
  let cooldown: boolean = $state(false);

  let _running: boolean = $state(false);
  let pulse: boolean = $state(false);
  let pulseTimeout: ReturnType<typeof setTimeout> | null = null;

  let {
    duration = 10,
    count = $bindable(0),
    running = $bindable(false),
    timeLeft = $bindable(0),
    clickTimes = $bindable<number[]>([]),
    onRunComplete,
  }: {
    duration: number;
    count: number;
    running: boolean;
    timeLeft: number;
    clickTimes: number[];
    onRunComplete?: () => void;
  } = $props();

  const DURATION = $derived(duration);
  let interval: ReturnType<typeof setInterval> | null = null;
  let lastClickAt: number | null = null;
  let debounceTime = 1000; // ms

  const start = () => {
    count = 0;
    clickTimes = [];
    lastClickAt = null;
    _running = true;
    const startedAt = Date.now();
    timeLeft = DURATION;
    interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      timeLeft = Math.max(0, DURATION - elapsed);
      if (timeLeft <= 0) {
        clearInterval(interval!);
        interval = null;
        _running = false;
        onRunComplete?.();
        cooldown = true;
        setTimeout(() => (cooldown = false), debounceTime);
      }
    }, 100);
  };

  const stop = () => {
    if (!_running) return;
    clearInterval(interval!);
    interval = null;
    _running = false;
    onRunComplete?.();
    cooldown = true;
    setTimeout(() => (cooldown = false), 1000);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    e.preventDefault();
    if (rebinding !== null) {
      keys[rebinding] = e.key;
      rebinding = null;
    } else if (keys.includes(e.key) && !cooldown) {
      if (!_running) {
        start();
      } else {
        const now = Date.now();
        if (lastClickAt !== null) {
          clickTimes = [...clickTimes, now - lastClickAt];
        }
        lastClickAt = now;
        count += 1;
        if (pulseTimeout) clearTimeout(pulseTimeout);
        pulse = false;
        requestAnimationFrame(() => {
          pulse = true;
          pulseTimeout = setTimeout(() => (pulse = false), 300);
        });
      }
    }
  };

  const formatKey = (key: string) => {
    if (key === " ") return "Space";
    if (key.length === 1) return key.toUpperCase();
    return key.replace(/([A-Z])/g, " $1").trim();
  };

  const progress = $derived(_running ? (timeLeft / DURATION) * 100 : 0);

  $effect(() => {
    running = _running;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col items-center gap-6">
  <!-- Counter -->
  <div
    class="counter text-5xl! px-8! py-4! min-w-32 justify-center tabular-nums"
    class:pulse
  >
    {count}
  </div>

  <!-- Timer Bar -->
  <div class="flex flex-col items-center gap-2 w-48">
    <span class="text-xs" style="color: var(--text)">
      {_running
        ? `${Math.floor(timeLeft * 10) / 10}s remaining`
        : `${DURATION}s`}
    </span>
    <div
      class="w-full h-1 rounded-full overflow-hidden"
      style="background: var(--border)"
    >
      <div
        class="h-full rounded-full"
        style="
        width: {progress}%;
        background: var(--accent);
        transition: {timeLeft < DURATION && timeLeft > 0
          ? 'width 0.15s linear'
          : 'none'};
      "
      ></div>
    </div>
    <button
      onclick={_running ? stop : start}
      class="w-full justify-center"
      class:active={!_running}
      class:hover:text-[var(--red)]!={_running}
      class:hover:bg-[var(--red-bg)]!={_running}
      class:hover:border-[var(--red-border)]!={_running}
      class:hover:shadow-none!={_running}
    >
      {_running ? "Stop" : "Start spamming to begin"}
    </button>
  </div>

  <!-- Rebind buttons -->
  <div class="flex flex-col items-center gap-1.5">
    <span class="text-xs" style="color: var(--text)"
      >keys (click to rebind)</span
    >
    <div class="flex gap-1">
      <button
        class:active={rebinding === 0}
        disabled={_running}
        onclick={() => (rebinding = rebinding === 0 ? null : 0)}
      >
        {rebinding === 0 ? "…" : formatKey(keys[0])}
      </button>
      <button
        class:active={rebinding === 1}
        disabled={_running}
        onclick={() => (rebinding = rebinding === 1 ? null : 1)}
      >
        {rebinding === 1 ? "…" : formatKey(keys[1])}
      </button>
    </div>
  </div>
</div>
