"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import teamImage from "@/assets/images/aboutUs/TeamImage.jpg";
import medha from "@/assets/images/aboutUs/Faculty/medha.png";
import jabade from "@/assets/images/aboutUs/Faculty/vaishali2.png";

import Dhanashree from "@/assets/images/aboutUs/core/core_25-26/Dhanashree_Petare.png";
import Harsh from "@/assets/images/aboutUs/core/core_25-26/Harsh_Mehta.png";
import Janhavi from "@/assets/images/aboutUs/core/core_25-26/Janhavi_Gattani.png";
import Nainish from "@/assets/images/aboutUs/core/core_25-26/Nainish_Jaiswal.png";
import Nitesh from "@/assets/images/aboutUs/core/core_25-26/Nitesh_Rajpurohit.png";
import Pratham from "@/assets/images/aboutUs/core/core_25-26/Pratham_Tomar.png";
import Prerak from "@/assets/images/aboutUs/core/core_25-26/Prerak_Gadpayale.png";
import Rushikesh from "@/assets/images/aboutUs/core/core_25-26/Rushikesh_gaikar.png";
import Sujal from "@/assets/images/aboutUs/core/core_25-26/Sujal_Thakur.png";
import Unnati from "@/assets/images/aboutUs/core/core_25-26/Unnati_Vaidya.png";
import VaibhavPanchal from "@/assets/images/aboutUs/core/core_25-26/Vaibhav_Panchal.png";
import VaibhavPujari from "@/assets/images/aboutUs/core/core_25-26/vaibhav_pujari.png";
import Vansh from "@/assets/images/aboutUs/core/core_25-26/Vansh_Bhatt.png";
import Yash from "@/assets/images/aboutUs/core/core_25-26/Yash_Kale.png";
import Yogiraj from "@/assets/images/aboutUs/core/core_25-26/Yogiraj_ chaukhande.png";

import profilePic from "@/assets/images/aboutUs/ExeComs Photos/ProfilePic.png";
import vedantMishra from "@/assets/images/aboutUs/ExeComs Photos/VedantMishra1.png";
import ojasManchanda from "@/assets/images/aboutUs/ExeComs Photos/OjasManchanda.png";
import sanikaBrahmankar from "@/assets/images/aboutUs/ExeComs Photos/SanikaBrahmankar.png";
import ifreenSiddiqui from "@/assets/images/aboutUs/ExeComs Photos/IfreenSiddiqui.png";
import harshSharma from "@/assets/images/aboutUs/ExeComs Photos/HarshSharma.png";
import yashWadhwani from "@/assets/images/aboutUs/ExeComs Photos/Yash_Wadhwani.png";
import aadiShah from "@/assets/images/aboutUs/ExeComs Photos/AadiShah.png";
import siddhantBelkhed from "@/assets/images/aboutUs/ExeComs Photos/Siddhant Belkhed.png";
import jayshreeToshniwal from "@/assets/images/aboutUs/ExeComs Photos/JayshreeToshniwal.png";
import radhikaKawadkar from "@/assets/images/aboutUs/ExeComs Photos/RadhikaKawadkar.png";
import riyaGattani from "@/assets/images/aboutUs/ExeComs Photos/Riya_Gattani.png";
import nirmitHatti from "@/assets/images/aboutUs/ExeComs Photos/Nirmit_Hatti.png";
import tanayaHartalekar from "@/assets/images/aboutUs/ExeComs Photos/Tanaya_Hartalekar.png";
import shreeramUjlambkar from "@/assets/images/aboutUs/ExeComs Photos/Shreeram Ujlambkar.png";
import amoghToshniwal from "@/assets/images/aboutUs/ExeComs Photos/Amogh Toshniwal.png";
import harshalMarathe from "@/assets/images/aboutUs/ExeComs Photos/HarshalMarathe.png";
import kalyaniPatil from "@/assets/images/aboutUs/ExeComs Photos/KalyaniPatil.png";
import jayeshWaskar from "@/assets/images/aboutUs/ExeComs Photos/JayeshWaskar.png";
import shrushtiBalode from "@/assets/images/aboutUs/ExeComs Photos/Shrushti_Balode1.png";
import anushkaGikda from "@/assets/images/aboutUs/ExeComs Photos/Anushka_Gikda.png";
import keyaRachh from "@/assets/images/aboutUs/ExeComs Photos/Keya Rachh.png";
import saumyaDhorje from "@/assets/images/aboutUs/ExeComs Photos/Saumya_Dhorje.png";
import adityaPatil from "@/assets/images/aboutUs/ExeComs Photos/Aditya_Patil.png";
import pragatiLunkad from "@/assets/images/aboutUs/ExeComs Photos/PragatiLunkad.png";
import nishidaDatkar from "@/assets/images/aboutUs/ExeComs Photos/NIshidaDatkar.png";
import swanandiSalunkhe from "@/assets/images/aboutUs/ExeComs Photos/Swanandi_Salunkhe.png";
import punyeshKapre from "@/assets/images/aboutUs/ExeComs Photos/Punyesh Kapre.png";
import aaysha from "@/assets/images/aboutUs/ExeComs Photos/aaysha.png";
import krishnaRevanwar from "@/assets/images/aboutUs/ExeComs Photos/Krishna Revanwar.jpg";
import kavyaSharma from "@/assets/images/aboutUs/ExeComs Photos/KavyaSharma.png";
import ojasviBorkar from "@/assets/images/aboutUs/ExeComs Photos/OjasviBorkar.png";
import shalviMaheshwari from "@/assets/images/aboutUs/ExeComs Photos/shalvi_maheshwari.png";
import laukikaShinde from "@/assets/images/aboutUs/ExeComs Photos/LaukikaShinde.png";
import trishulJumde from "@/assets/images/aboutUs/ExeComs Photos/Trishul_Jumde.png";
import prathmeshToke from "@/assets/images/aboutUs/ExeComs Photos/Prathmesh Toke.png";

