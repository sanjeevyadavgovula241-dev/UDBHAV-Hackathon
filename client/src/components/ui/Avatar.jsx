import { initials } from "../../lib/format";

const palettes = [
  "from-[#2ea28f] to-[#1d665c]",
  "from-[#5f72c4] to-[#3f4b8c]",
  "from-[#4a82aa] to-[#355873]",
  "from-[#b98a3e] to-[#7a5a25]",
  "from-[#b16c82] to-[#7c4358]",
];

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export default function Avatar({ name, size = "md", className = "" }) {
  const seed = (name ?? "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palette = palettes[seed % palettes.length];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${palette} font-semibold text-white ring-1 ring-white/10 ${sizes[size] ?? sizes.md} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
