import Image from "next/image";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  label?: string;
  iconSize?: number;
  showLabel?: boolean;
  children?: React.ReactNode;
}

export function IconButton({
  icon,
  label,
  iconSize = 20,
  showLabel = true,
  className = "",
  children,
  ...props
}: IconButtonProps) {
  const hasLabel = showLabel && !!label;

  return (
    <button
      aria-label={label}
      title={label}
      className={`
        inline-flex h-10 items-center justify-center
        rounded-full border border-border
        transition-colors duration-200
        hover:bg-bg hover:text-text-primary
        ${hasLabel ? "gap-2 px-3" : "w-10"}
        ${className}
      `}
      {...props}
    >
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={iconSize}
          height={iconSize}
        />
      ) : (
        children
      )}

      {hasLabel && (
        <span>{label}</span>
      )}
    </button>
  );
}