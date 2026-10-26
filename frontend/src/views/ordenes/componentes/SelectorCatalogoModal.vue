<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Search, X, Check, Plus, ArrowLeft } from 'lucide-vue-next';
import { catalogoService, endpoints } from '../../../services/catalogoService.js';
import { notify } from '../../../utils/alerts.js';

const props = defineProps({
  isOpen: Boolean,
  titulo: String,
  tipo: { type: String, default: 'materiales' },
  items: { type: Array, default: () => [] },
  yaSeleccionadosIds: { type: Array, default: () => [] },
  verPrecios: { type: Boolean, default: true },
});

const emit = defineEmits(['close', 'confirmar', 'creado']);

const filtro = ref('');
const seleccionTemporales = ref([]);
const inputRef = ref(null);
const itemsLocal = ref([]);
const mostrarSugerencias = ref(false);

const vista = ref('seleccionar'); // seleccionar | crear
const guardando = ref(false);
const formNuevo = ref({ descripcion: '', precioBase: '', responsable: '' });
const descInputRef = ref(null);
const precioRef = ref(null);
const responsableRef = ref(null);
const esTercero = computed(() => props.tipo === 'terceros');

const nombreTipo = computed(() => {
  const map = { materiales: 'repuesto', servicios: 'servicio', terceros: 'trabajo externo' };
  return map[props.tipo] || 'ítem';
});

watch(() => props.items, (lista) => {
  itemsLocal.value = [...(lista || [])];
}, { immediate: true });

watch(() => props.isOpen, async (abierto) => {
  if (abierto) {
    itemsLocal.value = [...(props.items || [])];
    seleccionTemporales.value = itemsLocal.value.filter(i =>
      props.yaSeleccionadosIds.includes(i.id)
    );
    filtro.value = '';
    mostrarSugerencias.value = false;
    vista.value = 'seleccionar';
    formNuevo.value = { descripcion: '', precioBase: '', responsable: '' };
    await nextTick();
    inputRef.value?.focus();
  }
});

const estaSeleccionado = (id) => seleccionTemporales.value.some(i => i.id === id);

const q = computed(() => filtro.value.trim().toLowerCase());

/** Lista completa (filtrada si hay texto) */
const lista = computed(() => {
  const all = itemsLocal.value || [];
  if (!q.value) return all;
  return all.filter(i => i.descripcion.toLowerCase().includes(q.value));
});

/** Autocomplete corto en la barra (máx. 5) */
const sugerencias = computed(() => {
  if (!q.value) return [];
  return lista.value.slice(0, 5);
});

const toggleSeleccion = (item) => {
  const idx = seleccionTemporales.value.findIndex(i => i.id === item.id);
  if (idx > -1) seleccionTemporales.value.splice(idx, 1);
  else seleccionTemporales.value.push(item);
};

const elegirSugerencia = (item) => {
  if (!estaSeleccionado(item.id)) seleccionTemporales.value.push(item);
  filtro.value = '';
  mostrarSugerencias.value = false;
  nextTick(() => inputRef.value?.focus());
};

const ocultarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 150);
};

const quitarSeleccionado = (id) => {
  seleccionTemporales.value = seleccionTemporales.value.filter(i => i.id !== id);
};

const confirmar = () => {
  emit('confirmar', [...seleccionTemporales.value]);
  filtro.value = '';
};

const cerrar = () => {
  filtro.value = '';
  vista.value = 'seleccionar';
  emit('close');
};

const abrirCrear = async (prefijo = '') => {
  vista.value = 'crear';
  mostrarSugerencias.value = false;
  formNuevo.value = { descripcion: prefijo || filtro.value.trim(), precioBase: '', responsable: '' };
  await nextTick();
  descInputRef.value?.focus();
};

const volverSeleccion = async () => {
  vista.value = 'seleccionar';
  await nextTick();
  inputRef.value?.focus();
};

