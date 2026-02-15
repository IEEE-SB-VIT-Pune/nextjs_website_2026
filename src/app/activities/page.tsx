"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import activitiesGif from "@/assets/images/activities/activities.gif";
import research from "@/assets/images/activities/search.gif";
import codingBoy from "@/assets/images/activities/coding_table.gif";
import team from "@/assets/images/activities/team.gif";
import codingSmall from "@/assets/images/activities/boy_coding.gif";

export default function ActivitiesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                ACTIVITIES
              </h1>
              <Image src={activitiesGif} alt="Activities" width={72} height={72} className="h-16 w-16 object-contain" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Execom Training Program */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border-4 border-stone-300 bg-card/50 p-8 md:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              Execom Training Program (ETPs)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Project heads from our club tech domains—AI/ML, full stack web development, and app development—train our execom members. The best-performing students then work with the project heads on real-world projects.
            </p>
          </div>
        </div>
      </section>

      {/* Research Club */}
      <section className="py-10">
        <div className="container mx-auto px-4 space-y-12">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
            <div className="rounded-2xl border-4 border-stone-300 bg-card/50 p-6 flex items-center justify-center">
              <Image src={research} alt="Research club" width={320} height={320} className="object-contain" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">RESEARCH CLUB</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have an idea, we have a platform. IEEE as a global organization has been successful in uplifting the research quality of the students, as well as elevating their innovative skills. With a global network of researchers and engineers, our club provides an unparalleled platform for collaboration and knowledge sharing, as we support the next generation of innovators through our paper reading sessions and industrial visits.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-stone-300 bg-card/50">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/j_jJpIr8jLo?si=SGOV3xsxZtORrTTI"
                title="IEEE Research Club"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <div className="rounded-2xl border-4 border-stone-300 bg-card/50 p-6 flex items-center justify-center">
              <Image src={codingBoy} alt="Coding table" width={320} height={320} className="object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Coding Club */}
      <section className="py-10 border-t border-border/50">
        <div className="container mx-auto px-4 space-y-12">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
            <div className="rounded-2xl border-4 border-stone-300 bg-card/50 p-6 flex items-center justify-center">
              <Image src={team} alt="Coding club" width={320} height={320} className="object-contain" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">CODING CLUB</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to create a fun and supportive environment where we develop programming skills together. We want to replace DSA anxiety and code fear with inspiration and motivation to learn, and here we will share our experience. The main vision of the club is to improve the art of competitive programming skills in the students and to make them ready.
                <br></br>
                Code-Zest is our flagship coding event which attracts students from across Pune City.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-stone-300 bg-card/50">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/L9d35XH6icY?list=PLfHF1gQx_tdATmheQwKmnAMJS30Vh-ZqV"
                title="Arrays"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="rounded-2xl border-4 border-stone-300 bg-card/50 p-6 flex items-center justify-center">
              <Image src={codingSmall} alt="Coding club" width={320} height={320} className="object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}