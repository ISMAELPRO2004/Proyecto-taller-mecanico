<script setup>
import { useTallerOrden } from './composables/useTallerOrden.js';
import EncabezadoOrdenForm from './componentes/EncabezadoOrdenForm.vue';
import ListaItemsOrden from './componentes/ListaItemsOrden.vue';
import SelectorCatalogoModal from './componentes/SelectorCatalogoModal.vue';
import FooterResumenOrden from './componentes/FooterResumenOrden.vue';
import CampoFoto from './componentes/CampoFoto.vue';
import ModalFacturaOrden from './componentes/ModalFacturaOrden.vue';

const {
  router, cargando, form, cambiarEstado, facturaPendiente, fotos, esAdmin, subiendoFoto,
  subirRegistroAdmin, quitarRegistroAdmin, subirDesarrollo, quitarDesarrollo, verPrecios,
  abrirSelector, responsables, totalFinal, guardar, selector, itemsSelector, idsSeleccionados,
  confirmarCatalogo, modalFactura, cancelarFactura, aplicarFactura, guardando,
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
        <ListaItemsOrden
          titulo="Insumos"
          icono="package"
          texto-boton="+ Añadir"
          solido
          con-cantidad
          campo-monto="precioAlMomento"
          :items="form.materiales"
          :ver-precios="verPrecios"
          @add="abrirSelector('materiales')"
          @remove="form.materiales.splice($event, 1)"
        />
        <ListaItemsOrden
          titulo="Mano de Obra"
          icono="wrench"
          texto-boton="+ Catálogo"
          :items="form.servicios"
          :ver-precios="verPrecios"
          @add="abrirSelector('servicios')"
          @remove="form.servicios.splice($event, 1)"
        />
        <ListaItemsOrden
          titulo="Trabajos Externos"
          icono="external"
          texto-boton="+ Terceros"
          azul
          :items="form.terceros"
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

    <ModalFacturaOrden
      :is-open="modalFactura"
      intencion="cancelar"
      :orden="{
        numeroOrden: form.numeroOrden,
        requiereFactura: form.requiereFactura,
        numeroFactura: form.numeroFactura,
        montoFactura: form.montoFactura,
      }"
      @close="cancelarFactura"
      @guardar="aplicarFactura"
    />

    <div v-if="guardando" class="fixed inset-0 z-40 bg-white/40 flex items-center justify-center">
      <span class="loading loading-spinner loading-lg text-lyer-green" />
    </div>
  </div>
</template>
