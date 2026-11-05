<script setup lang="ts">
withDefaults(defineProps<{ name: keyof typeof paths; size?: number }>(), { size: 20 })

const paths = {
  check: 'm5 12 4 4L19 6',
  chevron: 'm9 5 7 7-7 7',
  arrow: 'M19 12H5m6-6-6 6 6 6',
  target: 'M12 2v4m0 12v4M2 12h4m12 0h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  grid: 'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z',
  box: 'm12 3 9 5v9l-9 5-9-5V8Zm-9 5 9 5 9-5m-9 5v9M7.5 5.5l9 5',
  shield: 'm12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z',
  warning: 'm12 3 10 18H2Zm0 6v5m0 3v1',
  database:
    'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3Zm0 0v12c0 2-3.6 3-8 3s-8-1-8-3V6m0 6c0 2 3.6 3 8 3s8-1 8-3',
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="square"
    stroke-linejoin="miter"
    aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>
