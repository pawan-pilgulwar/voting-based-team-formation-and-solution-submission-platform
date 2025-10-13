"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type UserRole = "student" | "mentor" | "organization" | "admin";

export type ProfileCardProps = {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  coverUrl?: string;
  onAvatarUpload?: (file: File) => void;
  gender?: "male" | "female";
};

export function ProfileCard({ name, email, role, avatarUrl, coverUrl, onAvatarUpload, gender }: ProfileCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Build gender-based avatar fallback chain
  const genderKey = gender && ["male","female"].includes(gender) ? gender : null;
  let genderPng
  if (!genderKey) {
    genderPng = "/employee.png"
  } else {
    genderPng = genderKey == "male"? `/avatars/boy.png` : "/avatars/girl.png";
  }
  const [avatarSrc, setAvatarSrc] = useState<string>(
    avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : genderPng
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader
        className="relative flex flex-col sm:flex-row sm:items-center gap-4 h-60 justify-end text-white"
        style={{
          backgroundImage: coverUrl
            ? `url(${coverUrl})`
            : "linear-gradient(to right, #1e293b, #334155)", // fallback gradient
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: "0.8",
        }}
      >
        <div className="relative h-20 w-20">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={avatarSrc}
              alt={name}
            />
            <AvatarFallback className="text-lg">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onAvatarUpload) onAvatarUpload(file);
            }}
          />
        </div>
        <div className="flex-1">
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            {name}
            <Badge variant="secondary" className="capitalize">{role}</Badge>
          </CardTitle>
          <CardDescription>{email}</CardDescription>
        </div>
        {onAvatarUpload && (
          <div>
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="whitespace-nowrap"
            >
              Upload Avatar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium break-words">{name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium break-words">{email}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
