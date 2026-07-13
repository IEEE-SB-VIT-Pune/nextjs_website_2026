"use client";

import React, { useEffect, useState } from "react";
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

// Map titles or category keywords to local imported GIFs
const eventGifs: Record<string, any> = {
  "codezest'26": codegif,
  "codezest": codegif,
  "avenir": webdevgif,
  "neural network bootcamp": neural,
  "python workshop": python,
  "quantum computing": quantum,
  "blockchain": blockchain,
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success && data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const upcomingList = events.filter((e) => e.type === "UPCOMING");
  const previousList = events.filter((e) => e.type === "PREVIOUS");

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading events catalog...</p>
        </div>
      </div>
    );
  }

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
              A showcase of our dynamic workshops, bootcamps, and technical events.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 border-b border-border/50 bg-card/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Upcoming <span className="text-primary">Events</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Stay tuned and register now for our latest upcoming events!
            </p>
          </div>

          <div className="grid gap-8 max-w-2xl mx-auto">
            {upcomingList.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground font-semibold border border-border/40 bg-card/25 rounded-2xl">
                No upcoming events scheduled at the moment. Check back soon!
              </div>
            ) : (
              upcomingList.map((event, idx) => (
                <motion.div
                  key={event._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border-4 border-stone-300 bg-card/50 overflow-hidden hover:scale-105 transition-all w-full"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        {event.category}
                      </span>
                      {event.timeText && (
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                          {event.timeText}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold">{event.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {event.description}
                    </p>

                    {event.category === "Recruitment" ? (
                      <>
                        <div className="space-y-2 text-xs text-muted-foreground font-mono">
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
                          <button className="w-full mt-2 px-6 py-3 rounded-lg bg-primary text-black font-semibold hover:opacity-90 transition-opacity text-xs uppercase font-bold tracking-wider">
                            Apply Now 🚀
                          </button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {event.venue && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-muted-foreground text-xs">Venue Location</p>
                              <p className="font-bold">{event.venue}</p>
                            </div>
                          )}
                          {event.entryFee && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-muted-foreground text-xs">Entry Cost</p>
                              <p className="font-bold">{event.entryFee}</p>
                            </div>
                          )}
                        </div>
                        {event.prizePool && (
                          <div className="p-3 border border-primary/20 bg-primary/5 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-semibold">Prize Pool:</span>
                            <span className="font-bold text-primary text-sm">{event.prizePool}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
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
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Explore dynamic workshops and hackathons organized by IEEE student branch.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousList.length === 0 ? (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground font-semibold">
                No past events catalog found.
              </div>
            ) : (
              previousList.map((event, index) => {
                // Determine GIF or default image source
                const titleLower = (event.title || "").toLowerCase();
                const matchedGifKey = Object.keys(eventGifs).find((k) => titleLower.includes(k));
                const imageSrc = event.image || (matchedGifKey ? eventGifs[matchedGifKey] : null);

                return (
                  <motion.div
                    key={event._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-2xl border-4 border-stone-300 bg-card/50 overflow-hidden hover:scale-105 transition-all"
                  >
                    <div className="relative h-40 bg-muted/40 flex items-center justify-center border-b border-border/20">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                          <Image
                            src={eventVector}
                            alt="Event icon"
                            width={50}
                            height={50}
                            className="opacity-40"
                          />
                          <span className="text-[9px] text-primary font-bold uppercase tracking-wider">{event.category}</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-background/70 border border-border/60 flex items-center justify-center z-10">
                        <Image
                          src={index % 2 === 0 ? workshopIcon : ktIcon}
                          alt="Event type"
                          width={18}
                          height={18}
                          className="h-4.5 w-4.5 object-contain"
                        />
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-base text-foreground line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                        <span>{event.dateText}</span>
                        {event.timeText && <span>· {event.timeText}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{event.description}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