const faculty = [
  { name: "Prof. Dr. Medha Wyawahare", role: "Branch Mentor", image: medha },
  { name: "Prof. Dr. Vaishali Jabade", role: "Branch Counselor", image: jabade },
];

const coreTeam = [
  { name: "Vaibhav Pujari", role: "Chairperson", image: VaibhavPujari },
  { name: "Unnati Vaidya", role: "Vice Chairperson", image: Unnati },
  { name: "Vaibhav Panchal", role: "Finance Head", image: VaibhavPanchal },
  { name: "Nainish Jaiswal", role: "Secretary", image: Nainish },
  { name: "Rushikesh Gaikar", role: "Secretary", image: Rushikesh },
  { name: "Pratham Tomar", role: "Project Head", image: Pratham },
  { name: "Harsh Mehta", role: "Project Head", image: Harsh },
  { name: "Vansh Bhatt", role: "Project Head", image: Vansh },
  { name: "Sujal Thakur", role: "Sponsorship Head", image: Sujal },
  { name: "Nitesh Rajpurohit", role: "Curation Head", image: Nitesh },
  { name: "Janhavi Gattani", role: "Multimedia Head", image: Janhavi },
  { name: "Prerak Gadpayale", role: "Multimedia Head", image: Prerak },
  { name: "Yogiraj Chaukhande", role: "Coding Club Head", image: Yogiraj },
  { name: "Dhanashree Petare", role: "Coding Club Head", image: Dhanashree },
  { name: "Yash Kale", role: "Research Head", image: Yash },
];

const execomPhotos: Record<string, StaticImageData> = {
  VedantMishra1: vedantMishra,
  OjasManchanda: ojasManchanda,
  SanikaBrahmankar: sanikaBrahmankar,
  IfreenSiddiqui: ifreenSiddiqui,
  HarshSharma: harshSharma,
  Yash_Wadhwani: yashWadhwani,
  AadiShah: aadiShah,
  "Siddhant Belkhed": siddhantBelkhed,
  JayshreeToshniwal: jayshreeToshniwal,
  RadhikaKawadkar: radhikaKawadkar,
  Riya_Gattani: riyaGattani,
  Nirmit_Hatti: nirmitHatti,
  Tanaya_Hartalekar: tanayaHartalekar,
  "Shreeram Ujlambkar": shreeramUjlambkar,
  "Amogh Toshniwal": amoghToshniwal,
  HarshalMarathe: harshalMarathe,
  KalyaniPatil: kalyaniPatil,
  JayeshWaskar: jayeshWaskar,
  Shrushti_Balode1: shrushtiBalode,
  Anushka_Gikda: anushkaGikda,
  "Keya Rachh": keyaRachh,
  Saumya_Dhorje: saumyaDhorje,
  Aditya_Patil: adityaPatil,
  PragatiLunkad: pragatiLunkad,
  NIshidaDatkar: nishidaDatkar,
  Swanandi_Salunkhe: swanandiSalunkhe,
  "Punyesh Kapre": punyeshKapre,
  aaysha: aaysha,
  "Krishna Revanwar": krishnaRevanwar,
  KavyaSharma: kavyaSharma,
  OjasviBorkar: ojasviBorkar,
  shalvi_maheshwari: shalviMaheshwari,
  LaukikaShinde: laukikaShinde,
  Trishul_Jumde: trishulJumde,
  "Prathmesh Toke": prathmeshToke,
};

