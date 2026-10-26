<script setup>
import { computed } from 'vue';
import { Calendar, Car, ClipboardList, MessageSquareText, User } from 'lucide-vue-next';
import { useTallerOrden } from './composables/useTallerOrden.js';
import EncabezadoOrdenForm from './compartido/EncabezadoOrdenForm.vue';
import ListaItemsOrden from './componentes/ListaItemsOrden.vue';
import SelectorCatalogoModal from './componentes/SelectorCatalogoModal.vue';
import FooterResumenOrden from './componentes/FooterResumenOrden.vue';
import CampoFoto from './compartido/CampoFoto.vue';

const {
  router, cargando, form, cambiarEstado, fotos, esAdmin, subiendoFoto,
  subirRegistroAdmin, quitarRegistroAdmin, subirDesarrollo, quitarDesarrollo, verPrecios,
  abrirSelector, responsables, subtotales, totalFinal, guardar, selector, itemsSelector, idsSeleccionados,
  confirmarCatalogo, guardando,
} = useTallerOrden();

const fechaIngreso = computed(() => {
  if (!form.value.fechaCreacion) return '';
  const fecha = new Date(form.value.fechaCreacion);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
});
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-6 pb-16">
    <div v-if="cargando" class="py-24 text-center">
      <span class="loading loading-ring loading-lg text-lyer-accent" />
    </div>

    <template v-else>
      <EncabezadoOrdenForm
        es-edicion
        modo="taller"
        :estado="form.estado"
        :numero-orden="form.numeroOrden"
        @back="router.push('/ordenes')"
        @update:estado="cambiarEstado"
      />

      <section class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <article class="flex items-center gap-3.5 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
            <Car class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-lyer-muted">Placa</span>
            <span class="block font-mono text-base font-bold tracking-wide text-lyer-fg">{{ form.placa || '—' }}</span>
            <span class="block truncate text-[11px] text-lyer-muted">{{ form.marca }} {{ form.modelo }}</span>
          </div>
        </article>

        <article class="flex items-center gap-3.5 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-soft">
            <User class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-lyer-muted">Cliente</span>
            <span class="block truncate text-sm font-semibold text-lyer-fg">{{ form.cliente || '—' }}</span>
            <span class="block truncate font-mono text-[11px] text-lyer-muted">{{ form.documento || 'Sin documento' }}</span>
          </div>
        </article>

        <article class="flex items-center gap-3.5 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-cyan">
            <Calendar class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-lyer-muted">Ingreso</span>
            <span class="block font-mono text-base font-bold text-lyer-fg">{{ fechaIngreso || '—' }}</span>
          </div>
        </article>
      </section>

      <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CampoFoto
          oscuro
          titulo="Foto de registro inicial"
          ayuda="Tomada al ingresar la unidad. Solo un administrador puede cambiarla."
          :src="fotos.registro"
          :puede-cambiar="esAdmin"
          :puede-quitar="esAdmin && !!fotos.registro"
          :subiendo="subiendoFoto === 'registro'"
          @seleccionar="subirRegistroAdmin"
          @quitar="quitarRegistroAdmin"
        />
        <CampoFoto
          oscuro
          titulo="Foto de desarrollo"
          ayuda="Se reemplaza mientras la orden está en trabajo. JPG, PNG o WEBP, hasta 5 MB."
          :src="fotos.desarrollo"
          puede-cambiar
          :puede-quitar="!!fotos.desarrollo"
          :subiendo="subiendoFoto === 'desarrollo'"
          @seleccionar="subirDesarrollo"
          @quitar="quitarDesarrollo"
        />
      </section>

      <section class="space-y-6">
        <article class="rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:p-6">
          <div class="mb-3 flex items-center gap-2">
            <MessageSquareText class="h-4 w-4 text-lyer-cyan" />
            <h3 class="font-display text-sm font-bold uppercase tracking-wider text-lyer-fg">Solicitud del cliente</h3>
          </div>
          <p class="mb-3 text-xs text-lyer-muted">Lo que pidió al ingresar la unidad. Quedó registrado en recepción.</p>
          <div class="min-h-32 rounded-xl border border-lyer-linea/50 bg-lyer-fondo p-4 text-sm leading-relaxed text-lyer-fg">
            {{ form.descripcionInformal?.trim() || 'Sin solicitud registrada.' }}
          </div>
        </article>

        <article class="rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:p-6">
          <div class="mb-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <ClipboardList class="h-4 w-4 text-lyer-cyan" />
              <h3 class="font-display text-sm font-bold uppercase tracking-wider text-lyer-fg">Trabajos a realizar</h3>
            </div>
            <span class="rounded-md border border-lyer-cyan/30 bg-lyer-cyan/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lyer-cyan">
              En taller
            </span>
          </div>
          <p class="mb-3 text-xs text-lyer-muted">El detalle de lo que hay que hacer, una vez aceptada la orden.</p>
          <textarea
            v-model="form.trabajoSolicitado"
            rows="6"
            placeholder="Por ejemplo: desmontaje de la caja de cambios y revisión del embrague."
            class="min-h-40 w-full resize-y rounded-xl border border-lyer-linea/50 bg-lyer-fondo p-4 text-sm leading-relaxed text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none"
          />
        </article>
      </section>

      <ListaItemsOrden
        titulo="Insumos y repuestos"
        icono="package"
        texto-boton="+ Añadir insumo"
        solido
        con-cantidad
        campo-monto="precioAlMomento"
        :items="form.materiales"
        :ver-precios="verPrecios"
        @add="abrirSelector('materiales')"
        @remove="form.materiales.splice($event, 1)"
      />
      <ListaItemsOrden
        titulo="Mano de obra"
        icono="wrench"
        texto-boton="+ Catálogo"
        :items="form.servicios"
        :ver-precios="verPrecios"
        @add="abrirSelector('servicios')"
        @remove="form.servicios.splice($event, 1)"
      />
      <ListaItemsOrden
        titulo="Trabajos externos"
        icono="external"
        texto-boton="+ Añadir tercero"
        azul
        :items="form.terceros"
        :ver-precios="verPrecios"
        @add="abrirSelector('terceros')"
        @remove="form.terceros.splice($event, 1)"
      />

      <FooterResumenOrden
        :responsable-id="form.responsableId"
        :responsables="responsables"
        :subtotales="subtotales"
        :total-final="totalFinal"
        :ver-precios="verPrecios"
        es-edicion
        @update:responsable-id="form.responsableId = $event"
        @guardar="guardar"
      />
    </template>

    <SelectorCatalogoModal
      :is-open="selector.abierto"
      :titulo="selector.titulo"
      :tipo="selector.tipo"
      :items="itemsSelector"
      :ya-seleccionados-ids="idsSeleccionados"
      :ver-precios="verPrecios"
      @close="selector.abierto = false"
      @confirmar="confirmarCatalogo"
    />

    <div v-if="guardando" class="fixed inset-0 z-40 flex items-center justify-center bg-lyer-fondo/50">
      <span class="loading loading-spinner loading-lg text-lyer-accent" />
    </div>
  </div>
</template>
