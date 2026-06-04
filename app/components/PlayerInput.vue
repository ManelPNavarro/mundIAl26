<script setup lang="ts">
interface Player { id: string, name: string }

const props = defineProps<{
  players: Player[]
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<string | null>()

const query = ref('')
const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const suggestions = computed(() => {
  const q = normalize(query.value.trim())
  if (!q || q.length < 2) return []
  return props.players.filter(p => normalize(p.name).includes(q)).slice(0, 8)
})

watch(query, val => {
  model.value = val || null
  open.value = true
})

onMounted(() => {
  if (model.value) query.value = model.value
})

function select(name: string) {
  query.value = name
  model.value = name
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative">
    <input
      ref="inputRef"
      v-model="query"
      type="text"
      :placeholder="placeholder ?? 'Nombre del jugador...'"
      :disabled="disabled"
      class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
      @focus="open = true"
    />
    <div
      v-if="open && suggestions.length"
      class="absolute z-50 top-full mt-1 left-0 right-0 rounded-md border border-border shadow-xl bg-white dark:bg-neutral-900 overflow-hidden"
    >
      <button
        v-for="p in suggestions"
        :key="p.id"
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 truncate"
        @mousedown.prevent="select(p.name)"
      >
        {{ p.name }}
      </button>
    </div>
  </div>
</template>
