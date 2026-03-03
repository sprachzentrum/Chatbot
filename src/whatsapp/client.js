const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');

let client = null;
let qrCodeData = null;
let connectionStatus = 'disconnected';
let statusListeners = [];

function notifyStatusChange() {
  for (const listener of statusListeners) {
    listener(connectionStatus, qrCodeData);
  }
}

function onStatusChange(listener) {
  statusListeners.push(listener);
}

function createClient() {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '..', '..', '.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', async (qr) => {
    console.log('[WhatsApp] QR-Code empfangen. Bitte im Admin-Panel scannen.');
    connectionStatus = 'qr';
    try {
      qrCodeData = await qrcode.toDataURL(qr);
    } catch (err) {
      console.error('[WhatsApp] QR-Code Fehler:', err);
    }
    notifyStatusChange();
  });

  client.on('ready', () => {
    console.log('[WhatsApp] Client ist verbunden und bereit!');
    connectionStatus = 'connected';
    qrCodeData = null;
    notifyStatusChange();
  });

  client.on('authenticated', () => {
    console.log('[WhatsApp] Authentifizierung erfolgreich.');
    connectionStatus = 'authenticated';
    notifyStatusChange();
  });

  client.on('auth_failure', (msg) => {
    console.error('[WhatsApp] Authentifizierung fehlgeschlagen:', msg);
    connectionStatus = 'auth_failure';
    notifyStatusChange();
  });

  client.on('disconnected', (reason) => {
    console.log('[WhatsApp] Verbindung getrennt:', reason);
    connectionStatus = 'disconnected';
    qrCodeData = null;
    notifyStatusChange();
  });

  return client;
}

function getClient() {
  return client;
}

function getStatus() {
  return { status: connectionStatus, qrCode: qrCodeData };
}

async function sendMessage(phone, message) {
  if (!client || connectionStatus !== 'connected') {
    throw new Error('WhatsApp-Client ist nicht verbunden');
  }
  const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
  return client.sendMessage(chatId, message);
}

module.exports = { createClient, getClient, getStatus, sendMessage, onStatusChange };
