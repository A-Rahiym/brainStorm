import Image from "next/image";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({
  name,
  src,
  size = 38,
  className = "",
  style,
}: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{
          width: size,
          height: size,
          ...style,
        }}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        ...style,
      }}
    >
      {initials(name)}
    </span>
  );
}