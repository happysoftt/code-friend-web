import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function saveFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}-${file.name.replace(/\s/g, '-')}`;
  const uploadDir = path.join(process.cwd(), "public/uploads");
  
  // สร้างโฟลเดอร์ถ้ายังไม่มี
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // ignore if exists
  }

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}