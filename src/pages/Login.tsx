import { SignIn, SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Sparkles, Zap, Shield, Users } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 p-2 flex items-center justify-center">
                <img src="/logo.svg" alt="Mission Control" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-sm text-muted-foreground">Zero Human Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Orchestrate your AI agents with{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                precision and power
              </span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Deploy, manage, and scale your autonomous AI workforce across 130+ integrations.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Lightning Fast</h3>
                <p className="text-xs text-muted-foreground">Real-time agent orchestration</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Secure & Private</h3>
                <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Multi-Agent</h3>
                <p className="text-xs text-muted-foreground">Coordinate agent squads</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">130+ Integrations</h3>
                <p className="text-xs text-muted-foreground">Connect to any SaaS tool</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-6 border-t border-border/50">
            <div>
              <div className="text-2xl font-bold text-foreground">4</div>
              <div className="text-xs text-muted-foreground">Active Agents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">130+</div>
              <div className="text-xs text-muted-foreground">Integrations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex flex-col items-center lg:items-end">
          {/* Mobile branding */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 p-2 flex items-center justify-center">
                <img src="/logo.svg" alt="Mission Control" className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Mission Control</h1>
            <p className="text-sm text-muted-foreground">Zero Human Platform</p>
          </div>

          <div className="w-full max-w-md">
            {mode === "signin" ? (
              <SignIn
                appearance={{
                  baseTheme: dark,
                  elements: {
                    rootBox: "w-full",
                    card: "bg-card/80 backdrop-blur-xl shadow-2xl border border-border/50 rounded-2xl",
                    headerTitle: "text-2xl font-bold",
                    headerSubtitle: "text-muted-foreground",
                    socialButtonsBlockButton: "bg-surface-hover border-border/50 hover:bg-surface-hover/80 text-foreground",
                    socialButtonsBlockButtonText: "font-medium",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-medium",
                    formFieldInput: "bg-surface border-border/50 text-foreground",
                    footerActionLink: "text-primary hover:text-primary/80",
                    identityPreviewEditButton: "text-primary hover:text-primary/80",
                    formFieldLabel: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                    otpCodeFieldInput: "border-border/50 text-foreground",
                    formResendCodeLink: "text-primary hover:text-primary/80",
                    footer: "hidden",
                  },
                  layout: {
                    socialButtonsPlacement: "top",
                    socialButtonsVariant: "blockButton",
                  },
                }}
                routing="hash"
              />
            ) : (
              <SignUp
                appearance={{
                  baseTheme: dark,
                  elements: {
                    rootBox: "w-full",
                    card: "bg-card/80 backdrop-blur-xl shadow-2xl border border-border/50 rounded-2xl",
                    headerTitle: "text-2xl font-bold",
                    headerSubtitle: "text-muted-foreground",
                    socialButtonsBlockButton: "bg-surface-hover border-border/50 hover:bg-surface-hover/80 text-foreground",
                    socialButtonsBlockButtonText: "font-medium",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-medium",
                    formFieldInput: "bg-surface border-border/50 text-foreground",
                    footerActionLink: "text-primary hover:text-primary/80",
                    identityPreviewEditButton: "text-primary hover:text-primary/80",
                    formFieldLabel: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                    otpCodeFieldInput: "border-border/50 text-foreground",
                    formResendCodeLink: "text-primary hover:text-primary/80",
                    footer: "hidden",
                  },
                  layout: {
                    socialButtonsPlacement: "top",
                    socialButtonsVariant: "blockButton",
                  },
                }}
                routing="hash"
              />
            )}

            {/* Toggle between sign in and sign up */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary hover:text-primary/80 font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-primary hover:text-primary/80 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            {/* Custom footer */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
