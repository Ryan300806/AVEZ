import "dotenv/config";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export async function sendTelegramMessage(
    message: string
): Promise<void> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken) {
        throw new Error("TELEGRAM_BOT_TOKEN belum ditemukan di .env");
    }

    if (!chatId) {
        throw new Error("TELEGRAM_CHAT_ID belum ditemukan di .env");
    }

    const response = await fetch(
        `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
            `Telegram API error ${response.status}: ${errorBody}`
        );
    }
}