# MSU Breakfast Restaurant Operations

ต้นแบบผู้ช่วยจัดการร้านอาหารเช้าด้วย AI สำหรับร้านที่ขายโจ๊ก ข้าวต้ม ก๋วยจั๊บ
และเมนูใกล้เคียง ช่วยเปลี่ยนภาพใบออร์เดอร์หลายใบให้เป็นข้อมูลออร์เดอร์ที่ตรวจสอบได้
รวมยอดเพื่อออกใบเสร็จ และประมาณการวัตถุดิบสำหรับเตรียมครัวล่วงหน้า

## Product context

ผู้ใช้หลักคือเจ้าของร้านและพนักงานหน้าร้าน/ครัวที่ต้องอ่านใบออร์เดอร์ลายมือจำนวนมาก
ในช่วงเช้าที่มีออเดอร์เข้าพร้อมกัน ระบบควรทำงานตามลำดับนี้:

1. อัปโหลดภาพใบออร์เดอร์หลายใบ
2. OCR อ่านเมนู จำนวน ราคา และคำสั่งพิเศษ พร้อม confidence และรายการที่ต้องตรวจ
3. รวมเมนูซ้ำจากทุกใบ โดยยังย้อนกลับไปดูออร์เดอร์ต้นทางได้
4. ให้พนักงานยืนยันข้อมูลก่อนคิดเงิน แล้วสร้างใบเสร็จยอดเงินบาท
5. ใช้รายการที่ยืนยันแล้วคำนวณวัตถุดิบตามสูตรมาตรฐานและปริมาณสำรองที่ร้านกำหนด

กฎสำคัญ: AI ห้ามเดาราคา สูตร หรือข้อความที่อ่านไม่ออก ราคาและสูตรต้องมาจากข้อมูล
ที่ร้านกำหนดเอง และผล OCR ที่ confidence ต่ำต้องผ่าน human review ก่อนนำไปใช้จริง

## Current prototype

- `src/app/api/order-ocr/route.ts` — endpoint OCR ใบออร์เดอร์ด้วย Typhoon
  รองรับ JPG และ PNG ไม่เกิน 10 MB, รับ `file` หนึ่งภาพหรือ `files` หลายภาพ
  (สูงสุด 10 ภาพต่อ request) แล้วคืนฟิลด์ชุดเดียวกับ draft ใน upload panel
- `src/lib/order-ocr/schema.ts` — schema `restaurant.order.v2` สำหรับผล OCR,
  confidence, raw text และสถานะที่ต้อง human review
- `src/component/expense-upload-panel/expense-upload-panel.tsx` — อัปโหลดหลายภาพ,
  แสดงสถานะ OCR ต่อไฟล์, retry, แก้ไขผล และมีภาพตัวอย่างทั้งพิมพ์และลายมือที่อยู่ใน `/mock/`
- `docs/Hackathon_MSU_2026_Restaurant_Operations.md` — product brief และบริบทการแข่งขัน
- `.whipui/project-dna.json` — durable context สำหรับงานออกแบบและพัฒนาต่อ

การใช้งาน OCR ต้องตั้งค่า `TYPHOON_OCR_API_KEY` ก่อน ระบบจะเรียก Typhoon OCR เพื่อถอด
ข้อความ แล้วเรียก text model เพื่อจัดรูปเป็น `orderNumber`, `customerName`, `items`,
`toppings`, `orderedAt`, `orderType`, ราคา และหมายเหตุที่ panel ใช้โดยตรง
เลขออร์เดอร์เป็น unique identifier เพียงตัวเดียว ไม่มี workflow รายจ่ายหรือเลขใบเสร็จ
ถ้าโพยลายมือไม่มีเลขออร์เดอร์ ระบบจะสร้างเลขออร์เดอร์ unique ให้ และถ้าไม่มีวันเวลา
จะใช้ metadata ของไฟล์เป็นค่าเริ่มต้นพร้อมบังคับให้พนักงานตรวจทาน
หากอ่านไม่ชัดหรือ confidence ต่ำกว่า 70% ปุ่มถัดไปจะยังไม่เปิดจนกว่าจะมีพนักงานกดตรวจแล้ว

ตั้งค่าใน `.env.local`:

```bash
TYPHOON_OCR_API_KEY=your_opentyphoon_api_key
TYPHOON_OCR_MODEL=typhoon-ocr
TYPHOON_NORMALIZER_MODEL=typhoon-v2.5-30b-a3b-instruct
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
