<script setup lang="ts">
const open = defineModel<boolean>({ required: true })
</script>

<template>
  <UModal :open="open" title="🏆 Empieza la fase eliminatoria" @update:open="(v) => open = v">
    <template #body>
      <div class="space-y-4 text-sm">
        <div>
          <p class="font-semibold text-foreground">Rellena todo tu cuadro antes de que empiece</p>
          <p class="text-muted mt-1">
            Tienes que completar todas tus predicciones de la fase eliminatoria —hasta la final—
            <span class="font-medium text-foreground">antes del primer partido de dieciseisavos: el domingo 28 de junio a las 21:00h.</span>
            A esa hora se cierran las predicciones.
          </p>
        </div>
        <div>
          <p class="font-semibold text-foreground">Los equipos que ves ahora no son definitivos</p>
          <p class="text-muted mt-1">
            Los cruces se calculan con los <span class="font-medium text-foreground">resultados reales</span> que ya hay y,
            para los partidos de grupos que aún no se han jugado, con <span class="font-medium text-foreground">tus propias predicciones</span>
            — así puedes ir montando tu cuadro desde ya. Se irán ajustando con los resultados reales hasta que termine la fase de grupos
            (<span class="font-medium text-foreground">28 de junio, 04:00h</span>), cuando ya serán definitivos.
          </p>
        </div>
        <div>
          <p class="font-semibold text-foreground">¿Cuándo rellenarlo?</p>
          <p class="text-muted mt-1">
            Lo ideal es completar el cuadro el <span class="font-medium text-foreground">28 de junio</span>, cuando los grupos ya estén decididos.
            Pero si quieres, <span class="font-medium text-foreground">puedes empezar ahora</span> y ajustarlo después.
          </p>
        </div>
        <div class="rounded-lg border border-warning/30 bg-warning/10 p-3">
          <p class="font-semibold text-foreground flex items-center gap-1.5">
            <UIcon name="i-lucide-triangle-alert" class="size-4 text-warning shrink-0" /> Ojo con estas reglas
          </p>
          <ul class="text-muted mt-2 space-y-2 list-disc pl-4">
            <li>
              El marcador que cuenta es el del <span class="font-medium text-foreground">final de la prórroga</span>.
              Si el partido se decide en los <span class="font-medium text-foreground">penaltis</span>, el resultado exacto es el
              <span class="font-medium text-foreground">empate</span> (p. ej. 1–1); los penaltis solo deciden qué equipo pasa.
            </li>
            <li>
              Si en algún cruce <span class="font-medium text-foreground">los equipos no coinciden con los de tu cuadro</span>,
              ese partido te da <span class="font-medium text-foreground">0 puntos</span>, aunque aciertes el marcador.
              Por eso es clave acertar el camino completo.
            </li>
          </ul>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton class="bg-primary-400! text-neutral-900! hover:bg-primary-300!" @click="open = false">
          Entendido, ¡a por ello!
        </UButton>
      </div>
    </template>
  </UModal>
</template>