import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const folder = path.join(process.cwd(), "public", "thai_food");

  const files = fs
    .readdirSync(folder)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

  const file = files[Math.floor(Math.random() * files.length)];

  return NextResponse.json({
    url: `/thai_food/${file}`,
  });
}
