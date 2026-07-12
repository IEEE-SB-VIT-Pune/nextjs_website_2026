"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import codegif from "@/assets/images/events/eventPage_Animation/code.gif";
import webdevgif from "@/assets/images/events/eventPage_Animation/webDev.gif";
import neural from "@/assets/images/events/eventPage_Animation/neural.gif";
import python from "@/assets/images/events/eventPage_Animation/python.gif";
import quantum from "@/assets/images/events/eventPage_Animation/quantum.gif";
import blockchain from "@/assets/images/events/eventPage_Animation/blockchain.gif";
import eventVector from "@/assets/images/events/icons/eventpageVector.png";
import workshopIcon from "@/assets/images/events/icons/workshop_indivi.png";
import ktIcon from "@/assets/images/events/icons/KT.png";


const previousEvents = [
  // {
  //   id: 1,
  //   title: "CodeZest",
  //   description:
  //     "An exciting coding event, a brain game that tests the programmer's problem solving skills. Not just a ambitious coding competion alone but also an but along an interactive session with an expert in the domain.",
  //   url: codegif,
  // },
  // {
  //   id: 2,
  //   title: "Neural Network Bootcamp",
  //   description:
  //     "A workshop that demystified the difference between deep learning and machine learning providing practical knowledge to implement in various fields and projects.",
  //   url: neural,
  // },
  // {
  //   id: 3,
  //   title: "Avenir",
  //   description:
  //     "A workshop that demystified the difference between deep learning and machine learning providing practical knowledge to implement in various fields and projects.",
  //   url: webdevgif,
  // },
  // {
  //   id: 4,
  //   title: "IEEE Day",
  //   description:
  //     "A workshop that demystified the difference between deep learning and machine learning providing practical knowledge to implement in various fields and projects.",
  //   url: "",
  // },
  // {
  //   id: 5,
  //   title: "Blockchain",
  //   description:
  //     "A workshop that demystified the difference between deep learning and machine learning providing practical knowledge to implement in various fields and projects.",
  //   url: blockchain,
  // },
  // {
  //   id: 6,
  //   title: "Python Workshop",
  //   description:
  //     "A workshop that demystified the difference between deep learning and machine learning providing practical knowledge to implement in various fields and projects.",
  //   url: python,
  // },
  // {
  //   id: 7,
  //   title: "Quantum Computing",
  //   description:
  //     "A workshop that demystified the difference between deep learning and machine learning providing practical knowledge to implement in various fields and projects.",
  //   url: quantum,
  // },
  {
    id: 8,
    title: "CodeZest'26",
    description:
      "A high-octane competitive coding hackathon challenging logic and speed across multiple divisions, held offline at VIT Pune.",
    url: codegif,
  },
  {
    id: 9,
    title: "Gate Smashers — Varun Singla",
    description:
      "An interactive tech talk with Varun Singla, founder of Gate Smashers, covering core CS subjects, AI integration, and core career skills.",
    url: "",
  },
];

export default function EventsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex flex-col items-center gap-3">
              <Image
                src={eventVector}
                alt="Events"
                width={120}
                height={120}
                className="h-20 w-20 object-contain"
              />
              <h1 className="text-4xl md:text-5xl font-bold">
              Event <span className="text-primary glow-text">Highlights</span>
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A showcase of our recent workshops, bootcamps, and technical events.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Upcoming <span className="text-primary">Events</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Register now for our latest events!
            </p>
          </div>

          <div className="grid gap-8 max-w-2xl mx-auto">
            {/* Execom Recruitment 2026-2027 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border-4 border-stone-300 bg-card/50 overflow-hidden hover:scale-105 transition-all w-full"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">Recruitment</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">Online / Interview</span>
                </div>
                <h3 className="text-2xl font-bold">IEEE Execom Recruitment 2026-2027</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join the Executive Committee (Execom) of the IEEE Student Branch VIT Pune! This is your opportunity to lead, manage, and contribute to one of the oldest and most prestigious technical student organizations on campus.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground font-mono text-xs">
                  <p>✨ Open domains: Technical (Web, App, AI/ML, Coding, Cyber, IoT), Research, Curation, Sponsorship, Multimedia &amp; PR</p>
                  <p>✨ Develop leadership, teamwork, and project development skills</p>
                  <p>✨ Exclusive network and mentorship opportunities</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-muted-foreground text-xs">Eligible Batches</p>
                    <p className="font-bold text-primary">All Students</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-muted-foreground text-xs">Process</p>
                    <p className="font-bold">{"Form -> Interview"}</p>
                  </div>
                </div>
                <Link href="/recruitment" className="block w-full">
                  <button className="w-full mt-2 px-6 py-3 rounded-lg bg-primary text-black font-semibold hover:opacity-90 transition-opacity">
                    Apply Now 🚀
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Previous Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Previous <span className="text-primary">Events</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              className="group rounded-2xl border-4 border-stone-300 bg-card/50 overflow-hidden hover:scale-105 transition-all"
              >
                <div className="relative h-40 bg-muted/40">
                  <Image
                    src={event.url || eventVector}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 h-9 w-9 rounded-lg bg-background/70 border border-border/60 flex items-center justify-center">
                    <Image
                      src={index % 2 === 0 ? workshopIcon : ktIcon}
                      alt="Event type"
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
