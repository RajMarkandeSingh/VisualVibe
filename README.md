# VisualVibe - AI Image Generator

Welcome to **VisualVibe**, an AI-powered image generation web application built using **Next.js 14**, **Tailwind CSS**, **TypeScript**, and integrated with **OpenAI**, **Cloudinary**, **Clerk**, **Stripe**, and **MongoDB**. This app allows users to upload images and apply magical transformations using AI.

---

## 🌟 Features

* 🔐 **User Authentication** with Clerk (Google, Email)
* 📤 **Upload Images** securely to Cloudinary
* 🪄 **AI-Powered Transformations** (e.g., style change, cartoon, enhancement)
* 📦 **Image History** stored with MongoDB for every user
* 💳 **Stripe Payments** for credits
* 🔄 **Credits System**: 1 image = 1 credit
* 🌈 **Responsive UI** with Tailwind CSS

---

## 🧑‍💻 Tech Stack

| Category       | Tech Used                            |
| -------------- | ------------------------------------ |
| Frontend       | Next.js 14, TypeScript, Tailwind CSS |
| Backend/API    | Next.js API Routes                   |
| Authentication | Clerk                                |
| Database       | MongoDB (Mongoose)                   |
| Image Hosting  | Cloudinary                           |
| AI Integration | OpenAI API                           |
| Payments       | Stripe                               |

---

## 📸 How It Works

1. **Sign In / Sign Up** via Clerk (Google or Email)
2. **Upload an Image** using the Cloudinary widget
3. **Enter a Prompt** for transformation (e.g., "make it look like a Van Gogh painting")
4. **Image is Processed** by OpenAI and the result is saved in your profile
5. **Download / View / Re-transform** your images any time
6. **Each transformation costs 1 credit**. Buy more using Stripe.

---

## 📂 Project Structure

```
app/
├── (root)/              # Main pages
│   ├── home/            # Home page UI
│   ├── credits/         # Show and manage credits
│   └── transform/       # Upload & transform UI
├── api/                 # API routes
│   ├── transform/       # Image transformation logic
│   ├── credits/         # Credit usage logic
│   └── webhook/stripe/  # Stripe webhook
lib/
├── cloudinary.ts        # Cloudinary config
├── openai.ts            # OpenAI config
├── stripe.ts            # Stripe config
├── auth.ts              # Clerk helpers
models/
└── image.model.ts       # MongoDB schema
```

---

## 🛠️ Environment Variables

Create a `.env.local` file in the root and add:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
MONGODB_URI=your_uri
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
OPENAI_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
```

---


## 🙋‍♂️ Author

**Raj Markande Singh**
B.Tech Artificial Intelligence and Data Science, KIT Coimbatore
[GitHub](https://github.com/RajMarkandeSingh)
