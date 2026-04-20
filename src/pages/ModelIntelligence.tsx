import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, BarChart, Bar } from "recharts";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Trophy, Beaker, CheckCircle, Cloud, TrendingDown, ArrowRight, BarChart3, Shield, AlertTriangle, GitBranch, Activity } from "lucide-react";
import { motion } from "framer-motion";

// Performance Data
const models = [
    { model: "Logistic Regression", auc: 0.76, precision: 0.68, recall: 0.62, f1: 0.65 },
    { model: "Random Forest", auc: 0.82, precision: 0.73, recall: 0.71, f1: 0.72 },
    { model: "vxgboost-prod-v2.3.1", auc: 0.86, precision: 0.78, recall: 0.75, f1: 0.76 },
];

const rocData = [
    { fpr: 0, tpr_lr: 0, tpr_rf: 0, tpr_xgb: 0 },
    { fpr: 0.05, tpr_lr: 0.25, tpr_rf: 0.35, tpr_xgb: 0.45 },
    { fpr: 0.1, tpr_lr: 0.42, tpr_rf: 0.55, tpr_xgb: 0.62 },
    { fpr: 0.2, tpr_lr: 0.58, tpr_rf: 0.68, tpr_xgb: 0.76 },
    { fpr: 0.3, tpr_lr: 0.66, tpr_rf: 0.76, tpr_xgb: 0.84 },
    { fpr: 0.4, tpr_lr: 0.72, tpr_rf: 0.82, tpr_xgb: 0.89 },
    { fpr: 0.5, tpr_lr: 0.76, tpr_rf: 0.86, tpr_xgb: 0.92 },
    { fpr: 0.6, tpr_lr: 0.82, tpr_rf: 0.9, tpr_xgb: 0.95 },
    { fpr: 0.7, tpr_lr: 0.87, tpr_rf: 0.93, tpr_xgb: 0.97 },
    { fpr: 0.8, tpr_lr: 0.92, tpr_rf: 0.96, tpr_xgb: 0.98 },
    { fpr: 0.9, tpr_lr: 0.96, tpr_rf: 0.98, tpr_xgb: 0.99 },
    { fpr: 1, tpr_lr: 1, tpr_rf: 1, tpr_xgb: 1 },
];

const confusionMatrix = [
    { label: "True Positive", value: 156 },
    { label: "False Positive", value: 34 },
    { label: "False Negative", value: 39 },
    { label: "True Negative", value: 771 },
];

// Lifecycle Data
const lifecyclePhases = [
    {
        phase: 1,
        title: "Research & Development",
        description: "Model development in Jupyter notebooks using XGBoost",
        icon: Beaker,
        details: [
            "Data exploration & feature engineering",
            "XGBoost model training",
            "Cross-validation & hyperparameter tuning",
            "Feature importance analysis (SHAP)",
        ],
        metrics: { duration: "4-8 weeks", iterations: "50+", features: "8-15", baseline_auc: 0.72 },
        output: "Model artifact (.pkl) + Training Report",
    },
    {
        phase: 2,
        title: "Validation & Testing",
        description: "Comprehensive model evaluation and bias testing",
        icon: CheckCircle,
        details: [
            "Performance metrics: AUC, Gini, Lift",
            "Bias detection across demographics",
            "Stress testing on edge cases",
            "Business rule validation",
        ],
        metrics: { auc: 0.78, gini: 0.56, lift_at_10: 2.15, bias_score: 0.94 },
        output: "Validation Report + Certifications",
    },
    {
        phase: 3,
        title: "Production Deployment",
        description: "SageMaker endpoint deployment with monitoring",
        icon: Cloud,
        details: [
            "Model containerization (Docker)",
            "AWS SageMaker endpoint creation",
            "API integration with dashboard",
            "Load testing & failover setup",
        ],
        metrics: { latency_ms: 85, throughput_rps: 1000, availability: 99.9, endpoint_cost: "$50/day" },
        output: "Production Endpoint + SLA Document",
    },
    {
        phase: 4,
        title: "Monitoring & Maintenance",
        description: "Continuous monitoring for drift and performance",
        icon: TrendingDown,
        details: [
            "PSI monitoring (Population Stability Index)",
            "Data drift detection",
            "Model performance tracking",
            "Automated retraining triggers",
        ],
        metrics: { psi_threshold: 0.25, update_frequency: "Monthly", dashboards: 5, alerts: "Real-time" },
        output: "CloudWatch Dashboard + Alerts",
    },
];

const performanceProgression = [
    { phase: "Dev", auc: 0.72, gini: 0.44, precision: 0.75, recall: 0.68 },
    { phase: "Validation", auc: 0.78, gini: 0.56, precision: 0.82, recall: 0.75 },
    { phase: "Production", auc: 0.77, gini: 0.54, precision: 0.80, recall: 0.73 },
];

const timelineData = [
    { month: "Month 1", research: 100, validation: 10, deployment: 0, monitoring: 0 },
    { month: "Month 2", research: 90, validation: 40, deployment: 0, monitoring: 0 },
    { month: "Month 3", research: 20, validation: 80, deployment: 20, monitoring: 0 },
    { month: "Month 4", research: 5, validation: 20, deployment: 100, monitoring: 30 },
    { month: "Month 5+", research: 0, validation: 10, deployment: 100, monitoring: 100 },
];

