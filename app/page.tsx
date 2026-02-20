import { ArrowRight, CheckCircle2, Code2, Handshake, Search, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/atomic/atoms";

const skills = [
  "Frontend Development",
  "UI/UX Design",
  "Backend APIs",
  "Mobile Apps",
  "SEO + Content",
  "Video Editing",
];

const steps = [
  {
    title: "Post your project",
    description: "Describe what you need, timeline, and budget in minutes.",
    icon: Search,
  },
  {
    title: "Get matched quickly",
    description: "Review vetted freelancers and choose the best fit.",
    icon: Handshake,
  },
  {
    title: "Pay after delivery",
    description: "Release funds only when the work is done and approved.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" width={30} height={30} alt="Zephyr logo" />
            <span className="text-xl font-semibold text-foreground">Zephyr</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-20 px-4 py-10 md:py-14">
        <section className="overflow-hidden rounded-3xl border bg-card">
          <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Trusted by teams worldwide
              </div>
              <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                Connecting clients with freelancers who deliver
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Hire experts for development, design, marketing, and more. Fast hiring, secure payments, and quality work.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full px-6">
                  <Link href="/signup">
                    Start Hiring <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link href="/signup">Become a Freelancer</Link>
                </Button>
              </div>
            </div>

            <div className="relative rounded-2xl bg-[linear-gradient(135deg,rgba(42,60,255,0.95),rgba(10,19,66,0.95))] p-5 text-white">
              <p className="mb-4 text-sm text-white/80">Find the right talent instantly</p>
              <div className="rounded-xl bg-white/12 p-3 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-900">
                  <Search className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-500">Search by skill, role, or project</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "UI Design", "Shopify"].map((item) => (
                    <span key={item} className="rounded-full bg-white/20 px-2.5 py-1 text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white/12 p-3">
                  <p className="text-white/70">Active Freelancers</p>
                  <p className="text-lg font-semibold text-white">12k+</p>
                </div>
                <div className="rounded-lg bg-white/12 p-3">
                  <p className="text-white/70">Projects Completed</p>
                  <p className="text-lg font-semibold text-white">48k+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-semibold">Explore millions of pros</h2>
            <p className="text-sm text-muted-foreground">Verified, skilled, and ready to work</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <article key={skill} className="rounded-2xl border bg-card p-4 shadow-sm">
                <Code2 className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-medium">{skill}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Top-rated freelancers available now.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <step.icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-[linear-gradient(135deg,#0f172a,#1e1b4b)] p-8 text-white md:p-10">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Ready to build your next project?</h2>
              <p className="mt-1 text-sm text-white/80">Join Zephyr today and collaborate with top talent.</p>
            </div>
            <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-white/90">
              <Link href="/signup">
                Get Started <CheckCircle2 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>(c) {new Date().getFullYear()} Zephyr. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/signin" className="hover:text-foreground">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
