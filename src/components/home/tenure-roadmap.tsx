"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  GraduationCap,
  Layers,
  Sparkles,
  Trophy,
  Crown,
  ChevronRight,
  Info,
  CheckCircle2,
  Calendar,
  Award
} from "lucide-react";

interface StepItem {
  id: number;
  stepNumber: string;
  title: string;
  badge: string;
  shortDesc: string;
  fullDesc: string;
  highlights: string[];
  icon: any;
  accentColor: string;
}

const steps: StepItem[] = [
  {
    id: 1,
    stepNumber: "01",
    title: "Execom Recruitment",
    badge: "Phase 01 · Inductions",
    shortDesc: "Recruitment form, domain preference selection & candidate interview rounds.",
    fullDesc:
      "Open to all student batches! Candidates select their preferred technical & non-technical domains (Web, AI/ML, App Dev, Coding Club, Research, Curation, Sponsorship, PR & Design) and undergo domain-specific panel interviews.",
    highlights: ["Open to All Batches", "Multi-Domain Selections", "Panel Interview Evaluations"],
    icon: UserCheck,
    accentColor: "from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    stepNumber: "02",
    title: "Execom Training (ETP)",
    badge: "Phase 02 · Skillup",
    shortDesc: "Hands-on technical bootcamps, git workflows, peer mentorship & team working.",
    fullDesc:
      "Newly inducted members undergo the Execom Training Program (ETP), receiving structured peer-to-peer technical mentorship, learning collaborative GitHub workflows, project architecture, and event management protocols.",
    highlights: ["Git & GitHub Workflows", "Peer Mentorship", "Team Working"],
    icon: GraduationCap,
    accentColor: "from-purple-500 to-indigo-600",
  },
  {
    id: 3,
    stepNumber: "03",
    title: "Project & Domain Teams",
    badge: "Phase 03 · Execution",
    shortDesc: "Forming domain squads to build real-world software, APMC systems & research papers.",
    fullDesc:
      "Execom members are deployed into specialized domain squads. Teams build live web/mobile applications, conduct AI/ML mini-projects, draft research papers, and secure corporate sponsorships.",
    highlights: ["Live Client Software", "AI Research Papers", "Mobile App Releases"],
    icon: Layers,
    accentColor: "from-blue-500 to-cyan-400",
  },
  {
    id: 4,
    stepNumber: "04",
    title: "Tech Talks ",
    badge: "Phase 04 · Engagement",
    shortDesc: "Organizing campus-wide workshops, AI Agents bootcamps & GSoC expert talks.",
    fullDesc:
      "Hosting high-impact student workshops and guest lectures. Highlights include Neural Networks bootcamps, Gate Smashers Tech Talk with Varun Singla, Web3 seminars, and GSoC preparation sessions.",
    highlights: ["Neural Network Bootcamps", "Industry Expert Talks", "GSoC & Web3 Seminars"],
    icon: Sparkles,
    accentColor: "from-emerald-500 to-teal-400",
  },
  {
    id: 5,
    stepNumber: "05",
    title: "Flagship Hackathons",
    badge: "Phase 05 · Flagships",
    shortDesc: "CodeZest hackathons, Avenir web championships & competitive coding battles.",
    fullDesc:
      "Executing IEEE VIT Pune's annual flagship events: CodeZest competitive coding hackathon and Workshops, featuring cash prize pools and participants from top institutes.",
    highlights: ["CodeZest Offline Hackathon", "Emerging Workshop", "Cash Prize Pools"],
    icon: Trophy,
    accentColor: "from-amber-500 to-orange-500",
  },
  {
    id: 6,
    stepNumber: "06",
    title: "IEEE Day & Handover",
    badge: "Phase 06 · Legacy",
    shortDesc: "Annual branch celebrations, felicitations & passing the torch to the next Execom.",
    fullDesc:
      "Celebrating 27+ years of IEEE legacy at VIT Pune. Members receive official IEEE certification, outstanding performance awards are presented, and the tenure smoothly transitions to the next Execom core.",
    highlights: ["27+ Years Legacy", "Certificate Distribution", "Core Handover & Ceremony"],
    icon: Crown,
    accentColor: "from-pink-500 to-rose-600",
  },
];

