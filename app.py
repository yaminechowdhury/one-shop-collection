import base64
import io
import os
import random
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageDraw
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "").strip()
HF_MODEL = "Qwen/Qwen2.5-7B-Instruct"
HF_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/v1/chat/completions"

OCCASIONS_50_PLUS = [
    "Birthday party", "Traditional occasion", "Wedding reception", "Holud ceremony",
    "Engagement party", "Anniversary dinner", "Eid gathering", "Puja celebration",
    "Pohela Boishakh festival", "Family get-together", "Office meeting", "Corporate presentation",
    "Job interview", "Client lunch", "Convocation ceremony", "Freshers reception",
    "Farewell party", "College/University fest", "Seminar or workshop", "Networking event",
    "Smart-casual dinner date", "Candlelight dinner", "Coffee hangout", "Rooftop hangout",
    "Weekend brunch", "Shopping trip", "City outing", "Movie night",
    "Concert or live show", "Cultural program", "Art exhibition", "Book fair visit",
    "Museum tour", "Road trip", "Beach vacation", "Hill station trip",
    "Resort staycation", "Garden party", "Housewarming party", "Baby shower",
    "Graduation party", "Reunion event", "Club/Lounge night", "Festive night party",
    "Award night", "Photo shoot session", "Pre-wedding shoot", "Casual Friday at work",
    "Iftar party", "New Year celebration", "Winter picnic", "Outdoor brunch"
]


def decode_image_source(src: str):
    if not src:
        return None
    try:
        if src.startswith("http://") or src.startswith("https://"):
            resp = requests.get(src, timeout=10)
            if resp.status_code == 200:
                img = Image.open(io.BytesIO(resp.content)).convert("RGB")
                img.thumbnail((512, 512))
                return img
            return None

        encoded = src.split(",", 1)[1] if "," in src else src
        raw = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        img.thumbnail((512, 512))
        return img
    except Exception:
        return None


def build_combined_board(persona: str, items: list):
    w, h = 740, 320
    board = Image.new("RGB", (w, h), (248, 250, 252))
    draw = ImageDraw.Draw(board)
    draw.rectangle([0, 0, w, 46], fill=(13, 35, 58))
    style_text = "Men's" if persona == "men" else "Women's"
    draw.text((20, 15), f"One Shop Collection - {style_text} Combined Outfit Look", fill=(243, 156, 18))

    for idx in range(3):
        x = 30 + idx * 230
        y = 65
        if idx < len(items) and items[idx]:
            item = items[idx]
            name = str(item.get("name", f"Item {idx + 1}"))
            price = item.get("price", 0)
            p_img = decode_image_source(str(item.get("img", "")))
            if p_img:
                p_img = p_img.resize((200, 175))
                board.paste(p_img, (x, y))
            else:
                draw.rectangle([x, y, x + 200, y + 175], fill=(226, 232, 240))
                draw.text((x + 12, y + 80), name[:22], fill=(30, 41, 59))
            draw.text((x, y + 184), name[:26], fill=(26, 54, 93))
            draw.text((x, y + 202), f"৳{price}", fill=(220, 38, 38))
        else:
            draw.rectangle([x, y, x + 200, y + 175], fill=(241, 245, 249))
            draw.text((x + 12, y + 80), "Not selected", fill=(100, 116, 139))

    buf = io.BytesIO()
    board.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


