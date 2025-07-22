import { verifyUser } from "@/lib/verifyuser";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { writeFile, unlink } from "fs/promises";
import prisma from "@/prisma";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: any): Promise<{ fields: any; files: any }> {
  const form = formidable({ multiples: false, keepExtensions: true });

  const buffers: Buffer[] = [];
  const reader = req.body?.getReader();
  if (!reader) throw new Error("no request body");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) buffers.push(Buffer.from(value));
  }

  const buffer = Buffer.concat(buffers);

  return new Promise((resolve, reject) => {
    form.parse(
      {
        headers: Object.fromEntries(req.headers),
        method: req.method,
        url: "",
        socket: {} as any,
        on: nodeReadable.on.bind(nodeReadable),
        resume: nodeReadable.resume.bind(nodeReadable),
        pipe: nodeReadable.pipe.bind(nodeReadable),
      },
      (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      }
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const { fields, files } = await parseForm(req);

    const oldImage = await prisma.user
      .findUnique({
        where: { id: user.id },
      })
      .then((data) => data?.image);

    const name = fields.name[0];
    const file = files.photo[0];

    let fileUrl = null;

    if (file) {
      // upload new photo
      const bytes = await file.toBuffer();
      const filename = `${uuidv4()}-${file.originalFilename}`;
      const filepath = path.join(process.cwd(), "public", "uploads", filename);
      await writeFile(filepath, bytes);
      fileUrl = `/uploads/${filename}`;

      // delete old photo
      if (oldImage && oldImage.startsWith("/uploads/")) {
        const oldFilePath = path.join(process.cwd(), "public", oldImage);

        try {
          await unlink(oldFilePath);
        } catch (error) {
          console.warn("failed to delete photo", error);
        }
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name, image: fileUrl },
    });

    return NextResponse.json({ success: true, message: `success update data` });
  } catch (error) {
    console.error(`[ERROR] ${__filename}`);
    if (error instanceof Error) console.error(error.stack);
    if (error instanceof Error && error.name === "Auth") {
      return NextResponse.json(
        { success: false, message: "Invalid Credentials" },
        { status: 401 }
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, message: "invalid data" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "internal server error" },
      { status: 500 }
    );
  }
}
