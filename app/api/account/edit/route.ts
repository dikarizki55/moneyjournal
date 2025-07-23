import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const oldImage = await prisma.user
      .findUnique({
        where: { id: user.id },
        select: { image: true },
      })
      .then((body) => body?.image);

    const res = await req.formData();
    const name = res.get("name") as string;
    const photo = res.get("photo") as File;

    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    if (photo) {
      const bucket = "money-journal"; //foldername

      const urlOldImage = String(oldImage).replace("/public", "");

      const filename = `${name}-${photo.name}`;
      const filePath = `uploads/${filename}`;

      const arrayBuffer = await photo.arrayBuffer();
      const bufferPhoto = Buffer.from(arrayBuffer);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": photo.type,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            "x-upsert": "true",
          },
          body: bufferPhoto,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        return NextResponse.json(
          { error: errText },
          { status: uploadRes.status }
        );
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

      await prisma.user.update({
        where: { id: user.id },
        data: { image: publicUrl },
      });

      const deleteOld = await fetch(urlOldImage, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      });

      if (!deleteOld.ok) {
        console.log(await deleteOld.json());
        return NextResponse.json(
          { message: "error to delete old image" },
          { status: deleteOld.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: `success update data`,
      });
    } else {
      console.log("gada photo");
      return NextResponse.json(
        { success: false, message: "missing form photo or name" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);

    if (error instanceof Error && error.name === "Auth")
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );

    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const Image = await prisma.user
      .findUnique({
        where: { id: user.id },
        select: { image: true },
      })
      .then((body) => body?.image);

    const urlImage = String(Image).replace("/public", "");

    const deleteOld = await fetch(urlImage, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    });

    if (!deleteOld.ok) {
      console.log(await deleteOld.json());
      return NextResponse.json(
        { message: "error to delete old image" },
        { status: deleteOld.status }
      );
    }

    await prisma.user.update({ where: { id: user.id }, data: { image: null } });

    return NextResponse.json({
      message: "successfull delete image",
      success: true,
    });
  } catch (error) {
    console.log(error);

    if (error instanceof Error && error.name === "Auth")
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );

    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
