import { Icons } from "@/components/icons";
import { OrbitingCircles } from "@/components/ui/orbiting-circle";
import Image from "next/image";
import { memo } from "react";

const SecondBentoAnimationComponent = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-background to-transparent z-20"></div>
      <div className="pointer-events-none absolute top-0 left-0 h-20 w-full bg-gradient-to-b from-background to-transparent z-20"></div>

      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 size-16 bg-secondary p-2 rounded-full z-30 md:bottom-0 md:top-auto">
        <Image
          src="/Q-white.svg"
          alt="Sequence3 mark"
          width={40}
          height={40}
          className="size-10"
          priority
        />
      </div>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="relative flex h-full w-full items-center justify-center translate-y-0 md:translate-y-32">
          <OrbitingCircles
            index={0}
            iconSize={60}
            radius={100}
            reverse
            speed={1}
            once={true}
          >
            <Icons.whatsapp />
          </OrbitingCircles>

          <OrbitingCircles index={1} iconSize={60} speed={0.5} once={true}>
            <Icons.messenger />
            <Icons.telegram />
          </OrbitingCircles>

          <OrbitingCircles
            index={2}
            iconSize={60}
            radius={230}
            reverse
            speed={0.5}
            once={true}
          >
            <Icons.facebook />
            <Icons.instagram />
          </OrbitingCircles>
        </div>
      </div>
    </div>
  );
};

export const SecondBentoAnimation = memo(SecondBentoAnimationComponent);
