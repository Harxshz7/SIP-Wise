# SIP Wise

A **retro-styled SIP (Systematic Investment Plan) calculator** built with React, featuring a nostalgic Windows 95/98 aesthetic. Calculate your mutual fund SIP returns with support for step-up (top-up) SIP, interactive charts, and year-wise breakdowns — all wrapped in a fun, pixel-perfect retro UI.

---

## Features

- **Standard SIP Calculator** — Compute maturity value, total invested amount, and estimated returns for a fixed monthly contribution.
- **Step-Up (Top-Up) SIP** — Optionally increase your monthly contribution by a fixed percentage every year to see how stepping up accelerates wealth creation.
- **Interactive Sliders & Inputs** — Adjust monthly investment (₹500 – ₹2,00,000), expected return rate (1% – 30%), time period (1 – 40 years), and annual step-up (0% – 50%) with real-time results.
- **Growth Chart** — Visual area chart (powered by Recharts) showing invested amount vs. portfolio value over time.
- **Year-Wise Breakdown Table** — Detailed table with yearly invested amount, portfolio value, and returns for each year.
- **Indian Currency Formatting** — All values displayed in ₹ with Indian numeral grouping (Lakhs/Crores) and compact axis labels (₹12.5L, ₹1.5Cr).
- **Retro Windows 95/98 UI** — Beveled panels, title bars, construction-stripe footer, scrolling marquee, and pixel-art styling for a nostalgic experience.

---

## Tech Stack

| Layer          | Technology                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| **Framework**  | [React 19](https://react.dev/) (JSX)                                       |
| **Build Tool** | [Vite 8](https://vite.dev/)                                                |
| **Styling**    | [Tailwind CSS 4](https://tailwindcss.com/) + custom retro CSS              |
| **Charts**     | [Recharts 3](https://recharts.org/)                                        |
| **Icons**      | [Lucide React](https://lucide.dev/)                                        |
| **Marquee**    | [react-fast-marquee](https://www.npmjs.com/package/react-fast-marquee)     |
| **Linting**    | [Oxlint](https://oxc.rs/)                                                 |

---

## Project Structure

```
sipwise/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── GrowthChart.jsx      # Area chart — invested vs. value over time
│   │   ├── InputPanel.jsx       # Slider + number input controls
│   │   ├── ResultCards.jsx      # Summary cards (invested, returns, maturity)
│   │   └── YearWiseTable.jsx    # Year-by-year breakdown table
│   ├── hooks/
│   │   └── useSipState.js       # (Reserved) custom hook for SIP state
│   ├── styles/
│   │   └── retro.css            # Win95/98 retro theme styles
│   ├── utils/
│   │   ├── formatCurrency.js    # ₹ formatting + compact labels (L/Cr/K)
│   │   └── sipCalculator.js     # Core SIP math (standard + step-up)
│   ├── App.jsx                  # Root application component
│   ├── index.css                # Global CSS entry point
│   └── main.jsx                 # React DOM entry point
├── index.html
├── vite.config.js
├── package.json
└── .oxlintrc.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Quick Start (copy-paste and run)

```bash
cd sipwise
npm install
npm run dev
```

This installs all dependencies and starts the dev server at `http://localhost:5173` with hot module replacement (HMR).

> **Note:** All commands must be run from inside the `sipwise/` directory where `package.json` lives.

### All Available Commands

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm install`      | Install all dependencies                     |
| `npm run dev`      | Start the dev server (localhost:5173)         |
| `npm run build`    | Create a production build                    |
| `npm run preview`  | Preview the production build locally         |
| `npm run lint`     | Run Oxlint for code linting                  |

---

## Calculation Methodology

### Monthly Rate Conversion

SIP Wise uses the **effective geometric monthly rate**, matching calculators like Groww:

```
monthlyRate = (1 + annualRate / 100) ^ (1/12) - 1
```

This is more accurate than the simple nominal division (`rate / 12`) commonly used.

### Standard SIP (Annuity-Due)

Contributions are made at the **start of each month**:

```
FV = P × [((1 + i)^n - 1) / i] × (1 + i)
```

Where `P` = monthly amount, `i` = effective monthly rate, `n` = total months.

### Step-Up SIP

The monthly contribution increases by a fixed percentage at the start of each year. The calculation runs a year-by-year loop, compounding monthly within each year, then stepping up the contribution for the next year.

---

## License

This project is open source. Feel free to use it for personal or educational purposes.
