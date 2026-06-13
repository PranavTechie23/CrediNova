import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Bell, Shield, Key, Lock, LogOut, CreditCard, Save, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState<Record<string, boolean>>({
        email: true,
        push: false,
        updates: true,
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // (sections defined inline in UI) 

    return (
        <div className="min-h-screen p-8 text-text-primary animate-fade-in">
            <div className="max-w-5xl mx-auto space-y-8">
                <PageHeader
                    title="Settings"
                    subtitle="Configuration"
                    description="Manage your account preferences, security, and billing settings."
                    icon={<SettingsIcon className="w-6 h-6" />}
                />

                {/* Settings Grid */}
                <div className="grid gap-8 md:grid-cols-2">

                    {/* Appearance Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card variant="elevated">
                            <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-gradient-to-br from-primary to-accent/80 rounded-lg">
                                        <Sun className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Appearance</CardTitle>
                                        <CardDescription>Customize your interface theme</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 smooth-transition">
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold">Dark Mode</Label>
                                        <p className="text-sm text-text-muted">Toggle between light and dark themes</p>
                                    </div>
                                    <Switch
                                        checked={theme === "dark"}
                                        onCheckedChange={toggleTheme}
                                    />
                                </div>
                                <div className="bg-surface/60 border border-border/50 p-4 rounded-xl">
                                    <p className="text-sm text-text-muted">Current Theme: <span className="font-semibold text-primary capitalize">{theme}</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notification Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <Card variant="elevated">
                            <CardHeader className="bg-gradient-to-br from-accent/5 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-gradient-to-br from-accent to-primary rounded-lg">
                                        <Bell className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>Manage notification preferences</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {[
                                    { id: "email", label: "Email Notifications", desc: "Receive weekly digest emails" },
                                    { id: "push", label: "Push Notifications", desc: "Real-time alerts on your device" },
                                    { id: "updates", label: "Model Updates", desc: "Get notified about new model versions" }
                                ].map((notif) => (
                                    <div key={notif.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 smooth-transition">
                                        <div>
                                            <Label className="font-semibold">{notif.label}</Label>
                                            <p className="text-xs text-text-muted mt-1">{notif.desc}</p>
                                        </div>
                                        <Switch
                                            checked={notifications[notif.id]}
                                            onCheckedChange={(c) => setNotifications({ ...notifications, [notif.id]: c })}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="border-t border-border/50 pt-6">
                                <Button variant="default" className="w-full">
                                    <Save className="w-4 h-4 mr-2" /> Save Preferences
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <Card variant="elevated">
                            <CardHeader className="bg-gradient-to-br from-success/5 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-gradient-to-br from-success to-primary rounded-lg">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Security & Access</CardTitle>
                                        <CardDescription>Manage your password, 2FA, and API keys</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm text-text-primary">Change Password</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Current Password</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                                                <input
                                                    type="password"
                                                    className="w-full bg-surface border-2 border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none smooth-transition"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">New Password</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                                                <input
                                                    type="password"
                                                    className="w-full bg-surface border-2 border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none smooth-transition"
                                                    placeholder="Minimum 8 characters"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button variant="default">Update Password</Button>
                                    </div>
                                </div>

                                <div className="h-px bg-border/50"></div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-success/30 smooth-transition">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-success" />
                                        <div>
                                            <Label className="font-semibold">Two-Factor Authentication</Label>
                                            <p className="text-xs text-text-muted mt-1">Add an extra layer of security</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={twoFactorEnabled}
                                        onCheckedChange={setTwoFactorEnabled}
                                    />
                                </div>

                                <div className="h-px bg-border/50"></div>

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-text-primary">API Keys</h3>
                                    <div className="p-4 rounded-xl bg-surface/50 border border-border/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-mono text-text-muted">sk-1a2b3c4d5e6f7g8h9i0j...</span>
                                            <Button variant="outline" size="sm">Regenerate</Button>
                                        </div>
                                        <p className="text-xs text-text-muted">Last used 2 hours ago</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Billing Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="md:col-span-2"
                    >
                        <Card variant="elevated">
                            <CardHeader className="bg-gradient-to-br from-warning/5 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-gradient-to-br from-warning to-accent rounded-lg">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Billing & Subscription</CardTitle>
                                        <CardDescription>Manage your plan and payment methods</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-text-primary">Professional Plan</h3>
                                            <p className="text-sm text-text-muted mt-1">$299/month • Renews on Jun 30, 2026</p>
                                        </div>
                                        <Button variant="outline" size="sm">Upgrade</Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-primary/20">
                                        <div>
                                            <p className="text-xs text-text-muted">Monthly API Calls</p>
                                            <p className="font-semibold text-primary">1,000,000</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-muted">Used This Month</p>
                                            <p className="font-semibold text-primary">342,560</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-muted">Remaining</p>
                                            <p className="font-semibold text-success">657,440</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-text-primary">Payment Method</h3>
                                    <div className="p-4 rounded-xl border border-border/50 hover:border-primary/30 smooth-transition flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-text-muted" />
                                            <div>
                                                <p className="font-semibold text-sm">Visa ending in 4242</p>
                                                <p className="text-xs text-text-muted">Expires 12/2026</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Session Management */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card variant="elevated">
                            <CardHeader className="bg-gradient-to-br from-danger/5 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-gradient-to-br from-danger to-warning rounded-lg">
                                        <LogOut className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Session Management</CardTitle>
                                        <CardDescription>Control active sessions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="p-4 rounded-xl bg-surface/50 border border-border/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm">Current Session</p>
                                            <p className="text-xs text-text-muted">Active now • Chrome on macOS</p>
                                        </div>
                                        <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">Active</span>
                                    </div>
                                </div>
                                <Button variant="destructive" className="w-full">
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out of All Sessions
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Support */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <Card variant="elevated">
                            <CardHeader className="bg-gradient-to-br from-accent/5 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-gradient-to-br from-accent to-primary rounded-lg">
                                        <Bell className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Support & Resources</CardTitle>
                                        <CardDescription>Get help and documentation</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6">
                                <Button variant="outline" className="w-full justify-center">Documentation</Button>
                                <Button variant="outline" className="w-full justify-center">Contact Support</Button>
                                <Button variant="outline" className="w-full justify-center">Report an Issue</Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

