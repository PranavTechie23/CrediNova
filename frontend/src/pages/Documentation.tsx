import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { BookOpen, Zap, Shield, BarChart3, FileText } from "lucide-react";

export default function Documentation() {
    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-background via-background to-surface-2">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <PageHeader
                        title="Documentation & Resources"
                        subtitle="Learn & Build"
                        description="Comprehensive guides, API documentation, and best practices for CrediNova."
                    />
                </motion.div>
                
                <div className="space-y-12 mt-12">
                    {/* Documentation Sections */}
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                        <h2 className="text-3xl font-bold font-sora">Getting Started</h2>
                        <p className="text-text-muted text-lg">Welcome to CrediNova documentation! This guide will help you understand our platform's capabilities and how to effectively use our tools for credit analysis and risk assessment.</p>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 card-hover">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-primary/15 rounded-lg"><Zap className="w-5 h-5 text-primary" /></div>
                                    <h3 className="font-semibold text-text-primary">Quick Start Guide</h3>
                                </div>
                                <p className="text-sm text-text-muted leading-relaxed">Learn the basics of setting up your account and running your first risk assessment in minutes.</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/10 card-hover">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-accent/15 rounded-lg"><BookOpen className="w-5 h-5 text-accent" /></div>
                                    <h3 className="font-semibold text-text-primary">Platform Overview</h3>
                                </div>
                                <p className="text-sm text-text-muted leading-relaxed">Explore the key features and modules available in CrediNova with detailed explanations.</p>
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* Core Features */}
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                        <h2 className="text-3xl font-bold font-sora">Core Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 border border-border/50 rounded-xl bg-surface/40 hover:bg-surface/60 transition-colors">
                                <div className="flex items-start gap-3">
                                    <BarChart3 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Risk Assessment:</strong>
                                        <p className="text-sm text-muted-foreground">Detailed explanations of our AI-driven risk scoring models and how to interpret results.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border border-border/50 rounded-xl bg-surface/40 hover:bg-surface/60 transition-colors">
                                <div className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Explainability:</strong>
                                        <p className="text-sm text-muted-foreground">Understand the 'why' behind every credit decision with our transparent AI insights.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border border-border/50 rounded-xl bg-surface/40 hover:bg-surface/60 transition-colors">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Compliance Monitoring:</strong>
                                        <p className="text-sm text-muted-foreground">Learn how we ensure fair lending practices and regulatory compliance.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border border-border/50 rounded-xl bg-surface/40 hover:bg-surface/60 transition-colors">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Audit Trails:</strong>
                                        <p className="text-sm text-muted-foreground">Comprehensive logs for each decision, including input features, model scores, operator annotations, and immutable timestamps for compliance audits.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. API Reference</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        For developers looking to integrate CrediNova into their own systems, our API documentation provides detailed endpoints, request/response formats, and authentication methods.
                    </p>
                    <div className="p-4 bg-muted rounded-md border border-border">
                        <code className="text-sm font-mono text-primary">https://api.credinova.ai/v1/</code>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">4. FAQ</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-foreground">How often is the data updated?</h3>
                            <p className="text-sm text-muted-foreground">Our models are updated daily with the latest financial data and market trends.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground">Is my data secure?</h3>
                            <p className="text-sm text-muted-foreground">Yes, we employ enterprise-grade security measures including encryption at rest and in transit.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">5. Support</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Need more help? Our support team is available 24/7 to assist you.
                        <br />
                        <a href="mailto:support@credinova.ai" className="text-primary hover:underline">support@credinova.ai</a>
                    </p>
                </section>
            </div>
        </div>
    </div>
    );
}
