import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import formidable, { Fields, Files } from "formidable";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { writeFile, unlink, readFile } from "fs/promises";
import prisma from "@/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: any): Promise<{ fields: any; files: any }> {
  const form = formidable({ multiples: false });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(500).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);
    const name = fields.name[0];
    const userId = fields.id[0];
    const file = files.photo[0];

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });

    const oldImage = await prisma.user
      .findUnique({
        where: { id: userId },
      })
      .then((data) => data?.image);

    let fileUrl = null;

    if (file) {
      // upload new photo
      const bytes = await readFile(file.filepath);
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
      where: { id: userId },
      data: { name, image: fileUrl },
    });

    return res.json({ success: true, message: `success update data` });
  } catch (error) {
    console.error(`[ERROR] ${__filename}`);
    if (error instanceof Error) console.error(error.stack);
    if (error instanceof Error && error.name === "Auth") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return res.status(404).json({ success: false, message: "invalid data" });
    }

    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}
