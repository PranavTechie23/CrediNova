import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Shield, Eye, Users, Zap, TrendingUp, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const fairnessMetrics = [
  { demographic: "Age (18-25)", parity: 0.89, disparate_impact: 0.92, approval_rate: 68 },
  { demographic: "Age (26-35)", parity: 0.95, disparate_impact: 0.97, approval_rate: 75 },
  { demographic: "Age (36-50)", parity: 0.91, disparate_impact: 0.94, approval_rate: 72 },
  { demographic: "Age (51+)", parity: 0.88, disparate_impact: 0.91, approval_rate: 70 },
];

const radarData = [
  { metric: "Explainability", value: 92 },
  { metric: "Fairness", value: 88 },
  { metric: "Transparency", value: 95 },
  { metric: "Compliance", value: 98 },
  { metric: "Auditability", value: 91 },
  { metric: "Accountability", value: 89 },
];

const shapeValuesComparison = [
  { feature: "Income", bias_risk: 2.1, bias_mitigation: 1.8 },
  { feature: "Age", bias_risk: 3.4, bias_mitigation: 0.8 },
  { feature: "Employment", bias_risk: 2.8, bias_mitigation: 1.2 },
  { feature: "Credit History", bias_risk: 1.9, bias_mitigation: 1.6 },
];

