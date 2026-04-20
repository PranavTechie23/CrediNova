import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Bell, Shield, Key } from "lucide-react";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Configure your preferences and account security."
            />

            <div className="grid gap-6 md:grid-cols-2">

                {/* Appearance Settings */}
                <Card className="h-fit">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Sun className="h-5 w-5 text-yellow-500" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>
                            Customize how CrediNova looks on your device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dark Mode</Label>
                                <div className="text-sm text-muted-foreground">
                                    Toggle between light and dark themes.
                                </div>
                            </div>
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={toggleTheme}
                            />
                        </div>
                        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                            <p>Current Theme: <span className="font-semibold text-foreground capitalize">{theme}</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="h-fit">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-blue-500" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>
                            Choose what updates you want to receive.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="email-notif" className="flex flex-col space-y-1">
                                <span>Email Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive weekly digest emails.</span>
                            </Label>
                            <Switch
                                id="email-notif"
                                checked={notifications.email}
                                onCheckedChange={(c) => setNotifications({ ...notifications, email: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="push-notif" className="flex flex-col space-y-1">
                                <span>Push Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive real-time alerts.</span>
                            </Label>
                            <Switch
                                id="push-notif"
                                checked={notifications.push}
                                onCheckedChange={(c) => setNotifications({ ...notifications, push: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="updates-notif" className="flex flex-col space-y-1">
                                <span>Model Updates</span>
                                <span className="font-normal text-xs text-muted-foreground">Get notified about new model versions.</span>
                            </Label>
                            <Switch
                                id="updates-notif"
                                checked={notifications.updates}
                                onCheckedChange={(c) => setNotifications({ ...notifications, updates: c })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="default" className="w-full">Save Preferences</Button>
                    </CardFooter>
                </Card>

                {/* Security Settings */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <CardTitle>Security & access</CardTitle>
                        </div>
                        <CardDescription>
                            Manage your password and API access keys.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                        placeholder="Minimum 8 characters"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="default">Update Password</Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
