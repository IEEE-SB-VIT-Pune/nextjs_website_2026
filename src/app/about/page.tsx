"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  { name: "Shreeram", role: "Competitive Programming Head", image: shreeram },
  { name: "Shalvi", role: "Vice Chairperson", image: shalvi },
  { name: "Dhruv", role: "Secretary", image: dhruv },
  { name: "Saumya", role: "Curation Head", image: saumya },
  { name: "Vedant Mishra", role: "Sponsorship Head", image: vedantMishraCore },
  { name: "Pragati", role: "Secretary", image: pragati },
  { name: "Punyesh", role: "Finance Head", image: punyesh },
  { name: "Swanandi", role: "Aesthetic Head", image: swanandi },
  { name: "Trishul", role: "PR, Design & Multimedia Head", image: trishul },
  { name: "Mihir", role: "PR, Design & Multimedia Head", image: mihir },
  { name: "Siddhant", role: "Coding Club Head", image: siddhant },
  { name: "Ojas", role: "Coding Club Head", image: ojas },
  { name: "Nirmit", role: "AI Head", image: nirmit },
  { name: "Prathamesh", role: "Web Head", image: prathameshCore },
  { name: "Kalyani", role: "App Head", image: kalyani },
  { name: "Yash Gandhi", role: "Research Head", image: yashGandhi },
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
              Discover the vision, mission, and incredible team behind our IEEE Student Branch
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              MEET THE <span className="text-primary">TEAM</span>
            </h2>
          </div>

          <div className="space-y-16">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Faculty</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Core 2026-2027</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreTeam.map((member) => {
                  return (
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
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