export default function Compliance() {
  return (
    <>
      <PageHeader
        title="Compliance & Fairness"
        description="Model explainability, bias detection, and regulatory alignment documentation"
      />

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            title: "Regulatory Framework",
            items: [
              "Fair Lending Laws (ECOA, FHA)",
              "BASEL III Requirements",
              "GDPR & India's DPDP Act",
              "Fairness Audit (Four-Fifths Rule)",
              "Model Risk Management (SR 11-7)",
            ],
            icon: Shield,
            color: "from-blue-500 to-blue-600",
          },
          {
            title: "Internal Governance",
            items: [
              "Model Risk Committee",
              "Independent Validation",
              "Change Management",
              "Incident Response Plan",
            ],
            icon: CheckCircle,
            color: "from-green-500 to-green-600",
          },
          {
            title: "Operational Controls",
            items: [
              "Version Control (Git)",
              "Audit Trail Logging",
              "Performance Monitoring",
              "Retraining Triggers",
            ],
            icon: Zap,
            color: "from-purple-500 to-purple-600",
          },
        ].map((section, i) => {
          const Icon = section.icon;
          return (
            <Card key={i} className="p-6 border-border/50 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 bg-gradient-to-br ${section.color} text-white rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-500">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* SHAP Explainability */}
      <div className="bg-gradient-to-br from-card/80 to-card/50 border border-border/50 rounded-xl shadow-md p-7 backdrop-blur-sm mb-8">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          SHAP-Based Model Explainability
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-semibold text-foreground mb-4">What is SHAP?</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              SHAP (SHapley Additive exPlanations) is a game-theoretic approach to explain the output of machine learning models.
              For each prediction, SHAP values show how much each feature contributes to pushing the prediction away from the
              model's expected value.
            </p>
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/30">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Key Benefits</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Local explanations per decision</li>
                  <li>✓ Consistent with model predictions</li>
                  <li>✓ Interpretable to regulators</li>
                  <li>✓ Fair allocation of feature impact</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-4">Feature Contributions (Example)</p>
            <div className="space-y-2">
              {[
                { name: "Debt-to-Income Ratio", impact: 0.28, direction: "↑ Increases Risk" },
                { name: "Credit Utilization", impact: 0.25, direction: "↑ Increases Risk" },
                { name: "Annual Income", impact: -0.18, direction: "↓ Decreases Risk" },
                { name: "Income Stability", impact: -0.15, direction: "↓ Decreases Risk" },
                { name: "Past Delinquencies", impact: 0.12, direction: "↑ Increases Risk" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground/70">{item.direction}</p>
                  </div>
                  <div className="w-16 bg-muted rounded h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.impact > 0 ? "from-red-500 to-red-600" : "from-green-500 to-green-600"
                        }`}
                      style={{ width: `${Math.abs(item.impact) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-foreground w-8 text-right">{(item.impact * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">
            💡 In practice: When a customer is rejected, we can say: "Your application was declined because your
            debt-to-income ratio (contribution: +0.28) and credit utilization (contribution: +0.25) were the primary factors."
          </p>
        </div>
      </div>

      {/* Fairness Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-card/80 to-card/50 border border-border/50 rounded-xl shadow-md p-7 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            Demographic Parity Testing
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fairnessMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
              <XAxis dataKey="demographic" tick={{ fontSize: 10, fill: "hsl(220, 8%, 50%)" }} angle={-15} height={80} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 20%, 12%)", border: "1px solid hsl(220, 15%, 30%)", borderRadius: "8px" }}
                labelStyle={{ color: "hsl(220, 8%, 80%)" }}
                formatter={(value: any) => value.toFixed(2)}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="parity" fill="#10b981" name="Demographic Parity" />
              <Bar dataKey="disparate_impact" fill="#3b82f6" name="Disparate Impact Ratio" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 text-xs bg-muted/30 border border-border/30 rounded-lg">
            <p className="text-muted-foreground">
              <span className="font-semibold">Standards:</span> Values {">"}0.80 indicate acceptable fairness levels per EEOC guidelines
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card/80 to-card/50 border border-border/50 rounded-xl shadow-md p-7 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            Model Quality Scorecard
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 30%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(220, 8%, 50%)" }} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bias Mitigation */}
      <div className="bg-gradient-to-br from-card/80 to-card/50 border border-border/50 rounded-xl shadow-md p-7 backdrop-blur-sm mb-8">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          Bias Mitigation Strategies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={shapeValuesComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
              <XAxis dataKey="feature" tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 20%, 12%)", border: "1px solid hsl(220, 15%, 30%)", borderRadius: "8px" }}
                labelStyle={{ color: "hsl(220, 8%, 80%)" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="bias_risk" fill="#ef4444" name="Before Mitigation" />
              <Bar dataKey="bias_mitigation" fill="#10b981" name="After Mitigation" />
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            {[
              {
                title: "Removal of Protected Attributes",
                description: "Exclude gender, ethnicity, religion, and marital status from model inputs",
              },
              {
                title: "Feature Transformation",
                description: "Normalize features to reduce disparate impact",
              },
              {
                title: "Fairness Constraints",
                description: "Apply constraints during model training to enforce fairness",
              },
              {
                title: "Thresholding Optimization",
                description: "Adjust decision thresholds to equalize approval rates",
              },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors">
                <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { metric: "Protected Attributes", value: "Removed", status: "✓" },
            { metric: "Fairness Testing", value: "Quarterly", status: "✓" },
            { metric: "Monitoring Alerts", value: "Real-time", status: "✓" },
          ].map((item, i) => (
            <Card key={i} className="p-4 border-border/50 bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">{item.metric}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{item.value}</p>
                </div>
                <span className="text-lg font-bold text-green-600">{item.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Regulatory Alignment */}
      <Card className="p-8 border-border/50 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          Regulatory Alignment Matrix
        </h3>

        <div className="space-y-4">
          {[
            {
              regulation: "Fair Lending Laws (ECOA/FHA)",
              requirement: "No discrimination based on protected characteristics",
              implementation: "Excluded age, gender, race from feature set",
              status: "✓ Compliant",
            },
            {
              regulation: "SR 11-7 (Model Risk Management)",
              requirement: "Independent validation & governance framework",
              implementation: "Third-party validation + Risk Committee oversight",
              status: "✓ Compliant",
            },
            {
              regulation: "GDPR & India's DPDP Act",
              requirement: "Individuals have right to explanation and purpose limitation",
              implementation: "SHAP-based explanation + data minimisation protocols",
              status: "✓ Compliant",
            },
            {
              regulation: "CCPA Data Privacy",
              requirement: "Transparency in data collection and use",
              implementation: "Published model documentation and data dictionary",
              status: "✓ Compliant",
            },
            {
              regulation: "Fair Chance Hiring Laws",
              requirement: "Prohibition on banking information for employment",
              implementation: "Data segregation and access controls in place",
              status: "✓ Compliant",
            },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-lg border border-border/50 bg-muted/20 hover:border-border/70 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{item.regulation}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.requirement}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-500/20 text-green-600 whitespace-nowrap ml-4">
                  {item.status}
                </span>
              </div>
              <div className="pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground/80">
                  <span className="font-semibold text-foreground">Implementation:</span> {item.implementation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
