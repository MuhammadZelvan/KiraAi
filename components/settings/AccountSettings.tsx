import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Plus, LogOut, Trash2, Key } from "lucide-react";

export function AccountSettings() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "prabowo@gamil.com",
    phone: "+1 434 3534 3531",
    password: "••••••••••",
  });

  return (
    <div className="flex-1 space-y-8">
      {/* Account Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage preferences and personal information
        </p>
      </div>

      {/* Profile Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>MP</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">Mas Prabowo</h3>
              <p className="text-sm text-muted-foreground">Product Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Upload new picture
            </Button>
            <Button variant="outline" size="sm">
              Delete
            </Button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">First name</label>
            <Input
              placeholder="Enter first name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">First name</label>
            <Input
              placeholder="Enter first name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p className="text-sm text-muted-foreground">
            Trusted by +50,000 professionals world wide.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
            <Button variant="outline" size="sm">
              Delete
            </Button>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone Number</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
            <Button variant="outline" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-base font-semibold text-foreground">Account Security</h2>
          <p className="text-sm text-muted-foreground">Manage your account security.</p>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">My Passworrd</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" value={profile.password} disabled className="pl-10" />
            </div>
            <Button variant="outline" size="sm">
              Change password
            </Button>
          </div>
        </div>
      </div>

      {/* Log Out Section */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <h3 className="font-medium text-foreground">Log Out My Account</h3>
          <p className="text-sm text-muted-foreground">Manage your account security.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>

      {/* Delete Account Section */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <h3 className="font-medium text-foreground">Delete My Account</h3>
          <p className="text-sm text-muted-foreground">Manage your account security.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete my Account
        </Button>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
      </div>
    </div>
  );
}
