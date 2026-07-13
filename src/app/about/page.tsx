"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin } from "lucide-react";

import teamImage from "@/assets/images/aboutUs/TeamImage.jpg";
import medha from "@/assets/images/aboutUs/Faculty/medha.png";
import jabade from "@/assets/images/aboutUs/Faculty/vaishali2.png";

import shreeram from "@/assets/images/aboutUs/core/core_26-27/Shreeram_Ujlambkar_.png";
import shalvi from "@/assets/images/aboutUs/core/core_26-27/shalvi_maheshwari.png";
import dhruv from "@/assets/images/aboutUs/core/core_26-27/Dhruv_Karanwal.png";
import saumya from "@/assets/images/aboutUs/core/core_26-27/SaumyaDhorje.png";
import vedantMishraCore from "@/assets/images/aboutUs/core/core_26-27/VedantMishra.png";
import pragati from "@/assets/images/aboutUs/core/core_26-27/Pragati_Lunkad.png";
import punyesh from "@/assets/images/aboutUs/core/core_26-27/punyesh.png";
import swanandi from "@/assets/images/aboutUs/core/core_26-27/SwanandiSalunkhe.png";
import trishul from "@/assets/images/aboutUs/core/core_26-27/trishul.png";
import mihir from "@/assets/images/aboutUs/core/core_26-27/Mihir.png";
import siddhant from "@/assets/images/aboutUs/core/core_26-27/Siddhant Belkhede.png";
import ojas from "@/assets/images/aboutUs/core/core_26-27/Ojas.png";
import nirmit from "@/assets/images/aboutUs/core/core_26-27/Nirmit.png";
import prathameshCore from "@/assets/images/aboutUs/core/core_26-27/Prathmesh Toke.png";
import kalyani from "@/assets/images/aboutUs/core/core_26-27/Kalyani_Patil.png";
import yashGandhi from "@/assets/images/aboutUs/core/core_26-27/Yash Gandhi .png";

const faculty = [
  { name: "Prof. Dr. Medha Wyawahare", role: "Branch Mentor", image: medha },
  { name: "Prof. Dr. Vaishali Jabade", role: "Branch Counselor", image: jabade },
];

const coreTeam = [
  {
    name: "Shreeram",
    role: "Competitive Programming Head",
    image: shreeram,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "shreeram.ujlambkar@ieee.org"
  },
  {
    name: "Shalvi",
    role: "Vice Chairperson",
    image: shalvi,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "shalvi.maheshwari@ieee.org"
  },
  {
    name: "Dhruv",
    role: "Secretary",
    image: dhruv,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "dhruv.karanwal@ieee.org"
  },
  {
    name: "Saumya",
    role: "Curation Head",
    image: saumya,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "saumya.dhorje@ieee.org"
  },
  {
    name: "Vedant Mishra",
    role: "Sponsorship Head",
    image: vedantMishraCore,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "vedant.mishra@ieee.org"
  },
  {
    name: "Pragati",
    role: "Secretary",
    image: pragati,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "pragati.lunkad@ieee.org"
  },
  {
    name: "Punyesh",
    role: "Finance Head",
    image: punyesh,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "punyesh.finance@ieee.org"
  },
  {
    name: "Swanandi",
    role: "Aesthetic Head",
    image: swanandi,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "swanandi.salunkhe@ieee.org"
  },
  {
    name: "Trishul",
    role: "PR, Design & Multimedia Head",
    image: trishul,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "trishul.pr@ieee.org"
  },
  {
    name: "Mihir",
    role: "PR, Design & Multimedia Head",
    image: mihir,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "mihir.pr@ieee.org"
  },
  {
    name: "Siddhant",
    role: "Coding Club Head",
    image: siddhant,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "siddhant.coding@ieee.org"
  },
  {
    name: "Ojas",
    role: "Coding Club Head",
    image: ojas,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "ojas.coding@ieee.org"
  },
  {
    name: "Nirmit",
    role: "AI Head",
    image: nirmit,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "nirmit.ai@ieee.org"
  },
  {
    name: "Prathamesh",
    role: "Web Head",
    image: prathameshCore,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "prathamesh.toke@ieee.org"
  },
  {
    name: "Kalyani",
    role: "App Head",
    image: kalyani,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "kalyani.app@ieee.org"
  },
  {
    name: "Yash Gandhi",
    role: "Research Head",
    image: yashGandhi,
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    email: "yash.gandhi@ieee.org"
  },
];

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function AboutPage() {
  return (
    <div>
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">
              ABOUT <span className="text-primary">IEEE</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advancing technology for the benefit of humanity. Join us in our
              mission to innovate, learn, and grow together.
            </p>
          </motion.div>

          <div className="mt-16 space-y-20">
            {/* Team Image Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden border border-border/40 shadow-2xl"
            >
              <Image
                src={teamImage}
                alt="IEEE VIT Pune Team"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
            </motion.div>

            {/* Faculty Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Faculty Mentors</h3>
              <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
                {faculty.map((member) => (
                  <div key={member.name} className="p-3 rounded-2xl border-4 border-stone-300 bg-card/50 hover:scale-105 transition-all aspect-square max-w-[240px] w-full mx-auto flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Avatar className="h-24 w-24 border border-primary/30 rounded-md">
                        <AvatarImage src={member.image.src} alt={member.name} className="object-contain rounded-md" />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initialsFromName(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Core 2026-2027</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {coreTeam.map((member) => {
                  return (
                    <div key={member.name} className="p-4 rounded-2xl border-4 border-stone-300 bg-card/50 hover:scale-105 transition-all max-w-[240px] w-full mx-auto flex flex-col items-center text-center justify-between min-h-[240px]">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-20 w-20 border border-primary/30 rounded-md">
                          <AvatarImage src={member.image.src} alt={member.name} className="object-contain rounded-md" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initialsFromName(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground text-sm">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold leading-tight">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 w-full mt-2 pt-2 border-t border-border/20">
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="text-[9px] text-muted-foreground hover:text-primary transition-colors truncate max-w-full font-mono">
                            {member.email}
                          </a>
                        )}
                        <div className="flex gap-2">
                          <a
                            href={member.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                            aria-label="Instagram"
                          >
                            <Instagram className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recruitment CTA block */}
            <div className="pt-8">
              <div className="max-w-2xl mx-auto text-center border-4 border-stone-300 bg-card/50 p-8 rounded-2xl space-y-6 hover:scale-[1.02] transition-all">
                <h3 className="text-2xl font-bold text-foreground">Execom 2026-2027</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The recruitment process for the Executive Committee (Execom) 2026-2027 is now officially live!
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-mono">
                    If you are eager to contribute to the IEEE VIT Pune Student Branch, collaborate with talented peers, and develop industry-relevant technical and managerial skills, fill out the recruitment questionnaire form now.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/recruitment">
                    <Button className="px-8 py-3 font-bold bg-primary hover:bg-primary/90 text-black rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">
                      Apply for Execom Recruitment
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
