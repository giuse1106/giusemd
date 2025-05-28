// cc to giuse

const singleExecution = function () {
    let executed = true;
    return function (context, func) {
        const wrapper = executed ? function () {
            if (func) {
                const result = func.apply(context, arguments);
                func = null;
                return result;
            }
        } : function () {};
        executed = false;
        return wrapper;
    };
}();

import fetch from "node-fetch";
import ytSearch from "yt-search";
import axios from "axios";

// Formati audio e video supportati
const audioFormats = ["mp3", "m4a", "webm", "acc", "flac", "opus", "ogg", "wav"];
const videoResolutions = ["360", "480", "720", "1080", "1440", "4k"];

// Funzione per scaricare video/audio
const downloader = {
    async download(url, format) {
        if (!audioFormats.includes(format) && !videoResolutions.includes(format)) {
            throw new Error("Formato non supportato.");
        }
        try {
            const { data } = await axios.get(`https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            if (data?.success) {
                const downloadUrl = await downloader.checkProgress(data.id);
                return {
                    id: data.id,
                    image: data.info.image,
                    title: data.title,
                    downloadUrl: downloadUrl
                };
            } else {
                throw new Error("Errore nel recupero dei dettagli del video.");
            }
        } catch (error) {
            throw error;
        }
    },

    async checkProgress(id) {
        try {
            while (true) {
                const { data } = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, {
                    headers: { "User-Agent": "Mozilla/5.0" }
                });
                if (data?.success && data.progress === 1000) {
                    return data.download_url;
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } catch (error) {
            throw error;
        }
    }
};

// Funzione principale per gestire i comandi di download
const handleCommand = async (msg, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) {
            return conn.reply(msg.chat, "💣 Inserisci il nome della musica.", msg);
        }
        const searchResults = await ytSearch(text);
        if (!searchResults.all.length) {
            return msg.reply("Nessun risultato trovato.");
        }
        const video = searchResults.all[0];
        const { title, thumbnail, timestamp, views, ago, url, author } = video;
        const formattedViews = new Intl.NumberFormat().format(views);
        const videoInfo = `
*Titolo:* ${title}
*Durata:* ${timestamp}
*Visualizzazioni:* ${formattedViews}
*Canale:* ${author?.name || "Sconosciuto"}
*Pubblicato:* ${ago}
`.trim();

        const thumbData = (await conn.getFile(thumbnail))?.data;

        // Invia le informazioni del video (senza immagine)
        await conn.sendMessage(msg.chat, {
            text: videoInfo,
            contextInfo: {
                externalAdReply: {
                    title: "YouTube Downloader",
                    body: "꧁ ĝ̽̓̀͑ỉ͔͖̜͌ư̡͕̭̇s̠҉͍͊ͅẹ̿͋̒̕ẹ̿͋̒̕ ꧂ 「 ᵇᵒᵗ 」",
                    mediaType: 1,
                    previewType: 0,
                    mediaUrl: url,
                    sourceUrl: url,
                    renderLargerThumbnail: true,
                    thumbnail: thumbData // Puoi anche commentare questa riga se non vuoi l'anteprima del thumbnail
                }
            }
        });

        command = command.replace(usedPrefix, ""); // Rimuove il prefisso

        if (command === "play") {
            const downloadData = await downloader.download(url, "mp3");
            await conn.sendMessage(msg.chat, {
                audio: { url: downloadData.downloadUrl },
                mimetype: "audio/mpeg"
            }, { quoted: msg });
        } else if (command === "play2" || command === "ytmp4") {
            const downloadData = await downloader.download(url, "mp4");
            await conn.sendMessage(msg.chat, {
                video: { url: downloadData.downloadUrl },
                mimetype: "video/mp4",
                caption: "🎥 *Video scaricato con successo!*"
            }, { quoted: msg });
        } else {
            throw "Comando non riconosciuto.";
        }
    } catch (error) {
        return msg.reply(`⚠ *Errore:* ${error.message}`);
    }
};

// Registrazione dei comandi supportati
handleCommand.command = handleCommand.help = ["play", "ytmp4", "play2"];
export default handleCommand;
