# Vylučovací labyrint

Mobilní webová hra na procvičení **vylučovací soustavy** (biologie, SŠ / maturita).
Panáček běží labyrintem ledviny po cestě moči: od glomerulu přes Henleovu kličku, pánvičku,
močovod a měchýř až na WC. Cestou ho zastaví **20 otázek A–D** (náhodně z 60 v `src/data/questions.json`).
Každá chyba přileje do měchýře:

| Obtížnost | Povolené chyby | Game over |
| --- | --- | --- |
| Muž (větší měchýř) | 7 | 8. chyba |
| Žena (menší měchýř) | 5 | 6. chyba |

Na konci se ukáže skóre, čas a **přehled chybných otázek se správnými odpověďmi**.
Statistiky (počet her, výhry, rekord) se ukládají jen do `localStorage` v telefonu, žádná data se nikam neposílají.

## Ovládání

- **Telefon:** táhni prstem po labyrintu (podržením prstu běží panáček dál stejným směrem) nebo použij šipky dole.
- **Počítač:** šipky nebo WASD, otázky lze odpovídat klávesami A–D / 1–4, Enter = pokračovat.
- Panáček sám běží chodbou až k další křižovatce, takže stačí jen volit odbočky.

## Lokální spuštění

Potřebuješ Node.js 20+.

```bash
npm install
npm run dev
```

Otevři `http://localhost:5173`. Dev server poslouchá i v síti, takže na telefonu ve stejné Wi-Fi otevři
`http://<IP-tvého-počítače>:5173` (IP vypíše Vite v terminálu jako „Network“). Na mobilu to testuj vždycky,
emulace v prohlížeči neukáže safe-area, gesta ani chování lišty Safari.

Produkční build: `npm run build` (výstup ve složce `dist/`), náhled: `npm run preview`.

## Nasazení na Vercel

Žádné env proměnné ani backend nejsou potřeba. Vercel sám pozná Vite (build `npm run build`, výstup `dist`).

**Varianta A, přes dashboard (doporučeno):**
1. Pushni repo na GitHub.
2. Na [vercel.com/new](https://vercel.com/new) zvol *Import Git Repository* a vyber tohle repo.
3. Nech výchozí nastavení (Framework Preset: Vite) a klikni *Deploy*. Každý další push se nasadí sám.

**Varianta B, přes CLI:**

```bash
npm i -g vercel
vercel        # první nasazení, propojí projekt
vercel --prod # produkční URL
```

## Struktura

```
src/
  data/questions.json   60 otázek (zdroj pravdy, beze změn)
  data/questions.ts     typy + popisky kategorií
  game/maze.ts          generátor labyrintu (perfektní bludiště, jediná cesta k WC) + rozmístění 20 otázek
  game/store.ts         stav hry (Zustand): obtížnost, otázky, chyby, fáze hry
  game/zones.ts         pásy orgánů (kůra, dřeň, pánvička, močovod, měchýř) s fakty z prezentace
  game/stats.ts         localStorage statistiky
  components/           labyrint, panáček, měchýř, orgány, sheet s otázkou, šipky
  screens/              úvod, hra, konec
```

Stack: Vite, React, TypeScript, Tailwind CSS v4, Zustand, Motion (animace), Sonner (toasty).
