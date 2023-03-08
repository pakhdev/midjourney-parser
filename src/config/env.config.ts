export const envConfiguration = () => ({
    guildId: process.env.GUILD_ID,
    channelId: process.env.CHANNEL_ID,
    pauseBetween: process.env.PAUSE_BETWEEN,
    maxAttempts: process.env.MAX_ATTEMPTS,
    authorization: process.env.AUTHORIZATION,
    superProperties: process.env.SUPER_PROPERTIES,
    maxThreads: process.env.MAX_THREADS,
    readUntil: process.env.READ_UNTIL,
    sendToAihance: process.env.SEND_TO_AIHANCE,
    aihanceUrl: process.env.AIHANCE_URL,
    aihanceToken: process.env.AIHANCE_TOKEN,
});
