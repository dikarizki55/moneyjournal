import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className=" w-full h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className=" w-full">
          <CardTitle className=" mx-auto">SignUp or SignIn</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Link href="/login" className=" w-full">
            <Button className=" w-full cursor-pointer">SignIn</Button>
          </Link>
          <Link href="/signup" className=" w-full">
            <Button className=" w-full cursor-pointer">SignUp</Button>
          </Link>
          <Link href="/dashboard" className=" w-full">
            <Button className=" w-full cursor-pointer">Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
