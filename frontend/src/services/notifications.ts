/**
 * Servicio de notificaciones - Mock para WhatsApp
 * 
 * Este servicio está preparado para integrarse con WhatsApp API en el futuro.
 * Actualmente solo registra en consola.
 */

import type { AuthUser } from '../types/domain';
import type { ReservaDto } from '../types/domain';

export interface NotificationPayload {
  phone: string;
  message: string;
}

/**
 * Envía un mensaje de WhatsApp
 * 
 * @param phone - Número de teléfono con formato internacional (ej: +573001234567)
 * @param message - Mensaje a enviar
 * @returns Promise<boolean> - Siempre true en modo mock
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
): Promise<boolean> {
  // TODO: Implementar integración con WhatsApp Business API
  // cuando se tenga la API key configurada
  
  console.log('📱 [WhatsApp Mock] Enviando mensaje:', {
    phone,
    message,
    timestamp: new Date().toISOString(),
  });

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Siempre retorna true en modo mock
  return true;
}

/**
 * Envía confirmación de reserva al usuario
 */
export async function sendReservationConfirmation(
  user: AuthUser,
  reserva: ReservaDto,
): Promise<boolean> {
  const message = `✅ *Confirmación de Reserva*\n\n`
    + `Hola ${user.nombres},\n\n`
    + `Tu reserva ha sido creada exitosamente.\n\n`
    + `📋 *Detalles:*\n`
    + `• Instalación: ${reserva.instalacion.nombre}\n`
    + `• Fecha: ${formatDate(reserva.fechaReserva)}\n`
    + `• Hora: ${formatTime(reserva.comienzaEn)} - ${formatTime(reserva.terminaEn)}\n\n`
    + `🆔 Código: #${reserva.id}`;

  // Teléfono del usuario (simulado - en futuro vendría del backend)
  const phone = await getUserPhone(user);

  return sendWhatsAppMessage(phone, message);
}

/**
 * Envía recordatorio de reserva antes de la hora
 */
export async function sendReservationReminder(
  user: AuthUser,
  reserva: ReservaDto,
): Promise<boolean> {
  const message = `⏰ *Recordatorio de Reserva*\n\n`
    + `Hola ${user.nombres},\n\n`
    + `Te recordamos que tienes una reserva proxima.\n\n`
    + `📋 *Detalles:*\n`
    + `• Instalación: ${reserva.instalacion.nombre}\n`
    + `• Fecha: ${formatDate(reserva.fechaReserva)}\n`
    + `• Hora: ${formatTime(reserva.comienzaEn)}\n\n`
    + `¡Nos vemos pronto!`;

  const phone = await getUserPhone(user);

  return sendWhatsAppMessage(phone, message);
}

/**
 * Envía notificación de cancelación
 */
export async function sendCancellationNotice(
  user: AuthUser,
  reserva: ReservaDto,
  razon: string,
): Promise<boolean> {
  const message = `❌ *Reserva Cancelada*\n\n`
    + `Hola ${user.nombres},\n\n`
    + `Tu reserva ha sido cancelada.\n\n`
    + `📋 *Detalles:*\n`
    + `• Instalación: ${reserva.instalacion.nombre}\n`
    + `• Fecha: ${formatDate(reserva.fechaReserva)}\n`
    + `• Razón: ${razon}\n\n`
    + `Si necesitas más información, contactanos.`;

  const phone = await getUserPhone(user);

  return sendWhatsAppMessage(phone, message);
}

/**
 * Envía notificación de cambio de estado
 */
export async function sendStatusChangeNotice(
  user: AuthUser,
  reserva: ReservaDto,
  nuevoEstado: string,
): Promise<boolean> {
  const estadoMensaje =
    nuevoEstado === 'CONFIRMADA'
      ? '✅ Tu reserva ha sido confirmada'
      : nuevoEstado === 'COMPLETADA'
        ? '🏆 Tu reserva se ha completado'
        : `📌 Estado: ${nuevoEstado}`;

  const message = `*${estadoMensaje}*\n\n`
    + `Hola ${user.nombres},\n\n`
    + `El estado de tu reserva #${reserva.id} ha cambiado.\n\n`
    + `• Nueva fecha: ${formatDate(reserva.fechaReserva)}\n`
    + `• Hora: ${formatTime(reserva.comienzaEn)}`;

  const phone = await getUserPhone(user);

  return sendWhatsAppMessage(phone, message);
}

// Helper: Obtener teléfono del usuario
async function getUserPhone(user: AuthUser): Promise<string> {
  // TODO: En futuro, obtener teléfono real del backend
  // Por ahora, simular un número
  if (user.correo) {
    // Convertir correo@dominio.edu.co a número simulado
    const numero = user.correo.split('@')[0].replace(/[^0-9]/g, '');
    return `+57${numero || '3000000000'}`;
  }
  return '+573000000000';
}

// Helper: Formatear fecha
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper: Formatear hora
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Exportar configuración para WhatsApp
export const WHATSAPP_CONFIG = {
  // TODO: Cargar desde .env cuando esté configurado
  apiKey: import.meta.env.VITE_WHATSAPP_API_KEY ?? '',
  phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID ?? '',
  fromNumber: import.meta.env.VITE_WHATSAPP_FROM_NUMBER ?? '',
  isConfigured: Boolean(import.meta.env.VITE_WHATSAPP_API_KEY),
};
