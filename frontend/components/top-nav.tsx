"use client";

import { Search, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export function TopNav() {

  const [search, setSearch] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
  const handleClick = () => setShowResults(false);
  window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
}, []);
  
  return (
    <div className="flex items-center justify-between w-full px-4 py-20">
      {/* Logo */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <Link href="/">
          <div className="relative flex justify-center items-center">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-lg font-bold pl-2">TeamForge</h1>
            {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /> */}
            {/* <Input placeholder="Search..." className="pl-10 bg-background/50 border-border/50 focus:bg-background" /> */}
          </div>
        </Link>
      </div>

      {/* Search Section */}
      {user?.role != "admin" && <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search problems..."
            className="pl-10 bg-background/50 border-border/50 focus:bg-background"
            value={search as string}
            onChange={async (e) => {
              e.stopPropagation();
              const value = e.target.value;
              setSearch(value);

              if (!value.trim()) {
                setResults([]);
                setShowResults(false);
                return;
              }

              setShowResults(true);

              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/problems/search`,
                {
                  params: { q: value },
                  withCredentials: true, // optional but recommended since you use auth cookies
                }
              );

              const data = res.data;
              setResults(data.data);
            }}
          />

          {/* Search Results Dropdown */}
          {showResults && results?.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-black border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {results.map((item : any) => (
                <Link
                  href={`/problems/${item._id}`}
                  key={item._id}
                  onClick={() => setShowResults(false)}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {showResults && results.length === 0 && search !== "" && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-black border rounded-lg shadow-lg p-4 text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </div>}

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New message received</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Project updated</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Task completed</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

      </div>
    </div>
  );
}
