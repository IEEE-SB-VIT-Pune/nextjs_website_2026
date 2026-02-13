"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";

import vitLogo from "@/assets/images/vit_logo/vit_logo.png";
import cardGif from "@/assets/images/card/right2_.gif";

import ieeeDay from "@/assets/images/gallery/ieee_Day.jpeg";
import codezest from "@/assets/images/gallery/CodeZest (2).jpg";
import aiAgents from "@/assets/images/gallery/AI_Agents_workshop.jpeg";
import introMeet from "@/assets/images/gallery/Intro_Meet.jpeg";
import gsoc from "@/assets/images/gallery/GSoC (4).jpg";
import industryVisit from "@/assets/images/gallery/IndustrialV.jpg";
import web3 from "@/assets/images/gallery/Web3.jpg";
import pythonWorkshop from "@/assets/images/gallery/PythonWS.jpg";
import socialVisit from "@/assets/images/gallery/Social_Visit.jpeg";
import researchSession from "@/assets/images/gallery/Research_Session.jpeg";

const domains = [
  {
    title: "AI - ML",
    description:
      "IEEE is absolutely aware of the rising significance of AI. Owing to its numerous applications, the club has even uploaded its own YouTube playlists of various AI based mini projects. In a recent workshop based on Neural Networks, the attendees were also taught to build a traffic recognition system right from scratch.",
  },
  {
    title: "Web Dev",
    description:
      "IEEE VIT SB Pune actively indulges in one of the most lucrative and fast-growing technologies - web development. Few of our previous triumphs on this domain include the JavaScript workshop and Avenir - the frontend web dev competition, to name a few. The club also has its own team of web experts who undertake various industrial web dev projects.",
  },
  {
    title: "App Dev",
    description:
      "Wanna engage well with your audience? Apps are one of the best ways to keep your audience engaged and committed. We also have our own master app dev team who are all-set to launch our very own app. Some of our previous exemplars in this field include a project on developing a Stock Inventory management app for APMC.",
  },
  {
    title: "Coding Club",
    description:
      "One of our blockbusters, the coding club consists of all the enthusiastic programming geeks. The like-minded peeps meet twice a week in sessions organized exclusively for IEEE members. The instructors focus on helping you ace high profile questions solved from sites like Leetcode & Codeforces, along with various fun activities and competitions.",
  },
  {
    title: "Cyber Security",
    description:
      "We live in the digital era. As a result, several frauds and malicious attacks have been documented. Cybersecurity is required to preserve the internet era and it protects you from cybercriminals. IEEE organizes influential webinars and workshops to help the attendees understand more about cyber security.",
  },
  {
    title: "IoT",
    description:
      "Internet-of-Things gadgets are all around us, continually transferring data and talking to one another. Virtual assistants, smart electronics, and wearable health trackers are all examples of IoT devices we encounter daily. Each device collects data in real time and transmits it to make our lives more efficient.",
  },
  {
    title: "Research",
    description:
      "When tasked with finding a solution to a problem, research helps identify, assess, and collate. In universities, the research component allows for a more comprehensive educational experience. Our Research team is dedicated to keep you updated with the latest developments in the R&D sector of the technical domain in every possible way.",
  },
];

const galleryItems = [
  { src: ieeeDay, label: "IEEE Day 2025" },
  { src: codezest, label: "CodeZest" },
  { src: aiAgents, label: "AI Agents workshop" },
  { src: introMeet, label: "Intromeet" },
  { src: gsoc, label: "GSOC Seminar" },
  { src: industryVisit, label: "Industry Visit" },
  { src: web3, label: "Web 3.0 Seminar" },
  { src: pythonWorkshop, label: "Python Workshop" },
  { src: socialVisit, label: "Social Visit" },
  { src: researchSession, label: "Research Session" },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 h-80 w-80 rounded-full blur-[100px]" style={{ background: 'rgba(168, 85, 247, 0.05)' }} />
          <div className="absolute bottom-1/3 left-1/3 h-72 w-72 rounded-full blur-[100px]" style={{ background: 'rgba(34, 197, 94, 0.04)' }} />
          <div className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full blur-[100px]" style={{ background: 'rgba(59, 130, 246, 0.06)' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="glow-text" style={{ color: '#004dcc' }}>IEEE</span>{" "}
              <span className="text-foreground">SB VIT Pune</span>
            </h1>

            <p className="text-base md:text-lg font-semibold aurora-text">
              Institute of Electrical and Electronics Engineers
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Advancing Technology towards Humanity
            </p>

            
          </div>
        </div>
      </section>

      {/* About IEEE */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              About <span className="text-primary">IEEE</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn about the global organization and our student branch at VIT Pune.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border-4 border-stone-300 bg-card/50 space-y-4 hover:scale-105 transition-all">
              <div>
                <h3 className="text-xl font-semibold aurora-text mb-4">
                  Institute Of Electrical and Electronics Engineers
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The Institute of Electrical and Electronics Engineers (IEEE) is an international organization, which has been the nexus for propagating scientific expertise among people all over the globe. IEEE continues to attract students, faculty and professionals from various fields all around the world and is committed to incorporating diversity in thoughts which is essential for scientific development.
              </p>
              <div className="flex justify-end">
                <Image src={cardGif} alt="Tech animation" width={80} height={80} className="h-20 w-20 object-contain" />
              </div>
            </div>
            <div className="p-6 rounded-2xl border-4 border-stone-300 bg-card/50 space-y-4 hover:scale-105 transition-all">
              <div>
                <h3 className="text-xl font-semibold aurora-text mb-4">VIT Pune IEEE Student Branch</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The Institute of Electrical and Electronics Engineers (IEEE) is an international organization, which has been the nexus for propagating scientific expertise among people all over the globe. IEEE continues to attract students, faculty and professionals from various fields all around the world and is committed to incorporating diversity in thoughts which is essential for scientific development.
              </p>
              <div className="flex justify-end">
                <Image src={cardGif} alt="Tech animation" width={80} height={80} className="h-20 w-20 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Our <span className="text-primary">Domains</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Just to name a few..... we're not limited by these :)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {domains.map((domain) => (
              <GradientCard
                key={domain.title}
                title={domain.title}
                description={domain.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Gallery
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Moments from our workshops, talks, and community events.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl border-4 border-stone-300 bg-card/50 overflow-hidden hover:scale-105 transition-all"
              >
                <div className="relative h-52">
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
