# 🥬 Freshli — Your Smart Fridge Companion

Freshli is a sleek, full-stack web app designed to help users effortlessly track food inventory, reduce waste, and generate AI-assisted recipes using real ingredients in their fridge or pantry.

Built as a personal side project, Freshli showcases modern React development using **Next.js**, **Tailwind CSS**, **Supabase**, and the **OpenAI GPT-4 Vision** and **Chat Completion APIs** to deliver a fluid and intuitive UX for meal planning and food management.

---

## 🔑 Key Features

### 🧊 Fridge Inventory Dashboard
- Organized columns by category (produce, meats, dairy, pantry/grains, frozen, miscellaneous).
- Ingredients sorted by expiration date, highlighted with intuitive border color cues (green, yellow, red).
- Scrollable lists per category to keep the layout clean and mobile-friendly.

### 📸 AI-Powered Image Recognition
- Upload a photo of your groceries and Freshli uses OpenAI GPT-4 Vision to identify ingredients.
- Auto-populates cards with editable ingredient names.
- Users manually add quantity, unit, and expiration data before confirming additions to the inventory.

### ✅ Interactive Ingredient Management
- Clickable ingredient cards for easy editing or deletion.
- Manual ingredient input form with duplication handling: auto-merges quantities for duplicate items (same name/unit/expiration).

### 🧠 AI-Assisted Recipe Generation
- Users select ingredients via checkboxes and submit optional and fully customizable filters (e.g., "soup", "vegetarian", "Korean").
- OpenAI generates up to 9 recipes based on selected ingredients and preferences.
- Each recipe links to a detail view with ingredients, quantities, and step-by-step instructions.
- After cooking, users can update inventory by entering quantities used for each ingredient.

### 💬 Smart UX Design
- Animated loading states and feedback popups
- Ingredient selection persists via `localStorage` between pages.
- Clean, responsive design with Tailwind and custom color palette.
- All pages use consistent visual language (pill buttons, component cards, spacing).

---

## 🛠️ Tech Stack

| Tech | Description |
|------|-------------|
| **Next.js** | React framework for routing, SSR, and API routes |
| **Tailwind CSS** | Utility-first CSS for styling and responsiveness |
| **Supabase** | Open source backend-as-a-service (PostgreSQL + Auth + Storage) |
| **OpenAI GPT-4 Vision** | Recognizes ingredients from uploaded images |
| **OpenAI GPT-4 Completion** | AI-powered recipe generation |
| **TypeScript** | Type-safe code across all components and backend logic |
| **LocalStorage** | Persists ingredient selections and user state across pages |

---

## Getting Started

First, run the development server:

```bash
npm run dev
```

And open [http://localhost:3000](http://localhost:3000) with your browser to see the result.