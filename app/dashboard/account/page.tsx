"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const page = () => {
  const session = useSession();

  const user = session.data?.user;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch("/api/account/getAccountInfo", {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json());

      setPreview(res.data.image);
      setName(res.data.name);
    };
    fetchImage();
  }, []);

  console.log(preview);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    if (user?.id) formData.append("id", user.id);
    if (photo) formData.append("photo", photo);

    const res = await fetch(`/api/account/edit`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    window.location.reload();
  };

  const [deleteDialog, setDeleteDialog] = useState(false);

  return (
    <div>
      <form onSubmit={handleSubmit} className=" flex flex-col gap-5 p-7">
        <div className=" flex flex-col items-center gap-2">
          <div
            className={`w-50 h-50 rounded-[50px] overflow-hidden ${
              preview === "" && " bg-gray-100"
            }`}
          >
            {preview ? (
              <img
                src={preview}
                alt={name}
                className=" min-w-full min-h-full"
              />
            ) : (
              <div className=" w-full h-full flex justify-center items-center text-8xl bg-muted">
                {name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className=" hidden"
          ></Input>

          <div className=" flex gap-5">
            <Button
              className=" flex gap-2 cursor-pointer"
              type="button"
              onClick={handleImageClick}
            >
              <PencilLine />
              Edit
            </Button>
            <Button
              className=" flex gap-2 cursor-pointer"
              type="button"
              variant={"destructive"}
              onClick={() => setDeleteDialog(true)}
            >
              <Trash />
              Delete Image Profile
            </Button>
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await fetch(`/api/account/edit`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                      });

                      window.location.reload();
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <h2 className="mt-2">{user?.email}</h2>
        </div>
        <div>
          <Label>Name</Label>
          <Input
            className=" mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Input>
        </div>

        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default page;
