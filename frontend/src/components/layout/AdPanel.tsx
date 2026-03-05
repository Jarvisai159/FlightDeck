import { Megaphone } from 'lucide-react'

interface AdPanelProps {
  position: 'left' | 'right'
}

export default function AdPanel({ position }: AdPanelProps) {
  return (
    <aside
      className={`hidden xl:flex flex-col gap-4 w-[160px] shrink-0 sticky top-[72px] self-start ${
        position === 'left' ? 'mr-4' : 'ml-4'
      }`}
    >
      {/* Skyscraper ad slot — 160x600 IAB standard */}
      <div
        className="bg-bg-secondary border border-border rounded-lg flex flex-col items-center justify-center text-center p-4"
        style={{ minHeight: 600 }}
        data-ad-slot={position === 'left' ? 'sidebar-left' : 'sidebar-right'}
        data-ad-format="skyscraper"
      >
        {/* Placeholder — will be replaced by Google AdSense script */}
        <div className="space-y-3 opacity-30">
          <Megaphone className="w-6 h-6 text-text-muted mx-auto" />
          <p className="text-[10px] text-text-muted leading-snug">
            Ad Space<br />160 x 600
          </p>
        </div>
      </div>

      {/* Medium rectangle ad slot — 160x250 compact */}
      <div
        className="bg-bg-secondary border border-border rounded-lg flex flex-col items-center justify-center text-center p-4"
        style={{ minHeight: 250 }}
        data-ad-slot={position === 'left' ? 'sidebar-left-2' : 'sidebar-right-2'}
        data-ad-format="medium-rect"
      >
        <div className="space-y-2 opacity-30">
          <Megaphone className="w-5 h-5 text-text-muted mx-auto" />
          <p className="text-[10px] text-text-muted leading-snug">
            Ad Space<br />160 x 250
          </p>
        </div>
      </div>
    </aside>
  )
}
