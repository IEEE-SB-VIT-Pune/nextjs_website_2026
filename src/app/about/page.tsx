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
    name: "Shreeram Ujlambkar",
    role: "Chairperson",
    image: shreeram,
    instagram: "https://www.instagram.com/shreeram_0606/?hl=en",
    linkedin: "https://www.linkedin.com/in/shreeuj06/",
    email: "shreeram.ujlambkar24@vit.edu",
  },
  {
    name: "Shalvi Maheshwari",
    role: "Vice Chairperson",
    image: shalvi,
    instagram: "https://www.instagram.com/shalvi1125?igsh=MTQ2ZjBjcmQ2aWhnNg==",
    linkedin: "https://www.linkedin.com/in/shalvi-maheshwari-59b289339?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    email: "shalvi.maheshwari24@vit.edu",
  },
  {
    name: "Dhruv Karanwal",
    role: "Joint Secretary",
    image: dhruv,
    instagram: "https://www.instagram.com/_dhruv.00_/",
    linkedin: "https://www.linkedin.com/in/dhruv-karanwal",
    email: "dhruv.karanwal24@vit.edu",
  },
  {
    name: "Saumya Dhorje",
    role: "Curation Head",
    image: saumya,
    instagram: "https://www.instagram.com/saumyad_30",
    linkedin: "https://www.linkedin.com/in/saumya-dhorje-5a596332a",
    email: "saumya.dhorje24@vit.edu",
  },
  {
    name: "Vedant Mishra",
    role: "Sponsorship Head",
    image: vedantMishraCore,
    instagram: "https://www.instagram.com/vedant.mishra47/",
    linkedin: "https://www.linkedin.com/in/vedantm47/",
    email: "vedant.mishra24@vit.edu",
  },
  {
    name: "Pragati Lunkad",
    role: "Joint Secretary",
    image: pragati,
    instagram: "https://www.instagram.com/__pragati17__/",
    linkedin: "https://www.linkedin.com/in/pragati-lunkad-25271a333/",
    email: "pragati.lunkad241@vit.edu",
  },
  {
    name: "Punyesh Kapre",
    role: "Treasurer",
    image: punyesh,
    instagram: "https://www.instagram.com/punyesh_17",
    linkedin:
      "https://www.linkedin.com/in/punyesh-kapre-534195330?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    email: "punyesh.kapre24@vit.edu",
  },
  {
    name: "Swanandi Salunkhe",
    role: "Aesthetics Head",
    image: swanandi,
    instagram:
      "https://www.instagram.com/sw.n.ndi?igsh=MTc4NzE1NXpxbmxybw==",
    linkedin:
      "https://www.linkedin.com/in/swanandisalunkhe?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    email: "swanandi.salunkhe241@vit.edu",
  },
  {
    name: "Trishul Jumde",
    role: "Multimedia Head",
    image: trishul,
    instagram:
      "https://www.instagram.com/trishul.01?igsh=cGJlYmhyNjIxNXZs",
    linkedin: "https://www.linkedin.com/in/trishul-jumde-26jan2006",
    email: "trishul.jumde24@vit.edu",
  },
  {
    name: "Mihir Patel",
    role: "Multimedia Head",
    image: mihir,
    instagram: "https://www.instagram.com/mihir07_patel_",
    linkedin: "https://www.linkedin.com/in/mihir-patel-a2542032b?",
    email: "patel.mihir24@vit.edu",
  },
  {
    name: "Siddhant Belkhede",
    role: "Coding Head",
    image: siddhant,
    instagram: "https://www.instagram.com/siddhant_belkhede",
    linkedin: "https://www.linkedin.com/in/siddhantbelkhede/",
    email: "siddhant.belkhede24@vit.edu",
  },
  {
    name: "Ojas Manchanda",
    role: "Coding Head",
    image: ojas,
    instagram: "https://www.instagram.com/ojas.manchanda/",
    linkedin: "https://www.linkedin.com/in/ojas-manchanda-981a74329/",
    email: "ojas.manchanda24@vit.edu",
  },
  {
    name: "Nirmit Hatti",
    role: "AI Project Head",
    image: nirmit,
    instagram: "https://www.instagram.com/nirmit_hatti07?igsh=amdtdmF3djVrZWFs",
    linkedin: "https://www.linkedin.com/in/nirmit-hatti-3b548a220",
    email: "nirmit.hatti24@vit.edu",
  },
  {
    name: "Prathmesh Toke",
    role: "Web Project Head",
    image: prathameshCore,
    instagram: "https://www.instagram.com/toke.prathmesh/",
    linkedin: "https://www.linkedin.com/in/toke-prathmesh/",
    email: "prathmesh.toke24@vit.edu",
  },
  {
    name: "Kalyani Patil",
    role: "App Project Head",
    image: kalyani,
    instagram: "https://www.instagram.com/kalyani__.patil/",
    linkedin: "https://www.linkedin.com/in/kalyani-patil06/",
    email: "kalyani.patil24@vit.edu",
  },
  {
    name: "Yash Gandhi",
    role: "Research Head",
    image: yashGandhi,
    instagram: "https://www.instagram.com/gandhiy_.19/",
    linkedin: "https://www.linkedin.com/in/yash-gandhi-ba9243298/",
    email: "yash.gandhi24@vit.edu",
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
