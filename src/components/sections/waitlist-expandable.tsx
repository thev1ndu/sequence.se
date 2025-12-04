"use client"

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react"

import { Button } from "@/components/ui/button"
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
  useExpandableScreen,
} from "@/components/ui/expandable-card"
import { cn } from "@/lib/utils"

interface WaitlistExpandableProps {
  label: string
  triggerClassName?: string
}

export function WaitlistExpandable({
  label,
  triggerClassName,
}: WaitlistExpandableProps) {
  const nameId = useId()
  const emailId = useId()
  const websiteId = useId()
  const companySizeId = useId()
  const messageId = useId()
  const screenLayoutId = useId().replace(/:/g, "-")
  const navTimeoutRef = useRef<number | null>(null)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  const setNavHidden = (hidden: boolean) => {
    if (hidden) {
      document.body.dataset.navHidden = "true"
    } else {
      delete document.body.dataset.navHidden
    }
  }

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) {
        window.clearTimeout(navTimeoutRef.current)
      }
      delete document.body.dataset.navHidden
    }
  }, [])

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbyzG-gebmuiUeknVhtT10Ytnnc4cBdIXxsFVYiWjvIlSqeBKgZxLeTQFnaTjJImebNe_w/exec"
        )
        const data = await response.json()
        if (data.status === "ok" && typeof data.count === "number") {
          setWaitlistCount(data.count)
        }
      } catch (error) {
        console.error("Failed to fetch waitlist count", error)
      }
    }

    fetchWaitlistCount()
  }, [])

  const handleExpandChange = (expanded: boolean) => {
    if (navTimeoutRef.current) {
      window.clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = null
    }

    if (expanded) {
      // Disable scroll when opening
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      setNavHidden(true)
      return
    }

    // Re-enable scroll when closing
    const scrollY = document.body.style.top
    const scrollPosition = parseInt(scrollY || '0') * -1
    
    // Clear styles first
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    
    // Restore scroll position without smooth scrolling to prevent jumps
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
      })
    })

    setNavHidden(true)
    navTimeoutRef.current = window.setTimeout(() => {
      setNavHidden(false)
      navTimeoutRef.current = null
    }, 0)
  }

  return (
    <ExpandableScreen
      layoutId={screenLayoutId}
      triggerRadius="999px"
      contentRadius="24px"
      onExpandChange={handleExpandChange}
    >
      <ExpandableScreenTrigger>
        <button
          className={cn(
            "bg-white text-black font-semibold text-sm h-10 w-fit px-4 rounded-full flex items-center justify-center shadow-md",
            triggerClassName
          )}
          type="button"
        >
          {label}
        </button>
      </ExpandableScreenTrigger>

      <ExpandableScreenContent className="bg-[#4F39FF]">
        <div className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-[1100px] mx-auto items-center p-6 sm:p-10 lg:p-16 gap-8 lg:gap-16">

          {/* LEFT */}
          <div className="flex-1 flex flex-col justify-center space-y-3 mt-1 w-full">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-ex-foreground leading-none tracking-[-0.03em]">
                Reserve your spot
              </h2>
            </div>
            <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-ex-foreground/20">
              <p className="text-lg sm:text-xl lg:text-2xl text-ex-foreground leading-[150%] mb-4">
                The waitlist has been a game-changer for our workflow. Highly
                recommend joining early.
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="flex-1 w-full">
            <WaitlistForm
              nameId={nameId}
              emailId={emailId}
              websiteId={websiteId}
              companySizeId={companySizeId}
              messageId={messageId}
              waitlistCount={waitlistCount}
              onSubmitSuccess={() => {
                if (waitlistCount !== null) {
                  setWaitlistCount(waitlistCount + 1)
                }
              }}
            />
          </div>
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  )
}

interface WaitlistFormProps {
  nameId: string
  emailId: string
  websiteId: string
  companySizeId: string
  messageId: string
  onSubmitSuccess?: () => void
  waitlistCount?: number | null
}

