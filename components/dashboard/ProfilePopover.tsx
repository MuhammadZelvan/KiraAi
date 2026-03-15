"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Clock,
  Circle
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { useToast } from "@/components/ui/use-toast";

import { getMe, logout } from "@/lib/api";

interface User {
  id: string
  email: string
  role: string
}

export function ProfilePopover() {

  const router = useRouter()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {

    async function loadUser() {

      try {

        const data = await getMe()

        if (data) {
          setUser(data)
        }

      } catch (err) {

        console.error("Failed to load user", err)

      }

    }

    loadUser()

  }, [])

  async function handleLogout() {

    try {

      await logout()

      toast({
        title: "Logged Out",
        description: "You have been signed out successfully.",
      })

      router.push("/login")

    } catch (err) {

      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      })

    }

  }

  function navigateTo(path: string) {
    setOpen(false)
    router.push(path)
  }

  const email = user?.email ?? "admin@lyra.ai"
  const role = user?.role ?? "Admin"

  const name = email.split("@")[0]

  return (

    <Popover open={open} onOpenChange={setOpen}>

      <PopoverTrigger asChild>

        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">

          <Avatar className="h-10 w-10 border-2 border-primary/20">

            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${email}`}
            />

            <AvatarFallback className="bg-primary/10 text-primary">
              {name[0].toUpperCase()}
            </AvatarFallback>

          </Avatar>

        </button>

      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0" sideOffset={8}>

        {/* Profile Info */}

        <div className="p-4 border-b border-border">

          <div className="flex items-center gap-3">

            <Avatar className="h-12 w-12 border-2 border-primary/20">

              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${email}`}
              />

              <AvatarFallback className="bg-primary/10 text-primary">
                {name[0].toUpperCase()}
              </AvatarFallback>

            </Avatar>

            <div className="flex-1 min-w-0">

              <p className="text-sm font-semibold text-foreground truncate">
                {name}
              </p>

              <p className="text-xs text-muted-foreground">
                {role}
              </p>

              <div className="flex items-center gap-1.5 mt-1">

                <Circle className="h-2 w-2 fill-green-500 text-green-500" />

                <span className="text-[10px] text-green-600 font-medium">
                  Online
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Session Info */}

        <div className="px-4 py-2.5 border-b border-border bg-muted/30">

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">

            <Clock className="h-3 w-3" />

            <span>
              Session Active
            </span>

          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">

            <Shield className="h-3 w-3" />

            <span>
              Authenticated via Cookie
            </span>

          </div>

        </div>

        {/* Quick Links */}

        <div className="p-1.5">

          <button
            onClick={() => navigateTo("/settings")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >

            <Settings className="h-4 w-4 text-muted-foreground" />

            Settings

          </button>

          <button
            onClick={() => navigateTo("/help")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >

            <HelpCircle className="h-4 w-4 text-muted-foreground" />

            Help & Support

          </button>

        </div>

        {/* Logout */}

        <div className="p-1.5 border-t border-border">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >

            <LogOut className="h-4 w-4" />

            Log Out

          </button>

        </div>

      </PopoverContent>

    </Popover>

  )

}