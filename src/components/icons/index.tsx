import {
  AlertCircle,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Info,
  LayoutDashboard,
  LayoutGrid,
  ListFilter,
  Loader2,
  LogOut,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

export type IconProps = Omit<LucideProps, "ref">;

function wrap(name: string, Glyph: React.ComponentType<LucideProps>) {
  const Wrapped = ({ size = 18, ...props }: IconProps) => <Glyph size={size} {...props} />;
  Wrapped.displayName = `${name}Icon`;
  return Wrapped;
}

export const DashboardIcon = wrap("Dashboard", LayoutDashboard);
export const SubjectsIcon = wrap("Subjects", BookOpen);
export const StudentsIcon = wrap("Students", Users);
export const UsersIcon = wrap("Users", UsersRound);
export const TeachersIcon = wrap("Teachers", Briefcase);
export const ResultsIcon = wrap("Results", Award);
export const PaymentsIcon = wrap("Payments", Wallet);
export const SearchIcon = wrap("Search", Search);
export const BellIcon = wrap("Bell", Bell);
export const HelpIcon = wrap("Help", HelpCircle);
export const SettingsIcon = wrap("Settings", Settings);
export const GridIcon = wrap("Grid", LayoutGrid);
export const PlusIcon = wrap("Plus", Plus);
export const ChevronDownIcon = wrap("ChevronDown", ChevronDown);
export const ChevronLeftIcon = wrap("ChevronLeft", ChevronLeft);
export const ChevronRightIcon = wrap("ChevronRight", ChevronRight);
export const ArrowRightIcon = wrap("ArrowRight", ArrowRight);
export const CalendarIcon = wrap("Calendar", CalendarDays);
export const FileTextIcon = wrap("FileText", FileText);
export const ClockIcon = wrap("Clock", Clock);
export const CheckIcon = wrap("Check", CheckCircle2);
export const XIcon = wrap("X", X);
export const InfoIcon = wrap("Info", Info);
export const AlertIcon = wrap("Alert", AlertCircle);
export const TrendUpIcon = wrap("TrendUp", TrendingUp);
export const TrendDownIcon = wrap("TrendDown", TrendingDown);
export const ArrowUpIcon = wrap("ArrowUp", ArrowUpRight);
export const ArrowDownIcon = wrap("ArrowDown", ArrowDownRight);
export const FilterIcon = wrap("Filter", ListFilter);
export const SpinnerIcon = wrap("Spinner", Loader2);
export const LogOutIcon = wrap("LogOut", LogOut);
export const UserIcon = wrap("User", UserRound);
export const LogoIcon = wrap("Logo", Sparkles);