def build_fallback_note(persona: str, items: list):
    names = [str(i.get("name", "")).strip() for i in items if i and i.get("name")]
    main_item = names[0] if len(names) >= 1 else "এই শার্ট/টি-শার্ট"
    second_item = names[1] if len(names) >= 2 else "এই প্যান্ট"

    pant_colors = random.choice([
        "নেভি ব্লু বা চারকোল গ্রে ফরমাল/জিন্স প্যান্ট",
        "ব্ল্যাক বা অলিভ গ্রিন জিন্স/ফরমাল প্যান্ট",
        "বেইজ বা ডার্ক ব্রাউন ফরমাল/চিনো প্যান্ট"
    ])
    top_colors = random.choice([
        "সাদা, স্কাই ব্লু বা প্যাস্টেল শার্ট/টি-শার্ট",
        "ব্ল্যাক, অফ-হোয়াইট বা মেরুন টি-শার্ট/শার্ট",
        "অলিভ, চারকোল বা ক্রিম শার্ট/টি-শার্ট"
    ])
    shoe_colors = random.choice([
        "ট্যান ব্রাউন বা ডার্ক চকলেট লোফার/শ্যুজ",
        "ক্লিন হোয়াইট স্নিকার্স বা ব্ল্যাক লোফার/শ্যুজ",
        "ব্ল্যাক লেদার লোফার বা ব্রাউন সুয়েড শ্যুজ"
    ])

    events_str = ", ".join(random.sample(OCCASIONS_50_PLUS, 3))

    return (
        f"এই {main_item}-এর সাথে তোমার {pant_colors} মানাবে আর সাথে {shoe_colors} মানাবে। "
        f"আবার এই {second_item}-এর সাথে {top_colors} মানাবে এবং সাথে {shoe_colors} মানাবে।\n\n"
        f"এই কম্বোটি {events_str}-এর মতো ইভেন্টে পরা যাবে।"
    )


def generate_hf_stylist_note(persona: str, items: list):
    if not HF_API_TOKEN:
        return None, "HF_API_TOKEN সেট করা নেই"

    style_word = "Men's" if persona == "men" else "Women's"
    item_lines = "\n".join([
        f"- {i.get('name', 'Item')} (Category: {i.get('category', 'General')}, Desc: {i.get('desc', '')})"
        for i in items if i
    ])
    sample_events = ", ".join(OCCASIONS_50_PLUS)

    prompt = (
        f"You are a fashion stylist for {style_word} outfits.\n"
        f"Selected items:\n{item_lines}\n\n"
        f"Write the response in natural Bengali following this exact structure:\n"
        f"1. State which color formal/jeans pant or shirt/t-shirt matches the selected top/bottom items, and which color loafer/shoes matches best.\n"
        f"2. End with which specific event(s) this combo fits best from this list of 50+ occasions: [{sample_events}].\n"
        f"Keep it concise, friendly, and clear (around 60-90 words)."
    )

    try:
        resp = requests.post(
            HF_URL,
            headers={
                "Authorization": f"Bearer {HF_API_TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "model": HF_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 220,
                "temperature": 0.75,
            },
            timeout=25,
        )
        if resp.status_code != 200:
            return None, f"HF status {resp.status_code}"

        data = resp.json()
        choices = data.get("choices") or []
        content = (choices[0].get("message", {}).get("content") or "").strip() if choices else ""
        if not content:
            return None, "Empty AI response"
        return content, None
    except Exception as exc:
        return None, str(exc)[:60]


@app.route("/api/generate-look", methods=["POST"])
def generate_look():
    data = request.get_json(silent=True) or {}
    persona = data.get("persona", "men")
    items = data.get("items", [])

    if not items:
        return jsonify({"ok": False, "error": "No items selected"}), 400

    board_img = build_combined_board(persona, items)
    ai_note, err = generate_hf_stylist_note(persona, items)

    if ai_note:
        return jsonify({
            "ok": True,
            "mode": "huggingface-ai",
            "image": board_img,
            "stylist_note": ai_note,
            "message": f"Hugging Face AI ({HF_MODEL}) থেকে স্টাইল ও ইভেন্ট সাজেশন তৈরি হয়েছে।"
        })

    fallback_note = build_fallback_note(persona, items)
    return jsonify({
        "ok": True,
        "mode": "fallback",
        "image": board_img,
        "stylist_note": fallback_note,
        "message": f"স্টাইল ও ইভেন্ট সাজেশন দেখানো হয়েছে ({err})।"
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)