function WaitlistForm({
  nameId,
  emailId,
  websiteId,
  companySizeId,
  messageId,
  onSubmitSuccess,
  waitlistCount,
}: WaitlistFormProps) {
  const { collapse } = useExpandableScreen()

  // ★ SCALE COUNT → SMOOTH DARK-TO-LIGHT PROGRESSION
  const getHexColor = (count: number) => {
    // 250 signups to reach white: 0xFFFFFF / 250 ≈ 67109
    const scaled = count * 67109
    const hex = Math.min(scaled, 0xffffff).toString(16).padStart(6, "0")
    return `#${hex}`
  }

  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }

  const currentCount = waitlistCount ?? 0
  const bgColor = getHexColor(currentCount)
  const textColor = isLightColor(bgColor) ? "#000000" : "#FFFFFF"

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget

    const payload = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      "use-case": (form.elements.namedItem("use-case") as HTMLInputElement).value,
      "team-size": (form.elements.namedItem("team-size") as HTMLSelectElement).value,
      "excited-about": (form.elements.namedItem("excited-about") as HTMLTextAreaElement)
        .value,
    }

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbyzG-gebmuiUeknVhtT10Ytnnc4cBdIXxsFVYiWjvIlSqeBKgZxLeTQFnaTjJImebNe_w/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors",
        }
      )
      onSubmitSuccess?.()
    } catch (error) {
      console.error("Failed to submit waitlist form", error)
    }

    form.reset()
    collapse()
  }

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor={nameId} className="block text-[10px] font-mono text-ex-foreground mb-2 uppercase">
          FULL NAME *
        </label>
        <input
          type="text"
          id={nameId}
          name="name"
          required
          autoComplete="off"
          className="w-full px-4 py-2.5 text-ex font-medium rounded-lg bg-[oklch(1_0_0)] text-xs h-10"
        />
      </div>

      <div>
        <label htmlFor={emailId} className="block text-[10px] font-mono text-ex-foreground mb-2 uppercase">
          EMAIL *
        </label>
        <input
          type="email"
          id={emailId}
          name="email"
          required
          autoComplete="off"
          className="w-full px-4 py-2.5 text-ex font-medium rounded-lg bg-[oklch(1_0_0)] text-xs h-10"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor={websiteId} className="block text-[10px] font-mono text-ex-foreground mb-2 uppercase">
            USE CASE
          </label>
          <input
            type="text"
            id={websiteId}
            name="use-case"
            placeholder="e.g., Instagram store, clinic bookings"
            autoComplete="off"
            className="w-full px-4 py-2.5 rounded-lg font-medium text-ex bg-[oklch(1_0_0)] text-xs h-10"
          />
        </div>

        <div className="sm:w-32 w-full">
          <label htmlFor={companySizeId} className="block text-[10px] font-mono text-ex-foreground mb-2 uppercase">
            TEAM SIZE
          </label>
          <select
            id={companySizeId}
            name="team-size"
            className="w-full px-4 py-2.5 rounded-lg team-size-select text-ex font-medium bg-[oklch(1_0_0)] text-xs h-10"
            defaultValue=""
          >
            <option value="" disabled>Select</option>
            <option value="solo">Solo</option>
            <option value="2-5">2-5</option>
            <option value="6-20">6-20</option>
            <option value="21-50">21-50</option>
            <option value="50+">50+</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={messageId} className="block text-[10px] font-mono text-ex-foreground mb-2 uppercase">
          WHAT ARE YOU MOST EXCITED ABOUT?
        </label>
        <textarea
          id={messageId}
          name="excited-about"
          rows={3}
          autoComplete="off"
          className="w-full px-4 py-3 rounded-lg font-medium text-ex bg-[oklch(1_0_0)] text-xs"
        />
      </div>

      <Button
        type="submit"
        className="w-full px-8 py-2.5 rounded-full bg-ex-foreground text-ex h-10 mb-7 hover:bg-ex-foreground/80"
      >
        Join Waitlist
      </Button>

      {/* ————————— HEX DISPLAY + BG SYNC ————————— */}
      <div className="flex items-center justify-center w-full mb-4">
        <div className="inline-flex items-center gap-3 rounded-full backdrop-blur-sm">
          <div
            className="flex items-center px-3 py-0.7 border border-white/[0.07] transition-colors duration-700"
            style={{ backgroundColor: bgColor }}
          >
            <span
              className="font-mono text-sm transition-colors duration-700 flex items-center"
              style={{ color: textColor }}
            >
              {bgColor.toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-mono text-ex-foreground/80 uppercase tracking-wider">
            ILLUMINATE.
          </span>
        </div>
      </div>
    </form>
  )
}