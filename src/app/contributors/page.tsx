import Image from "next/image";

import Aditya from "@/assets/images/aboutUs/developers/Aditya_Mhaske.png";
import Gauri from "@/assets/images/aboutUs/developers/Gauri_Choudhari.png";
import Gyaneshwari from "@/assets/images/aboutUs/developers/Gyaneshwari_Patil.png";
import Kirti from "@/assets/images/aboutUs/developers/kirti_Agarwal.png";
import Mrunmayee from "@/assets/images/aboutUs/developers/Mrunmayee_Phadke.png";
import OmK from "@/assets/images/aboutUs/developers/Om_Khode.png";
import Pranav from "@/assets/images/aboutUs/developers/Pranav_Joshi.png";
import Riddhi from "@/assets/images/aboutUs/developers/Riddhi_Halade.png";
import Sakshee from "@/assets/images/aboutUs/developers/Sakshee_Agrawal.png";
import Sayee from "@/assets/images/aboutUs/developers/Sayee_Zanzane.png";
import Tanmay from "@/assets/images/aboutUs/developers/Tanmay_Mutalik.png";
import Tushar from "@/assets/images/aboutUs/developers/Tushar_Nasery.png";

import Harsh from "@/assets/images/contributorsdevelopers/Harsh_Mehta.png";
import Atharva from "@/assets/images/contributorsdevelopers/Atharva_Ansingkar.png";
import TanmayProjectHead from "@/assets/images/contributorsdevelopers/Tanmay_Mutalik.png";
import OmProjectHead from "@/assets/images/contributorsdevelopers/Om_Khode.png";

const projectHeads = [
  {
    name: "Harsh Mehta",
    role: "Project Head 2025-26",
    image: Harsh,
    imageClassName: "object-cover object-top",
  },
  {
    name: "Atharva Ansingkar",
    role: "Project Head 2024-2025",
    image: Atharva,
    imageClassName: "object-cover",
  },
  {
    name: "Tanmay Mutalik",
    role: "Web Project Head 2022-2023",
    image: TanmayProjectHead,
    imageClassName: "object-cover",
  },
  {
    name: "Om Khode",
    role: "Web Project Head 2023-2024",
    image: OmProjectHead,
    imageClassName: "object-cover",
  },
];

const webTeam = [
  { name: "Kirti Agarwal", role: "Chairperson 2022-2023", image: Kirti },
  { name: "Tanmay Mutalik", role: "Web Project Head 2022-2023", image: Tanmay },
  { name: "Om Khode", role: "Web Project Head 2023-2024", image: OmK },
  { name: "Mrunmayee Phadke", role: "AI Project Head 2023-2024", image: Mrunmayee },
  { name: "Aditya Mhaske", role: "Multimedia Head 2023-2024", image: Aditya },
  { name: "Gauri Choudhari", role: "EXECOM 2022-2023", image: Gauri },
  { name: "Gyaneshwari Patil", role: "EXECOM 2022-2023", image: Gyaneshwari },
  { name: "Pranav Joshi", role: "Research Head 2023-2024", image: Pranav },
  { name: "Riddhi Halade", role: "EXECOM 2022-2023", image: Riddhi },
  { name: "Sakshee Agrawal", role: "EXECOM 2022-2023", image: Sakshee },
  { name: "Sayee Zanzane", role: "EXECOM 2022-2023", image: Sayee },
  { name: "Tushar Nasery", role: "Chairperson 2023-2024", image: Tushar },
];

export default function ContributorsPage() {
  return (
    <div className="container mx-auto px-4 py-20 space-y-14">
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Contributors
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          The web team and project heads who contributed to IEEE SB VIT Pune website work.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Project Heads
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projectHeads.map((member) => (
            <article
              key={member.name}
              className="rounded-2xl border-4 border-stone-300 bg-card/50 p-6 flex items-center gap-5"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={96}
                height={96}
                className={`h-24 w-24 rounded-xl ${member.imageClassName}`}
              />
              <div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Legacy Devs
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {webTeam.map((member) => (
            <article
              key={member.name}
              className="rounded-2xl border-4 border-stone-300 bg-card/50 p-5 space-y-3 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-base font-semibold leading-tight">{member.name}</h3>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
