<script setup lang="ts">
const props = defineProps<{ team: string }>()

const SUBDIVISION_FLAGS: Record<string, string> = {
  'Inglaterra': 'gb-eng',
  'Escocia': 'gb-sct',
  'Gales': 'gb-wls',
}

const subdivisionCode = computed(() => SUBDIVISION_FLAGS[props.team])
const emoji = computed(() => getFlag(props.team))

const needsImageFallback = useSubdivisionFlagSupport()
const useImage = computed(() => subdivisionCode.value && needsImageFallback.value)
</script>

<template>
  <img
    v-if="useImage"
    :src="`https://flagcdn.com/w40/${subdivisionCode}.png`"
    :srcset="`https://flagcdn.com/w80/${subdivisionCode}.png 2x`"
    :alt="team"
    class="inline-block w-[25px] h-[22px] object-contain align-text-bottom"
  >
  <span v-else>{{ emoji }}</span>
</template>
