<script setup lang="ts">
const open = defineModel<boolean>({ required: true })
defineProps<{ count: number }>()
</script>

<template>
  <UModal :open="open" title="⏳ Te faltan predicciones" @update:open="(v) => open = v">
    <template #body>
      <div class="space-y-4 text-sm">
        <div class="rounded-xl bg-warning/15 border border-warning/30 p-4 text-center">
          <p class="text-4xl font-bold text-foreground leading-none">{{ count }}</p>
          <p class="text-xs font-semibold uppercase tracking-wide text-warning mt-2">
            {{ count === 1 ? 'partido por rellenar' : 'partidos por rellenar' }}
          </p>
        </div>
        <p class="text-muted text-center">
          Recuerda rellenar <span class="font-medium text-foreground">todos los partidos restantes</span>
          de la fase eliminatoria, <span class="font-medium text-foreground">incluida la final</span>,
          antes de que se cierren las predicciones.
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton class="bg-primary-400! text-neutral-900! hover:bg-primary-300!" @click="open = false">
          Vale, voy a por ellos
        </UButton>
      </div>
    </template>
  </UModal>
</template>
