<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const user = useSupabaseUser()
</script>

<template>
  <div class="max-w-lg mx-auto">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar :alt="user?.email" size="md" />
          <div>
            <h1 class="font-semibold text-foreground">
              Bienvenido
            </h1>
            <p class="text-sm text-muted">
              {{ user?.email }}
            </p>
          </div>
        </div>
      </template>

      <div class="flex items-start gap-3 text-muted">
        <UIcon name="i-lucide-clock" class="size-5 mt-0.5 shrink-0" />
        <p class="text-sm">
          Las predicciones estarán disponibles pronto. ¡Vuelve cuando comience el torneo!
        </p>
      </div>
    </UCard>
  </div>
</template>
