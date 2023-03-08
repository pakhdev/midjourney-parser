<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


## Description

This is a Discord parser that extracts only messages from the Midjourney bot based on selected keywords found in `src/parser/data/parsing-keywords.data.ts`.

The following data will be extracted:
- Image link
- Keywords
- Image ID (to avoid repeats)
- User ID (for searching by user)
- Detection of whether the image is upscaled
- Link to the message (to generate an upscaled image if needed)

All data will be saved in the parser DB by default. A Docker container with MySQL is included in the `docker-compose.yaml` file. The idea is that the content will be sent to Aihance as the final result, and this option can be activated in the `.env` file.

## Installation

```bash
$ npm install
```

1) Enter the Midjourney Discord server.
2) Select one of the channels called "newbies-31" or any other number.
3) Open the console (F12).
4) In the Network tab, search and copy the superProperties and authorization from request headers to the .env file.
5) Run the following script and copy the guild and channel IDs to the .env file:
```
function getSelectedRoom() {
    let uls = document.getElementsByTagName('ul');
    for (const ul of uls) {
      if (ul.className.includes('content')) {
        let lis = ul.getElementsByTagName('li');
        for (const li of lis) {
          const sectionClass = li.className;
          const sectionName = li.getAttribute('data-dnd-name');
          if(
            sectionName &&
            sectionName.includes('newbies-') &&
            sectionClass.includes('selected')
          ){
            const sectionIds = li.getElementsByTagName('a')[0].getAttribute('href').match(/^\/channels\/(\d+)\/(\d+)/);
            return { name: sectionName, guildId: sectionIds[1], channelId: sectionIds[2] };
          }
        }
      }
    }
    return false;
}
getSelectedRoom();
```
6) Configure the rest of the options in the .env file, if necessary.

## Running the app

```bash
$ npm run start
```

## Overview

This is a parser service that can parse content and either store it in a local database or send it directly to Aihance. The service has two options:

1. Parse content to the parser database without sending it to Aihance. Later, the `toAihance` route can be used to send the parsed content to Aihance.
2. Parse content and directly send it to Aihance by activating the `SEND_TO_AIHANCE` option.

## Routes

### Parse Content to Local DB

To parse content to the local database, use the following route:
```
localhost:1338/parser/parse
```
This route will parse the content and store it in the parser database. If the `SEND_TO_AIHANCE` option is enabled in the `.env` file, the parsed content will also be sent to Aihance and downloaded.

### Send Content to Aihance

If content has been previously parsed and stored in the parser database with the `SEND_TO_AIHANCE` option deactivated, it can be sent to Aihance using the following route:

```
localhost:1338/parser/toAihance
```
This route will send the parsed content to Aihance for further processing.

## Configuration

The service can be configured using the `.env` file. The `SEND_TO_AIHANCE` option can be set to `true` or `false` to enable or disable direct sending of parsed content to Aihance.