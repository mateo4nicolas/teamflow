import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Etiquetas por defecto — se usan mientras no haya una fila guardada en BD
// para esa key, y sirven de referencia de qué keys existen.
export const DEFAULT_HEADERS = {
  group_arte_extra: 'ARTE EXTRA',
  group_planificacion: 'PLANIFICACIÓN',
  group_diseno: 'DISEÑO',
  group_publicacion: 'PUBLICACIÓN',
  group_pauta: 'PAUTA',

  col_cliente: 'CLIENTE',
  col_formato: 'FORMATO',
  col_solicita: 'SOLICITA',
  col_fecha_solicitud: 'FECHA SOLICITUD',
  col_codigo: 'CÓDIGO',
  col_copy_diseno: 'COPY DISEÑO',
  col_copy_red_social: 'COPY RED SOCIAL',
  col_aprobacion: 'APROBACIÓN',
  col_fecha_entrega: 'FECHA ENTREGA',
  col_disenado: 'DISEÑADO',
  col_link: 'LINK',
  col_publicacion: 'PUBLICACIÓN',
  col_publicacion_check: '✓',
  col_fecha_publicacion: 'FECHA',
  col_presupuesto: 'PRESUPUESTO',
  col_duracion: 'DURACIÓN',
  col_pauta: 'PAUTA',
  col_pauta_check: '✓',
}

// Agrupado para mostrar el modal de edición ordenado y con contexto
export const HEADER_GROUPS = [
  { title: 'Encabezados de grupo', keys: ['group_arte_extra', 'group_planificacion', 'group_diseno', 'group_publicacion', 'group_pauta'] },
  { title: 'Columnas', keys: [
    'col_cliente', 'col_formato', 'col_solicita', 'col_fecha_solicitud', 'col_codigo',
    'col_copy_diseno', 'col_copy_red_social', 'col_aprobacion', 'col_fecha_entrega',
    'col_disenado', 'col_link', 'col_publicacion', 'col_publicacion_check',
    'col_fecha_publicacion', 'col_presupuesto', 'col_duracion', 'col_pauta', 'col_pauta_check',
  ] },
]

export function useContenidoExtraHeaders() {
  const [headers, setHeaders] = useState({}) // { key: label } solo las guardadas en BD
  const [loading, setLoading] = useState(true)

  const fetchHeaders = useCallback(async () => {
    const { data, error } = await supabase.from('contenido_extra_headers').select('*')
    if (error) { console.error('fetchContenidoExtraHeaders error:', error); setLoading(false); return }
    const map = {}
    for (const row of data || []) map[row.key] = row.label
    setHeaders(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHeaders()
    const channel = supabase
      .channel('contenido-extra-headers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contenido_extra_headers' }, fetchHeaders)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchHeaders])

  function labelFor(key) {
    return headers[key] ?? DEFAULT_HEADERS[key] ?? key
  }

  async function saveHeaders(changes) {
    // changes: { key: label, ... } — solo las que cambiaron
    const rows = Object.entries(changes).map(([key, label]) => ({ key, label }))
    if (rows.length === 0) return { error: null }
    const { error } = await supabase.from('contenido_extra_headers').upsert(rows, { onConflict: 'key' })
    if (!error) fetchHeaders()
    return { error }
  }

  return { headers, loading, labelFor, saveHeaders }
}