export default function TenureRoadmap() {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  return (
    <section className="py-20 border-t border-border/50 relative overflow-hidden bg-card/20">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Calendar className="w-3.5 h-3.5" />
            Tenure Process Flow
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Our Annual <span className="text-primary glow-text">Tenure Roadmap</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
          >
            From inductions to flagship hackathons — discover how an IEEE VIT Pune tenure unfolds step by step.
          </motion.p>
        </div>

        {/* Horizontal Desktop Flow Stepper */}
        <div className="hidden lg:block relative mb-12">
          {/* Connector Line behind steps */}
          <div className="absolute top-10 left-12 right-12 h-1 bg-border/80 rounded-full z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-full"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>

          {/* Stepper Nodes Grid */}
          <div className="grid grid-cols-6 gap-3 relative z-10">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              const isSelected = activeStepId === step.id;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setActiveStepId(step.id)}
                  onClick={() => setActiveStepId(step.id)}
                  className="flex flex-col items-center text-center cursor-pointer group"
                >
                  {/* Step Bubble Button */}
                  <div
                    className={`relative flex items-center justify-center w-20 h-20 rounded-2xl border-2 transition-all duration-300 ${isSelected
                      ? "scale-110 border-primary bg-card/90 shadow-2xl"
                      : "border-border/60 bg-card/40 hover:border-primary/50 hover:scale-105"
                      }`}
                    style={{
                    }}
                  >
                    {/* Number Badge */}
                    <span
                      className={`absolute -top-2.5 -right-2.5 text-[11px] font-black px-2 py-0.5 rounded-full border shadow-md ${isSelected
                        ? "bg-primary text-black border-primary font-mono"
                        : "bg-muted text-muted-foreground border-border font-mono"
                        }`}
                    >
                      {step.stepNumber}
                    </span>

                    <IconComp
                      className={`w-8 h-8 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                    />
                  </div>

                  <div className="mt-4 space-y-1">
                    <p
                      className={`text-xs font-bold leading-tight transition-colors ${isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Interactive Dialog Card (Desktop View) */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border-2 border-primary/30 bg-card/70 backdrop-blur-xl p-8 relative overflow-hidden shadow-2xl"
              style={{
              }}
            >
              {/* Decorative Accent Glow */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeStep.accentColor}`}
              />

              <div className="grid grid-cols-12 gap-8 items-center">
                {/* Icon & Title */}
                <div className="col-span-5 space-y-4 border-r border-border/40 pr-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold">
                    <Award className="w-3.5 h-3.5" />
                    {activeStep.badge}
                  </div>

                  <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <span>{activeStep.title}</span>
                    <span className="text-xs font-mono text-muted-foreground font-normal">
                    </span>
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeStep.fullDesc}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="col-span-7 space-y-4 pl-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-primary" /> Key Highlights & Deliverables
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeStep.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold text-foreground">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile / Tablet Accordion Flow View */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            const isOpen = activeStepId === step.id;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border-2 transition-all overflow-hidden ${isOpen
                  ? "border-primary bg-card/90 shadow-xl"
                  : "border-border/60 bg-card/40 hover:border-border"
                  }`}
              >
                {/* Step Header */}
                <button
                  onClick={() => setActiveStepId(isOpen ? 0 : step.id)}
                  className="w-full p-4 flex items-center justify-between text-left gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border font-mono text-xs font-bold shrink-0 ${isOpen
                        ? "bg-primary text-black border-primary"
                        : "bg-muted text-muted-foreground border-border"
                        }`}
                    >
                      {step.stepNumber}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90 text-primary" : ""
                      }`}
                  />
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold">
                        {step.badge}
                      </span>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.fullDesc}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Key Deliverables:
                        </p>
                        {step.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-foreground font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
