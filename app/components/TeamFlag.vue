<script setup lang="ts">
const props = defineProps<{ team: string }>()

const SUBDIVISION_FLAGS: Record<string, string> = {
  'Inglaterra': 'gb-eng',
  'Escocia': 'gb-sct',
  'Gales': 'gb-wls',
}

const subdivisionCode = computed(() => SUBDIVISION_FLAGS[props.team])
const emoji = computed(() => subdivisionCode.value ? '' : getFlag(props.team))
</script>

<template>
  <img
    v-if="subdivisionCode"
    :src="`https://flagcdn.com/w40/${subdivisionCode}.png`"
    :srcset="`https://flagcdn.com/w80/${subdivisionCode}.png 2x`"
    :alt="team"
    class="inline-block h-[1.1em] w-auto align-text-bottom"
  >
  <span v-else>{{ emoji }}</span>
</template>
