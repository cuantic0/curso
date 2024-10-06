const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, './auth_info'));

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error instanceof Boom && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to', lastDisconnect.error, ', reconnecting', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('opened connection');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        const messageType = Object.keys(message.message)[0];
        const text = message.message.conversation || message.message.extendedTextMessage?.text || "";

        console.log(JSON.stringify(m, undefined, 2));
        console.log('replying to', message.key.remoteJid);

        // Check if the message is sent by the bot itself
        if (message.key.fromMe) return;

        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(message.key.remoteJid, { text: 'pong' });
        } else if (text.toLowerCase() === 'pong') {
            await sock.sendMessage(message.key.remoteJid, { text: 'ping' });
        }
    });
}

// run in main file
connectToWhatsApp();
