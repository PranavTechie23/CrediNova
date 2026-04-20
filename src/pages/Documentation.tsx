import PageHeader from "@/components/PageHeader";

export default function Documentation() {
    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title="Documentation"
                description="Comprehensive guides and resources for CrediNova."
            />
            <div className="prose prose-sm dark:prose-invert max-w-4xl space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Getting Started</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Welcome to CrediNova documentation! This guide will help you understand our platform's capabilities and how to effectively use our tools for credit analysis and risk assessment.
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                            <h3 className="font-semibold mb-2 text-foreground">Quick Start Guide</h3>
                            <p className="text-sm text-muted-foreground">Learn the basics of setting up your account and running your first risk assessment.</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                            <h3 className="font-semibold mb-2 text-foreground">Platform Overview</h3>
                            <p className="text-sm text-muted-foreground">Explore the key features and modules available in CrediNova.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Core Features</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Risk Assessment:</strong> Detailed explanations of our AI-driven risk scoring models and how to interpret the results.
                        </li>
                        <li>
                            <strong className="text-foreground">Explainability:</strong> Understand the 'why' behind every credit decision with our transparent AI insights.
                        </li>
                        <li>
                            <strong className="text-foreground">Compliance Monitoring:</strong> Learn how we ensure fair lending practices and regulatory compliance.
                        </li>
                        <li>
                            <strong className="text-foreground">Model Intelligence:</strong> Track the accuracy, reliability, and lifecycle of our predictive models.
                        </li>
                    </ul>
                </section>

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
    );
}
