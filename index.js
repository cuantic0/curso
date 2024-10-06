const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Generar código QR para escanear
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('¡Autenticado!');
});

client.on('ready', () => {
    console.log('El bot está listo!');
});

client.on('message', msg => {
    if (msg.body === '!ping') {
        msg.reply('¡Pong!');
    }
});

client.initialize();