export default function ModelIntelligence() {
    const [activeTab, setActiveTab] = useState("performance");

    return (
        <div className="space-y-6">
            <PageHeader
                title="Model Intelligence"
                description="Comprehensive analysis of model performance metrics and end-to-end development lifecycle."
            />

            <Tabs defaultValue="performance" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 p-1 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50">
                    <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                        <Activity className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="lifecycle" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                        <GitBranch className="h-4 w-4 mr-2" />
                        Lifecycle
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Model comparison table */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Model</th>
                                    <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">AUC</th>
                                    <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Precision</th>
                                    <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Recall</th>
                                    <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">F1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {models.map((m, i) => (
                                    <tr key={m.model} className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${i === 2 ? "bg-accent/40" : ""}`}>
                                        <td className="p-4 font-medium flex items-center gap-2">
                                            {m.model}
                                            {i === 2 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-chart-blue font-bold bg-chart-blue/10 px-2 py-0.5 rounded-full">
                                                    <Trophy className="h-3 w-3" /> Primary
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-mono font-semibold">{m.auc.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono text-muted-foreground">{m.precision.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono text-muted-foreground">{m.recall.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono text-muted-foreground">{m.f1.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-5">ROC Curve</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={rocData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                                    <XAxis dataKey="fpr" label={{ value: "FPR", position: "bottom", fontSize: 11 }} tick={{ fontSize: 11 }} />
                                    <YAxis label={{ value: "TPR", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="tpr_xgb" stroke="hsl(220, 60%, 18%)" fill="hsl(220, 60%, 18%)" fillOpacity={0.08} name="XGBoost" strokeWidth={2.5} />
                                    <Area type="monotone" dataKey="tpr_rf" stroke="hsl(210, 70%, 50%)" fill="hsl(210, 70%, 50%)" fillOpacity={0.04} name="Random Forest" strokeWidth={1.5} />
                                    <Area type="monotone" dataKey="tpr_lr" stroke="hsl(220, 10%, 60%)" fill="none" name="Logistic Reg." strokeWidth={1} strokeDasharray="4 4" />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-5">Confusion Matrix (XGBoost)</h3>
                            <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto mt-6">
                                {confusionMatrix.map((cell, i) => (
                                    <div
                                        key={cell.label}
                                        className={`rounded-xl p-5 text-center transition-shadow hover:shadow-md ${i === 0 || i === 3 ? "bg-risk-low-bg border border-risk-low/15" : "bg-risk-high-bg border border-risk-high/15"
                                            }`}
                                    >
                                        <p className="text-2xl font-bold font-mono tracking-tight">{cell.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] mt-1.5 font-medium">{cell.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-accent/40 border border-border rounded-xl p-5">
                        <h3 className="text-[11px] font-bold text-foreground/80 uppercase tracking-[0.1em] mb-3">
                            Metric Importance in Credit Risk
                        </h3>
                        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                            In credit risk, we prioritize AUC-ROC because it handles class imbalance (few defaults vs. many good loans) better than pure accuracy. Our XGBoost pipeline is calibrated to maintain high discriminative power while surfacing SHAP-based explainability for every decision.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="lifecycle" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Timeline Visualization */}
                    <div className="bg-gradient-to-br from-card/80 to-card/50 border border-border/50 rounded-xl shadow-md p-7 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            Resource Allocation over Timeline
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={timelineData} margin={{ left: 10, right: 10, top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
                                <YAxis tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "hsl(220, 20%, 12%)", border: "1px solid hsl(220, 15%, 30%)", borderRadius: "8px" }}
                                    labelStyle={{ color: "hsl(220, 8%, 80%)" }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: "15px" }} />
                                <Bar dataKey="research" stackId="a" fill="#3b82f6" name="Research" />
                                <Bar dataKey="validation" stackId="a" fill="#8b5cf6" name="Validation" />
                                <Bar dataKey="deployment" stackId="a" fill="#10b981" name="Deployment" />
                                <Bar dataKey="monitoring" stackId="a" fill="#f59e0b" name="Monitoring" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Lifecycle PHASES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {lifecyclePhases.map((phase) => {
                            const Icon = phase.icon;
                            return (
                                <Card key={phase.phase} className="p-6 border-border/50 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-500 group">
                                    <div className="flex gap-5">
                                        <div className="p-3 h-fit bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all">
                                            <Icon className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em]">Phase {phase.phase}</span>
                                                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{phase.output.split('+')[0]}</span>
                                            </div>
                                            <h4 className="font-bold text-foreground mb-1">{phase.title}</h4>
                                            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2 mb-4">{phase.description}</p>
                                            <div className="space-y-1.5 border-t border-border/40 pt-4">
                                                {phase.details.slice(0, 3).map((d, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                        <div className="h-1 w-1 rounded-full bg-blue-500" />
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="bg-gradient-to-br from-card/80 to-card/50 border border-border/50 rounded-xl shadow-md p-7 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            Model Performance Progression
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={performanceProgression}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                                <XAxis dataKey="phase" tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
                                <YAxis domain={[0.4, 1]} tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "hsl(220, 20%, 12%)", border: "1px solid hsl(220, 15%, 30%)", borderRadius: "8px" }}
                                    labelStyle={{ color: "hsl(220, 8%, 80%)" }}
                                    formatter={(value: any) => value.toFixed(3)}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: "15px" }} />
                                <Line type="monotone" dataKey="auc" stroke="#3b82f6" strokeWidth={2} name="AUC" />
                                <Line type="monotone" dataKey="gini" stroke="#8b5cf6" strokeWidth={2} name="Gini" />
                                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} name="Precision" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Risk Controls Footer */}
            <Card className="p-8 border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                            Integrated Governance & Controls
                        </h3>
                        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                            Every stage of the model lifecycle — from feature matrix construction to production deployment — is governed by an automated Control Matrix. We monitor for ROC AUC drift, Population Stability Index (PSI) shifts, and potential bias in the score distributions every 24 hours. Any deviation beyond the established 0.05 threshold triggers an automated retraining and review sequence.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
