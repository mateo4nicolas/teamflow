import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { usePushNotifications, isIOSDevice, isStandalonePWA, pushSupported } from '../hooks/usePushNotifications'
import styles from './Configuracion.module.css'

export default function ConfiguracionPage() {
  const { theme, toggleTheme } = useTheme()
  const {
    eligible, permission, subscribing, subscribed, checkingSub,
    subscribe, unsubscribe, testPush,
  } = usePushNotifications()

  const [pushMsg, setPushMsg] = useState(null)

  async function handleActivar() {
    setPushMsg(null)
    const { error } = await subscribe()
    setPushMsg(error ? { type: 'error', text: error.message || 'No se pudo activar' } : { type: 'ok', text: 'Notificaciones activadas' })
  }

  async function handleDesactivar() {
    setPushMsg(null)
    const { error } = await unsubscribe()
    setPushMsg(error ? { type: 'error', text: 'No se pudo desactivar' } : { type: 'ok', text: 'Notificaciones desactivadas en este dispositivo' })
  }

  async function handleProbar() {
    setPushMsg(null)
    const { error } = await testPush()
    setPushMsg(error
      ? { type: 'error', text: 'No se pudo enviar la prueba' }
      : { type: 'ok', text: 'Prueba enviada — debería llegarte en unos segundos' })
  }

  const iOS = isIOSDevice()
  const standalone = isStandalonePWA()
  const supported = pushSupported()
  const showControls = eligible && supported && !(iOS && !standalone)

  let statusLabel = 'Sin activar'
  let statusClass = styles.statusOff
  if (!eligible) { statusLabel = 'No aplica'; statusClass = styles.statusChecking }
  else if (checkingSub) { statusLabel = 'Verificando...'; statusClass = styles.statusChecking }
  else if (subscribed && permission === 'granted') { statusLabel = 'Activado'; statusClass = styles.statusOn }
  else if (permission === 'denied') { statusLabel = 'Bloqueado en el navegador'; statusClass = styles.statusOff }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Configuración</h1>
      <p className={styles.pageSubtitle}>Todo lo tuyo en un solo sitio.</p>

      {/* Apariencia */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Apariencia</h2>
        <div className={styles.rowBetween}>
          <div>
            <h3 className={styles.subTitle}>{theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}</h3>
            <p className={styles.hint}>Se aplica a todas las pantallas de la app, no solo a esta.</p>
          </div>
          <button className="btn btn-ghost" onClick={toggleTheme}>
            Cambiar a {theme === 'dark' ? 'claro' : 'oscuro'}
          </button>
        </div>
      </section>

      {/* Notificaciones */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Avisos en este dispositivo</h2>
        <div className={styles.rowBetween}>
          <div>
            <h3 className={styles.subTitle}>Estado</h3>
            <p className={styles.hint}>
              {!eligible ? 'Los Admin no reciben avisos push.'
                : !supported ? 'Tu navegador no soporta notificaciones push.'
                : iOS && !standalone ? 'En iPhone: agrega la app a tu pantalla de inicio primero (Compartir → Agregar a pantalla de inicio).'
                : subscribed ? 'Este aparato está registrado para recibir avisos.'
                : 'Este aparato aún no está registrado para recibir avisos.'}
            </p>
          </div>
          <span className={`${styles.statusBadge} ${statusClass}`}>{statusLabel}</span>
        </div>

        {showControls && (
          <>
            <div className={styles.btnRow}>
              <button className="btn btn-primary" onClick={handleActivar} disabled={subscribing || subscribed}>
                🔔 Activar
              </button>
              <button className="btn btn-ghost" onClick={handleProbar} disabled={subscribing || !subscribed}>
                📩 Probar
              </button>
              <button className="btn btn-danger" onClick={handleDesactivar} disabled={subscribing || !subscribed}>
                🔕 Desactivar
              </button>
            </div>
            {pushMsg && (
              <p className={pushMsg.type === 'ok' ? styles.msgOk : styles.msgError}>{pushMsg.text}</p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
