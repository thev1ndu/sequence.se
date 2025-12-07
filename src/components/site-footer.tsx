import { SITE_INFO } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="max-w-screen overflow-x-hidden px-3 sm:px-4">
      <div className="screen-line-before mx-auto pt-5 sm:pt-6 md:max-w-3xl md:border-x md:border-edge">
        <p className="mb-6 px-4 text-center font-mono text-xs [overflow-wrap:anywhere] break-words text-muted-foreground sm:text-sm">
          {SITE_INFO.description}
        </p>
      </div>
      <div className="pb-[env(safe-area-inset-bottom,0px)]">
        <div className="h-2" />
      </div>
    </footer>
  );
}

