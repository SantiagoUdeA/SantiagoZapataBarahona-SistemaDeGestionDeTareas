import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  textClassName?: string;
  containerClassName?: string;
  iconSize?: number;
  iconStroke?: number;
}

export function Logo({
  href = '/',
  showText = true,
  size = 'md',
  textClassName,
  containerClassName,
  iconSize = 20,
  iconStroke = 2.5,
}: LogoProps) {
  const sizeMap = {
    sm: { box: 'h-6 w-6', text: 'text-base' },
    md: { box: 'h-9 w-9', text: 'text-xl' },
    lg: { box: 'h-12 w-12', text: 'text-2xl' },
  };

  const logoIcon = (
    <>
      <div
        className={`flex items-center justify-center rounded-lg bg-[#182820] ${sizeMap[size].box} ${containerClassName || ''}`}
      >
        <HugeiconsIcon
          icon={Tick02Icon}
          size={iconSize}
          color="white"
          strokeWidth={iconStroke}
        />
      </div>
      {showText && (
        <span
          className={`font-bold tracking-tight text-[#182820] ${sizeMap[size].text} ${textClassName || ''}`}
        >
          TaskFlow
        </span>
      )}
    </>
  );

  return (
    <Link href={href} className="flex items-center gap-2">
      {logoIcon}
    </Link>
  );
}
