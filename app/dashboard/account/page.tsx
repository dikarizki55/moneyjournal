"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const page = () => {
  const session = useSession();

  const user = session.data?.user;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const [name, setName] = useState(user?.name || "");
  const [photo, setPhoto] = useState<File | null>(null);

  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch("/api/getAccountImage", {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json());

      setPreview(res.data);
    };
    fetchImage();
  }, []);

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

    const res = await fetch(`/api/account`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    window.location.reload();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className=" flex flex-col gap-5 p-7">
        <div className=" flex flex-col items-center gap-2">
          <div
            className={`w-50 h-50 rounded-[50px] overflow-hidden ${
              preview === "" && " bg-gray-100"
            }`}
          >
            {preview !== "" && (
              <img
                src={preview}
                alt={name}
                className=" min-w-full min-h-full"
              />
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

          <Button
            className=" flex gap-2"
            type="button"
            onClick={handleImageClick}
          >
            <PencilLine />
            Edit
          </Button>
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
