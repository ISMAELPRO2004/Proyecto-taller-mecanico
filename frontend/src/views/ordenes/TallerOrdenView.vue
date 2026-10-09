<script setup>
import { useTallerOrden } from './composables/useTallerOrden.js';
import EncabezadoOrdenForm from './componentes/EncabezadoOrdenForm.vue';
import ListaMateriales from './componentes/ListaMateriales.vue';
import ListaServicios from './componentes/ListaServicios.vue';
import ListaTerceros from './componentes/ListaTerceros.vue';
import SelectorCatalogoModal from './componentes/SelectorCatalogoModal.vue';
import FooterResumenOrden from './componentes/FooterResumenOrden.vue';
import CampoFoto from './componentes/CampoFoto.vue';

const {
  router, cargando, form, cambiarEstado, facturaPendiente, fotos, esAdmin, subiendoFoto,
  subirRegistroAdmin, quitarRegistroAdmin, subirDesarrollo, quitarDesarrollo, verPrecios,
  abrirSelector, responsables, totalFinal, guardar, selector, itemsSelector, idsSeleccionados,
  confirmarCatalogo, modalFactura, facturaBorrador, cancelarFactura, confirmarFactura, guardando,
} = useTallerOrden();
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-5 pb-10">
    <div v-if="cargando" class="py-24 text-center">
      <span class="loading loading-ring loading-lg text-lyer-green" />
    </div>

    <template v-else>
      <EncabezadoOrdenForm
        es-edicion
        modo="taller"
        :estado="form.estado"
        @back="router.push('/ordenes')"
        @update:estado="cambiarEstado"
      />

      <section class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-[10px] font-black text-lyer-green uppercase tracking-widest">{{ form.numeroOrden }}</p>
            <h3 class="text-lg font-black text-slate-800 uppercase italic">{{ form.placa }}</h3>
            <p class="text-xs text-slate-500 font-bold">
              {{ form.marca }} {{ form.modelo }} · {{ form.cliente }}
            </p>
          </div>
          <span
            v-if="facturaPendiente"
            class="badge badge-warning badge-sm font-black uppercase animate-pulse"
          >
            Factura pendiente
          </span>
        </div>
      </section>

      <section class="grid md:grid-cols-2 gap-4">
        <CampoFoto
          titulo="Foto de registro"
          ayuda="Tomada al ingreso. Solo el administrador puede cambiarla."
          :src="fotos.registro"
          :puede-cambiar="esAdmin"
          :puede-quitar="esAdmin && !!fotos.registro"
          :subiendo="subiendoFoto === 'registro'"
          @seleccionar="subirRegistroAdmin"
          @quitar="quitarRegistroAdmin"
        />
        <CampoFoto
          titulo="Foto de desarrollo"
          ayuda="Se puede ir reemplazando mientras la orden está en trabajo."
          :src="fotos.desarrollo"
          puede-cambiar
          :puede-quitar="!!fotos.desarrollo"
          :subiendo="subiendoFoto === 'desarrollo'"
          @seleccionar="subirDesarrollo"
          @quitar="quitarDesarrollo"
        />
      </section>

      <section class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 grid md:grid-cols-2 gap-4">
        <label class="form-control">
          <span class="label-text text-[10px] font-black text-slate-400 uppercase">Descripción informal</span>
          <textarea v-model="form.descripcionInformal" rows="3" class="textarea textarea-bordered rounded-2xl text-sm" />
        </label>
        <label class="form-control">
          <span class="label-text text-[10px] font-black text-slate-400 uppercase">Trabajo solicitado</span>
          <textarea v-model="form.trabajoSolicitado" rows="3" class="textarea textarea-bordered rounded-2xl text-sm" />
        </label>
      </section>

      <section class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 space-y-8">
        <ListaMateriales
          :materiales="form.materiales"
          :ver-precios="verPrecios"
          @add="abrirSelector('materiales')"
          @remove="form.materiales.splice($event, 1)"
        />
        <ListaServicios
          :servicios="form.servicios"
          :ver-precios="verPrecios"
          @add="abrirSelector('servicios')"
          @remove="form.servicios.splice($event, 1)"
        />
        <ListaTerceros
          :terceros="form.terceros"
          :ver-precios="verPrecios"
          @add="abrirSelector('terceros')"
          @remove="form.terceros.splice($event, 1)"
        />
      </section>

      <FooterResumenOrden
        :responsable-id="form.responsableId"
        :responsables="responsables"
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

    <div v-if="modalFactura" class="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-[2rem] p-6 space-y-4 shadow-2xl">
        <div>
          <h3 class="font-black text-slate-800 uppercase italic">Cancelar orden</h3>
          <p class="text-xs text-slate-500">¿Habrá factura de esta orden?</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn flex-1 rounded-xl"
            :class="facturaBorrador.decision === 'si' ? 'bg-lyer-green text-white border-none' : 'btn-outline'"
            @click="facturaBorrador.decision = 'si'"
          >Sí</button>
          <button
            type="button"
            class="btn flex-1 rounded-xl"
            :class="facturaBorrador.decision === 'no' ? 'bg-slate-800 text-white border-none' : 'btn-outline'"
            @click="facturaBorrador.decision = 'no'"
          >No</button>
        </div>
        <div v-if="facturaBorrador.decision === 'si'" class="space-y-3">
          <label class="form-control">
            <span class="label-text text-[10px] font-black text-slate-400 uppercase">Número de factura</span>
            <input v-model="facturaBorrador.numero" type="text" class="input input-bordered rounded-xl" placeholder="Opcional, se puede completar después" />
          </label>
          <label class="form-control">
            <span class="label-text text-[10px] font-black text-slate-400 uppercase">Monto</span>
            <input v-model="facturaBorrador.monto" type="number" step="0.01" min="0" class="input input-bordered rounded-xl" />
          </label>
          <p class="text-[10px] text-amber-600 font-bold">Si no hay número, la factura queda pendiente.</p>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="btn btn-ghost flex-1 rounded-xl" @click="cancelarFactura">Volver</button>
          <button type="button" class="btn flex-1 bg-lyer-green text-white border-none rounded-xl" @click="confirmarFactura">Confirmar</button>
        </div>
      </div>
    </div>

    <div v-if="guardando" class="fixed inset-0 z-40 bg-white/40 flex items-center justify-center">
      <span class="loading loading-spinner loading-lg text-lyer-green" />
    </div>
  </div>
</template>
