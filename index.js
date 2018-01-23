const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const parser = require('xml2json');

const url = `https://playerservices.streamtheworld.com/api/livestream?station=web10&transports=http%2Chls%2Chlsts&version=1.9&request.preventCache=${new Date().getTime()}`;
const author = 'SLAM! - Non-Stop';
const outputFile = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents', 'Slam-non-stop.m3u');

fetch(url)
    .then(response => response.text())
    .then(xml => JSON.parse(parser.toJson(xml)))
    .then(json => {
        const mountpoint = json.live_stream_config.mountpoints.mountpoint[0];
        const servers = mountpoint.servers.server;
        const mount = mountpoint.mount;
        const urls = servers.map(server => `#EXTINF:,${author} (${server.sid})\n${server.ports.port.type}://${server.ip}/${mount}`).join('\n');

        writeM3UFile(urls, outputFile);
    })
    .catch(err => console.log(`[-] An error occured fetching the data: ${err}`));

function writeM3UFile(data, path) {
    const playlistPrefix = '#EXTM3U\n';
    fs.writeFile(outputFile, playlistPrefix + data, err => {
        if (err) { 
            console.log(`[-] An error occured writing the file: ${err}`);
            return;
        }
        console.log(`[+] Playlist saved to: ${outputFile}`);
    }); 
}