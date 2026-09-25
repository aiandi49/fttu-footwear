# F.T.T.U Footwear

A concept footwear line — sneakers, boots, sandals, flip-flops, heels, hiking boots, kids' and baby shoes, snow gear, and the first piece of a clothing line — shown two ways:

- **`index.html` — the showroom (the engine).** The landing page. Visitors type what they want; Claude answers from the catalog, pictures show up right in the chat, and the three side cards fill with the design, its other colorways and its details. Tap the big picture to see it full screen. It looks the same all year.
- **`guide.html` — the guide (the GUB).** A big swipeable lookbook of all 41 images, the F.T.U. emblem and what it means, every category with its colorways, the seasonal calendar, the apparel preview, the roadmap and the 5 W's of manufacturing. Its colors change with the season on their own.

Every image is an AI-generated concept render. Nothing is for sale yet. Every picture on both pages opens full size when tapped.

Both pages have a light/dark toggle. The showroom opens dark and the guide opens light; once someone picks, both pages remember it.

## What's in the folder

```
fttu-footwear/
├── index.html          Showroom (engine) — the landing page
├── guide.html          Guide hub — seasonal look + lookbook carousel
├── api/
│   └── chat.js         Serverless function: keeps the API key secret, talks to Claude
├── css/
│   ├── engine.css      Showroom styles (the standard engine template)
│   ├── guide.css       Guide styles, incl. the four seasonal palettes
│   └── lightbox.css    Full-screen image viewer (both pages)
├── js/
│   ├── catalog.js      THE list of designs and images — both pages read it
│   ├── engine.js       Showroom behavior: chat, MATCH parsing, side cards
│   ├── guide.js        Guide behavior: seasons, lookbook carousel, collection
│   └── lightbox.js     Full-screen image viewer (both pages)
├── assets/
│   └── engine-bg.jpg   Showroom background image
├── .gitignore
└── README.md
```

## Look at it on your computer

1. **Unzip first.** Right-click `fttu-footwear.zip` → **Extract All**. Double-clicking a file *inside* the zip opens it alone, without the `css`, `js` and `assets` folders next to it, and you'll just see empty boxes (the page now tells you this if it happens).
2. Open the extracted `fttu-footwear` folder and double-click `index.html` (the showroom) or `guide.html` (the guide).
3. Everything works this way — all 41 pictures, the lookbook carousel, full-screen view, theme toggle, text size — **except the chat**, which needs the site running on Vercel with your API key.

## Put it on GitHub (GitHub Desktop)

1. Unzip, and move the `fttu-footwear` folder wherever you keep your projects.
2. GitHub Desktop → **File → Add local repository…** → choose the `fttu-footwear` folder.
3. It will say this isn't a Git repository yet → click **create a repository** → **Create repository**.
4. Click **Publish repository**. Untick "Keep this code private" only if you want it public.

## Put it online (Vercel)

1. Vercel → **Add New… → Project** → import `fttu-footwear` from GitHub. No framework, no build command.
2. **Settings → Environment Variables** → add `ANTHROPIC_API_KEY` for Production and Preview.
3. **Deployments → Redeploy.** Environment variables only apply to new deployments.

Images load straight from the public Supabase bucket `fttu-footwear`, so no Supabase key is needed.

## Seasons

The guide uses meteorological seasons for the Northern Hemisphere and switches on the 1st:
Winter Dec–Feb · Spring Mar–May · Summer Jun–Aug · Fall Sep–Nov.
The switch happens in each visitor's browser from their own date, so nothing needs redeploying.

## Adding a design

1. Upload the image to the Supabase bucket, in its category folder.
2. Add one line to the list in `js/catalog.js`: category, colorway, image path, one-sentence description.
3. Commit and push in GitHub Desktop. The showroom, its AI answers, the lookbook and the collection all pick it up.
