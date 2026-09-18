import { useEffect, useRef } from "react"
import "./src/styles.css"
import { boot, destroy } from "./src/engine.js"
import type { GameProps } from "../../types/game.types"

const AmlUrduGame = ({ config, onComplete }: GameProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  const configRef = useRef(config)
  onCompleteRef.current = onComplete
  configRef.current = config

  useEffect(() => {
    const id = "aml-urdu-fonts"
    if (!document.getElementById(id)) {
      const link = document.createElement("link")
      link.id = id
      link.rel = "stylesheet"
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    boot({
      root,
      lang: config?.language === "ur" ? "ur" : "en",
      onComplete: (result) => {
        onCompleteRef.current?.({
          ...result,
          metadata: {
            ...result.metadata,
            tier: configRef.current?.tier,
            skill: configRef.current?.skill,
          },
        })
      },
    })

    return () => {
      destroy()
    }
  }, [config?.language])

  return (
    <div
      ref={rootRef}
      className="aml-urdu-root splashing h-full min-h-0 w-full"
      dir={config?.language === "ur" ? "rtl" : "ltr"}
    >
      <div id="splash" role="status" aria-live="polite" aria-label="Loading SENTINEL academy">
        <div className="splash-inner">
          <div className="splash-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="sp1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0FA98A" />
                  <stop offset="1" stopColor="#3B7DE8" />
                </linearGradient>
              </defs>
              <path
                d="M20 3 L34 9 V20c0 8.5-5.8 14.6-14 17-8.2-2.4-14-8.5-14-17V9z"
                stroke="url(#sp1)"
                strokeWidth="2"
                fill="rgba(15,169,138,.08)"
              />
              <path
                d="M13.5 20.2l4.4 4.4 8.6-8.8"
                stroke="url(#sp1)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="splash-eyebrow">SBP AML/CFT · Training simulation</div>
          <h1 className="splash-name">SENTINEL</h1>
          <p className="splash-sub">AML / KYC Academy</p>
          <div className="splash-lang" id="splashlang" role="group" aria-labelledby="splashlanglbl">
            <div className="splash-lang-lbl" id="splashlanglbl">
              Choose language
            </div>
            <div className="splash-lang-row">
              <button
                type="button"
                className="splash-langbtn on"
                data-lang="en"
                aria-pressed="true"
              >
                English
              </button>
              <button
                type="button"
                className="splash-langbtn"
                data-lang="ur"
                aria-pressed="false"
              >
                اردو
              </button>
            </div>
          </div>
          <div className="splash-bar" aria-hidden="true">
            <i id="splashbar"></i>
          </div>
          <p className="splash-status" id="splashstatus">
            Loading academy…
          </p>
        </div>
        <p className="splash-skip">Click or tap to skip</p>
      </div>

      <canvas id="fx"></canvas>
      <canvas id="confetti"></canvas>
      <div id="cine">
        <img className="cine-bg" id="cbgA" alt="" />
        <img className="cine-bg" id="cbgB" alt="" />
        <div
          className="cine-scrim"
          id="cscrim"
          style={{ opacity: 0, transition: "opacity .6s ease" }}
        ></div>
      </div>
      <div id="actors"></div>

      <div id="app">
        <div className="topbar">
          <div className="brand" id="brand">
            <svg viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0FA98A" />
                  <stop offset="1" stopColor="#3B7DE8" />
                </linearGradient>
              </defs>
              <path
                d="M20 3 L34 9 V20c0 8.5-5.8 14.6-14 17-8.2-2.4-14-8.5-14-17V9z"
                stroke="url(#bg1)"
                strokeWidth="2"
                fill="rgba(15,169,138,.08)"
              />
              <path
                d="M13.5 20.2l4.4 4.4 8.6-8.8"
                stroke="url(#bg1)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="brand-txt">
              <div className="n">SENTINEL</div>
              <div className="t">AML / KYC Academy</div>
            </div>
          </div>
          <div className="tb-spacer"></div>
          <div className="rankchip" id="rankchip"></div>
          <button className="iconbtn langbtn" id="langbtn" type="button" title="اردو">
            اردو
          </button>
          <button className="iconbtn" id="soundbtn" title="Toggle sound"></button>
          <button className="iconbtn" id="resetbtn" title="Reset progress">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
        <div id="stage"></div>
      </div>
      <div id="toasts"></div>
    </div>
  )
}

export default AmlUrduGame
