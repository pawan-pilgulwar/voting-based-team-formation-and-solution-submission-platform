"use client";

import { useRef } from "react";
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
  onAvatarUpload?: (file: File) => void;
};

export function ProfileCard({ name, email, role, avatarUrl, onAvatarUpload }: ProfileCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative h-20 w-20">
          <Avatar className="h-20 w-20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : (
              <AvatarFallback className="text-lg">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            )}
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
