This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## แชทบอทอสังหาริมทรัพย์

ชุดข้อมูลจำลอง 4 จังหวัด 24 โซน 160 ประกาศ และดัชนีราคา 72 เส้น ย้อนหลัง 60 เดือน
(2021-08 ถึง 2026-07) พร้อมแชทบอทที่ตอบจากข้อมูลชุดนี้ผ่าน tool calling เท่านั้น

- `src/data/*.json` — ชุดข้อมูล สร้างจาก `scripts/generate-data.ts` แก้ด้วยมือได้
- `src/lib/property/` — types, repository, forecast, tools, system prompt
- `src/app/api/chat/route.ts` — endpoint แบบ stateless รองรับทั้ง stream และ JSON
- `src/component/chatbot/` — panel ฝั่ง UI

ตั้งค่า: คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ `DEEPSEEK_API_KEY`
ถ้าไม่มีคีย์ endpoint ยังตอบได้จากเทมเพลตออฟไลน์ที่อ่านข้อมูลชุดเดียวกัน

สร้างข้อมูลใหม่ (เขียนทับ `src/data/`):

```bash
node scripts/generate-data.ts
```

ทดสอบสูตรพยากรณ์:

```bash
node --test scripts/forecast.test.ts
```

คุยกับบอทในเทอร์มินัล (ต้องรัน dev server ก่อน):

```bash
node scripts/chat.ts
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
