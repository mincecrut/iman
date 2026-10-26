#!/usr/bin/env python3
"""Публикует аят дня в Telegram-канал. Только стандартная библиотека.

Переменные окружения:
  TELEGRAM_BOT_TOKEN  токен бота (секрет репозитория)
  TELEGRAM_CHAT_ID    например @quran_subtitl (бот должен быть админом канала)
  API_BASE            необязательно, для тестов (по умолчанию api.alquran.cloud)
  TELEGRAM_API        необязательно, для тестов (по умолчанию api.telegram.org)
Ключ --dry-run: только напечатать сообщение, ничего не отправляя.
"""
import datetime
import html
import json
import os
import sys
import time
import urllib.error
import urllib.request

TOTAL_AYAHS = 6236                      # всего аятов в Коране
START = datetime.date(2026, 1, 1)       # с этого дня отсчёт: аят №1


def get_json(url, data=None, retries=3):
    body = json.dumps(data).encode() if data is not None else None
    headers = {"Content-Type": "application/json", "User-Agent": "iman-bot"}
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            payload = e.read().decode("utf-8", "replace")
            if e.code == 429 and attempt < retries - 1:
                try:
                    wait = int(json.loads(payload)["parameters"]["retry_after"])
                except Exception:
                    wait = 5
                time.sleep(min(wait, 60))
                continue
            if e.code >= 500 and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"HTTP {e.code} от {url.split('/bot')[0]}: {payload[:200]}")
        except urllib.error.URLError as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"Сеть недоступна: {e.reason}")


def pick(day=None):
    """Номер аята (1..6236) для дня: идём по Корану подряд и начинаем заново."""
    day = day or datetime.date.today()
    return (day - START).days % TOTAL_AYAHS + 1


def build_message(api, number):
    j = get_json(f"{api}/ayah/{number}/editions/quran-uthmani,ru.kuliev")
    if j.get("code") != 200 or len(j.get("data", [])) < 2:
        raise RuntimeError("Неожиданный ответ API Корана")
    ar, ru = j["data"][0], j["data"][1]
    name = ar["surah"]["englishName"]
    surah, ayah = ar["surah"]["number"], ar["numberInSurah"]
    text = (f"<b>Аят дня</b>\n\n{html.escape(ar['text'])}\n\n"
            f"{html.escape(ru['text'].replace('ллах', 'ллаh'))}\n\n"
            f"<i>Сура {surah} «{html.escape(name)}», аят {ayah}</i>")
    if len(text) > 4096:
        raise RuntimeError("Сообщение длиннее 4096 символов")
    return text


def main():
    dry = "--dry-run" in sys.argv
    api = os.environ.get("API_BASE", "https://api.alquran.cloud/v1")
    number = pick()
    text = build_message(api, number)
    if dry:
        print(text)
        return 0
    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print("Не заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID", file=sys.stderr)
        return 2
    tg = os.environ.get("TELEGRAM_API", "https://api.telegram.org")
    r = get_json(f"{tg}/bot{token}/sendMessage",
                 {"chat_id": chat, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True})
    if not r.get("ok"):
        print("Telegram отказал:", r.get("description"), file=sys.stderr)
        return 1
    print(f"Отправлено: аят №{number}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except RuntimeError as e:
        # сообщение без токена: URL с токеном не печатаем
        print("Ошибка:", str(e).replace(os.environ.get("TELEGRAM_BOT_TOKEN", "\0"), "***"), file=sys.stderr)
        sys.exit(1)
