import { GraduationCap, UsersRound, Presentation, House, Building2, Handshake, Users, Smartphone, School, Landmark, Scale } from "lucide-react";

const icons = {
  student: GraduationCap,
  parent: UsersRound,
  teacher: Presentation,
  neighbor: House,
  schooladmin: Building2,
  community: Handshake,
  schoolfriends: Users,
  media: Smartphone,
  otherschools: School,
  govt: Landmark,
  court: Scale,
};

export default function MissionIcon({ id, ...props }) {
  const Icon = icons[id] || Users;
  return <Icon strokeWidth={1.8} aria-hidden="true" {...props} />;
}