const guardarNuevo = async () => {
  const descripcion = formNuevo.value.descripcion?.trim();
  const responsable = formNuevo.value.responsable?.trim();
  const textoPrecio = String(formNuevo.value.precioBase ?? '').trim();
  let precioBase = null;

  if (!descripcion) return notify.error('Ingresa una descripción');
  if (esTercero.value && !responsable) return notify.error('Ingresa el responsable del tercero');
  if (props.verPrecios && textoPrecio !== '') {
    const precio = parseFloat(textoPrecio);
    if (!Number.isFinite(precio) || precio < 0) return notify.error('Ingresa un precio válido');
    if (precio > 0) precioBase = precio;
  }

  guardando.value = true;
  try {
    const creado = await catalogoService.crear(endpoints[props.tipo], {
      descripcion,
      ...(props.verPrecios ? { precioBase } : {}),
      ...(esTercero.value ? { responsable } : {}),
    });

    itemsLocal.value = [creado, ...itemsLocal.value.filter(i => i.id !== creado.id)];
    if (!estaSeleccionado(creado.id)) seleccionTemporales.value.push(creado);

    emit('creado', { tipo: props.tipo, item: creado });
    notify.success('Registrado', `Nuevo ${nombreTipo.value} en catálogo`);

    filtro.value = '';
    formNuevo.value = { descripcion: '', precioBase: '', responsable: '' };
    vista.value = 'seleccionar';
    await nextTick();
    inputRef.value?.focus();
  } catch {
    notify.error('No se pudo crear el ítem');
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div :class="['modal modal-bottom sm:modal-middle', { 'modal-open': isOpen }]">
    <div class="modal-box flex max-h-[90vh] max-w-xl flex-col overflow-hidden !border !border-lyer-linea/60 !bg-lyer-panel p-0 text-lyer-fg shadow-2xl sm:rounded-2xl">
      <div class="h-1 w-full shrink-0 bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <div class="flex shrink-0 items-center justify-between gap-2 border-b border-lyer-linea/50 bg-lyer-barra px-4 py-4 sm:px-5">
        <div class="flex min-w-0 items-center gap-2.5">
          <button
            v-if="vista === 'crear'"
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lyer-linea/50 bg-lyer-fondo text-lyer-muted hover:text-lyer-fg"
            title="Volver"
            @click="volverSeleccion"
          >
            <ArrowLeft class="h-4 w-4" />
          </button>
          <div class="min-w-0">
            <h3 class="truncate font-display text-base font-bold uppercase tracking-wide text-lyer-fg">
              {{ vista === 'crear' ? `Nuevo ${nombreTipo}` : titulo }}
            </h3>
            <p class="text-[11px] font-medium uppercase tracking-wider text-lyer-muted">
              {{ vista === 'crear' ? (verPrecios ? 'Alta rápida' : 'Solo el nombre') : 'Busca o selecciona' }}
            </p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            v-if="vista === 'seleccionar'"
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-3 text-[11px] font-bold uppercase tracking-wider text-lyer-fg hover:bg-lyer-boton"
            @click="abrirCrear()"
          >
            <Plus class="h-4 w-4" />
            Añadir
          </button>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-lyer-linea/50 text-lyer-muted hover:border-rose-400/40 hover:text-rose-300"
            title="Cerrar"
            @click="cerrar"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- SELECCIONAR -->
      <template v-if="vista === 'seleccionar'">
        <!-- Buscador + autocomplete -->
        <div class="relative z-20 shrink-0 border-b border-lyer-linea/40 bg-lyer-hueco p-3 sm:p-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lyer-cyan" />
            <input
              ref="inputRef"
              v-model="filtro"
              type="search"
              autocomplete="off"
              placeholder="Buscar..."
              class="h-11 w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo pl-10 pr-9 text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none"
              @focus="mostrarSugerencias = true"
              @input="mostrarSugerencias = true"
              @blur="ocultarSugerencias"
            />
            <button
              v-if="filtro"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-lyer-muted hover:text-lyer-fg"
              @mousedown.prevent="filtro = ''; inputRef?.focus()"
            >
              <X class="h-3.5 w-3.5" />
            </button>

            <div
              v-if="mostrarSugerencias && sugerencias.length"
              class="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-lyer-linea/50 bg-lyer-fondo shadow-xl"
            >
              <button
                v-for="item in sugerencias"
                :key="'sug-' + item.id"
                type="button"
                class="flex w-full items-center gap-2 border-b border-lyer-linea/30 px-3 py-2.5 text-left last:border-0 hover:bg-lyer-hover"
                @mousedown.prevent="elegirSugerencia(item)"
              >
                <Search class="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span class="flex-1 truncate text-xs font-semibold uppercase text-lyer-fg">{{ item.descripcion }}</span>
                <span v-if="verPrecios && item.precioBase != null" class="shrink-0 font-mono text-[11px] text-lyer-cyan">S/ {{ parseFloat(item.precioBase).toFixed(2) }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="min-h-0 flex-1 space-y-2 overflow-y-auto bg-lyer-hueco p-3">
          <button
            v-for="item in lista"
            :key="item.id"
            type="button"
            :class="[
              'flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors',
              estaSeleccionado(item.id)
                ? 'border-lyer-cyan/50 bg-lyer-hover'
                : 'border-lyer-linea/40 bg-lyer-fondo hover:border-lyer-cyan/30',
            ]"
            @click="toggleSeleccion(item)"
          >
            <div
              :class="[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2',
                estaSeleccionado(item.id) ? 'border-lyer-accent bg-lyer-accent text-[#1a0633]' : 'border-lyer-linea',
              ]"
            >
              <Check v-if="estaSeleccionado(item.id)" class="h-3 w-3" stroke-width="3" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold uppercase text-lyer-fg">{{ item.descripcion }}</p>
              <p v-if="item.responsable" class="truncate text-[11px] text-lyer-muted">{{ item.responsable }}</p>
            </div>
            <p v-if="verPrecios && item.precioBase != null" class="shrink-0 text-right font-mono text-sm font-bold text-lyer-cyan">
              S/ {{ parseFloat(item.precioBase).toFixed(2) }}
            </p>
          </button>

          <div v-if="lista.length === 0" class="space-y-3 py-10 text-center">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {{ q ? `Sin resultados para “${filtro}”` : 'Catálogo vacío' }}
            </p>
            <button
              v-if="q"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-4 py-2 text-xs font-bold uppercase text-lyer-fg"
              @click="abrirCrear(filtro.trim())"
            >
              <Plus class="h-4 w-4" /> Crear “{{ filtro.trim() }}”
            </button>
          </div>
        </div>

        <div
          v-if="seleccionTemporales.length"
          class="max-h-24 shrink-0 overflow-y-auto border-t border-lyer-linea/40 bg-lyer-barra px-3 py-2.5"
        >
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="item in seleccionTemporales"
              :key="'sel-' + item.id"
              type="button"
              class="inline-flex max-w-full items-center gap-1 rounded-lg border border-lyer-cyan/30 bg-lyer-fondo px-2 py-1 text-[10px] font-semibold uppercase text-lyer-fg"
              @click="quitarSeleccionado(item.id)"
            >
              <span class="truncate">{{ item.descripcion }}</span>
              <X class="h-3 w-3 text-lyer-muted" />
            </button>
          </div>
        </div>

        <div class="flex shrink-0 items-center justify-between gap-3 border-t border-lyer-linea/50 bg-lyer-barra p-3 sm:p-4">
          <span class="text-[11px] font-semibold uppercase tracking-widest text-lyer-cyan">
            {{ seleccionTemporales.length }} sel.
          </span>
          <div class="flex gap-2">
            <button type="button" class="rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-lyer-muted hover:text-lyer-fg" @click="cerrar">
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-xl border border-lyer-accent/40 bg-lyer-boton px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-lyer-fg hover:bg-lyer-boton"
              @click="confirmar"
            >
              Confirmar
            </button>
          </div>
        </div>
      </template>

      <!-- CREAR -->
      <template v-else>
        <div class="flex-1 space-y-4 overflow-y-auto bg-lyer-hueco p-5 sm:p-6">
          <label class="block space-y-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-lyer-fg">
              Descripción
              <span class="text-lyer-accent">*</span>
            </span>
            <input
              ref="descInputRef"
              v-model="formNuevo.descripcion"
              type="text"
              :placeholder="esTercero ? 'Ej: Rectificado de motor' : 'Ej: Aceite 15W40'"
              class="h-12 w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none"
              @keydown.enter.prevent="esTercero ? responsableRef?.focus() : (verPrecios ? precioRef?.focus() : guardarNuevo())"
            />
          </label>
          <label v-if="esTercero" class="block space-y-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-lyer-fg">
              Responsable del tercero
              <span class="text-lyer-accent">*</span>
            </span>
            <input
              ref="responsableRef"
              v-model="formNuevo.responsable"
              type="text"
              placeholder="Empresa o persona"
              class="h-12 w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 text-sm text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none"
              @keydown.enter.prevent="verPrecios ? precioRef?.focus() : guardarNuevo()"
            />
          </label>
          <label v-if="verPrecios" class="block space-y-2">
            <span class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-lyer-fg">
              <span>Precio base (S/)</span>
              <span class="font-medium normal-case tracking-normal text-lyer-muted">Opcional</span>
            </span>
            <input
              ref="precioRef"
              v-model="formNuevo.precioBase"
              type="number"
              step="0.01"
              min="0"
              placeholder="Lo completas después en la orden"
              class="h-12 w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo px-4 font-mono text-sm text-lyer-cyan placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none"
              @keydown.enter.prevent="guardarNuevo"
            />
          </label>
        </div>
        <div class="flex shrink-0 gap-2 border-t border-lyer-linea/50 bg-lyer-barra p-4">
          <button
            type="button"
            class="flex-1 rounded-xl border border-lyer-linea/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-lyer-muted hover:text-lyer-fg disabled:opacity-60"
            :disabled="guardando"
            @click="volverSeleccion"
          >
            Volver
          </button>
          <button
            type="button"
            class="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-lyer-fg hover:bg-lyer-boton disabled:opacity-60"
            :disabled="guardando"
            @click="guardarNuevo"
          >
            <span v-if="guardando" class="loading loading-spinner loading-xs" />
            <Plus v-else class="h-4 w-4" />
            Guardar
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
