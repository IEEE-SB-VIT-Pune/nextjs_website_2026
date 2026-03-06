import { FunZoneProvider } from "./FunZoneContext";
import "./fun-zone.css";

export default function FunZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FunZoneProvider>{children}</FunZoneProvider>;
}