const execomTeam = [
  { name: "Vedant Mishra", domain: "AI-ML", photoKey: "VedantMishra1", role: "AI-ML" },
  { name: "Ojas Manchanda", domain: "Web Dev", photoKey: "OjasManchanda", role: "Web Dev" },
  { name: "Sanika Brahmankar", domain: "App Dev", photoKey: "SanikaBrahmankar", role: "App Dev" },
  { name: "Ifreen Siddiqui", domain: "Coding", photoKey: "IfreenSiddiqui", role: "Coding" },
  { name: "Harsh Sharma", domain: "Cyber Security", photoKey: "HarshSharma", role: "Cyber" },
  { name: "Yash Wadhwani", domain: "IoT", photoKey: "Yash_Wadhwani", role: "IoT" },
  { name: "Aadi Shah", domain: "Research", photoKey: "AadiShah", role: "Research" },
  { name: "Siddhant Belkhed", domain: "AI-ML", photoKey: "Siddhant Belkhed", role: "AI-ML" },
  { name: "Jayshree Toshniwal", domain: "Web Dev", photoKey: "JayshreeToshniwal", role: "Web Dev" },
  { name: "Radhika Kawadkar", domain: "App Dev", photoKey: "RadhikaKawadkar", role: "App Dev" },
  { name: "Riya Gattani", domain: "Coding", photoKey: "Riya_Gattani", role: "Coding" },
  { name: "Nirmit Hatti", domain: "Cyber Security", photoKey: "Nirmit_Hatti", role: "Cyber" },
  { name: "Tanaya Hartalekar", domain: "IoT", photoKey: "Tanaya_Hartalekar", role: "IoT" },
  { name: "Shreeram Ujlambkar", domain: "Research", photoKey: "Shreeram Ujlambkar", role: "Research" },
  { name: "Amogh Toshniwal", domain: "AI-ML", photoKey: "Amogh Toshniwal", role: "AI-ML" },
  { name: "Harshal Marathe", domain: "Web Dev", photoKey: "HarshalMarathe", role: "Web Dev" },
  { name: "Kalyani Patil", domain: "App Dev", photoKey: "KalyaniPatil", role: "App Dev" },
  { name: "Jayesh Waskar", domain: "Coding", photoKey: "JayeshWaskar", role: "Coding" },
  { name: "Shrushti Balode", domain: "Cyber Security", photoKey: "Shrushti_Balode1", role: "Cyber" },
  { name: "Anushka Gikda", domain: "IoT", photoKey: "Anushka_Gikda", role: "IoT" },
  { name: "Keya Rachh", domain: "Research", photoKey: "Keya Rachh", role: "Research" },
  { name: "Saumya Dhorje", domain: "AI-ML", photoKey: "Saumya_Dhorje", role: "AI-ML" },
  { name: "Aditya Patil", domain: "Web Dev", photoKey: "Aditya_Patil", role: "Web Dev" },
  { name: "Pragati Lunkad", domain: "App Dev", photoKey: "PragatiLunkad", role: "App Dev" },
  { name: "Nishida Datkar", domain: "Coding", photoKey: "NIshidaDatkar", role: "Coding" },
  { name: "Swanandi Salunkhe", domain: "Cyber Security", photoKey: "Swanandi_Salunkhe", role: "Cyber" },
  { name: "Punyesh Kapre", domain: "IoT", photoKey: "Punyesh Kapre", role: "IoT" },
  { name: "Aaysha", domain: "Research", photoKey: "aaysha", role: "Research" },
  { name: "Krishna Revanwar", domain: "AI-ML", photoKey: "Krishna Revanwar", role: "AI-ML" },
  { name: "Kavya Sharma", domain: "Web Dev", photoKey: "KavyaSharma", role: "Web Dev" },
  { name: "Ojasvi Borkar", domain: "App Dev", photoKey: "OjasviBorkar", role: "App Dev" },
  { name: "Shalvi Maheshwari", domain: "Coding", photoKey: "shalvi_maheshwari", role: "Coding" },
  { name: "Laukika Shinde", domain: "Cyber Security", photoKey: "LaukikaShinde", role: "Cyber" },
  { name: "Trishul Jumde", domain: "IoT", photoKey: "Trishul_Jumde", role: "IoT" },
  { name: "Prathmesh Toke", domain: "Research", photoKey: "Prathmesh Toke", role: "Research" },
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
              <h3 className="text-xl font-semibold mb-6">Faculty</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.map((member) => (
                  <div key={member.name} className="p-5 rounded-xl border-4 border-stone-300 bg-card/50 hover:scale-105 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-primary/30">
                        <AvatarImage src={member.image.src} alt={member.name} />
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
              <h3 className="text-xl font-semibold mb-6">Core 2025-2026</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreTeam.map((member) => {
                  return (
                    <div key={member.name} className="p-5 rounded-xl border-4 border-stone-300 bg-card/50 hover:scale-105 transition-all">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border border-primary/30">
                          <AvatarImage src={member.image.src} alt={member.name} />
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
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">Execom 2025-2026</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {execomTeam.map((member) => {
                  return (
                    <div key={member.name} className="p-6 rounded-xl border-4 border-stone-300 bg-card/50 hover:scale-105 transition-all flex flex-col items-center justify-center text-center">
                      <Avatar className="h-16 w-16 border border-primary/30 mb-4">
                        <AvatarImage
                          src={(execomPhotos[member.photoKey] ?? profilePic).src}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initialsFromName(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
