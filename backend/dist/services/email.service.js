"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const resend_1 = require("resend");
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new resend_1.Resend(resendApiKey) : null;
class EmailService {
    constructor() {
        this.fromEmail = 'UniDeportes <onboarding@resend.dev>';
    }
    async sendReservationConfirmation(to, nombreUsuario, fechaReserva, horaInicio, horaFin, instalacion, codigoVerificacion) {
        if (!resend) {
            console.log('Email service not configured, skipping confirmation email');
            return false;
        }
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: `✅ Confirmación de Reserva - ${fechaReserva}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #005cab; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
              .info { margin: 15px 0; }
              .label { font-weight: bold; color: #333; }
              .value { color: #005cab; }
              .code { background: #e9ecef; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 2px; border-radius: 4px; }
              .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏟️ UniDeportes</h1>
              <p>Confirmación de Reserva</p>
            </div>
            <div class="content">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Tu reserva ha sido creada exitosamente. Aquí están los detalles:</p>
              
              <div class="info">
                <span class="label">📅 Fecha:</span> <span class="value">${fechaReserva}</span>
              </div>
              <div class="info">
                <span class="label">⏰ Horario:</span> <span class="value">${horaInicio} - ${horaFin}</span>
              </div>
              <div class="info">
                <span class="label">📍 Instalación:</span> <span class="value">${instalacion}</span>
              </div>
              
              ${codigoVerificacion ? `
              <div class="info">
                <p>Tu código de verificación:</p>
                <div class="code">${codigoVerificacion}</div>
              </div>
              ` : ''}
              
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                Por favor, presenta este código al vigilante cuando llegues a la instalación.
              </p>
            </div>
            <div class="footer">
              <p>Universidad del Magdalena - Sistema de Reservas Deportivas</p>
            </div>
          </body>
          </html>
        `,
            });
            return true;
        }
        catch (error) {
            console.error('Error sending confirmation email:', error);
            return false;
        }
    }
    async sendReservationReminder(to, nombreUsuario, fechaReserva, horaInicio, horaFin, instalacion, minutosRestantes) {
        if (!resend) {
            return false;
        }
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: `⏰ Recordatorio: Tu reserva es en ${minutosRestantes} minutos`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
              .info { margin: 15px 0; }
              .label { font-weight: bold; color: #333; }
              .value { color: #005cab; }
              .cta { display: inline-block; background: #005cab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⏰ Recordatorio</h1>
              <p>Tu reserva está por comenzar</p>
            </div>
            <div class="content">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Tu reserva comienza en <strong>${minutosRestantes} minutos</strong>. No olvides asistir.</p>
              
              <div class="info">
                <span class="label">📅 Fecha:</span> <span class="value">${fechaReserva}</span>
              </div>
              <div class="info">
                <span class="label">⏰ Horario:</span> <span class="value">${horaInicio} - ${horaFin}</span>
              </div>
              <div class="info">
                <span class="label">📍 Instalación:</span> <span class="value">${instalacion}</span>
              </div>
              
              <center>
                <a href="#" class="cta">Ver mis reservas</a>
              </center>
            </div>
            <div class="footer">
              <p>Universidad del Magdalena - Sistema de Reservas Deportivas</p>
            </div>
          </body>
          </html>
        `,
            });
            return true;
        }
        catch (error) {
            console.error('Error sending reminder email:', error);
            return false;
        }
    }
    async sendCancellationNotice(to, nombreUsuario, fechaReserva, horaInicio, horaFin, instalacion, razon) {
        if (!resend) {
            return false;
        }
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: `❌ Reserva Cancelada - ${fechaReserva}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
              .info { margin: 15px 0; }
              .label { font-weight: bold; color: #333; }
              .value { color: #dc3545; }
              .reason { background: #ffe6e6; padding: 10px; border-left: 4px solid #dc3545; margin: 15px 0; }
              .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>❌ Reserva Cancelada</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Tu reserva ha sido cancelada. Aquí están los detalles:</p>
              
              <div class="info">
                <span class="label">📅 Fecha:</span> <span class="value">${fechaReserva}</span>
              </div>
              <div class="info">
                <span class="label">⏰ Horario:</span> <span class="value">${horaInicio} - ${horaFin}</span>
              </div>
              <div class="info">
                <span class="label">📍 Instalación:</span> <span class="value">${instalacion}</span>
              </div>
              
              ${razon ? `
              <div class="reason">
                <strong>Razón:</strong> ${razon}
              </div>
              ` : ''}
              
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                Si tienes alguna duda, contacta a administración.
              </p>
            </div>
            <div class="footer">
              <p>Universidad del Magdalena - Sistema de Reservas Deportivas</p>
            </div>
          </body>
          </html>
        `,
            });
            return true;
        }
        catch (error) {
            console.error('Error sending cancellation email:', error);
            return false;
        }
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map