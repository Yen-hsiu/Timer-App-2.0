import React from "react"
import "./index.css"

const PRESETS = [
  { label: "1 min", minutes: 1 },
  { label: "3 min", minutes: 3 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
]

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export default function App() {
  const [totalSeconds, setTotalSeconds] = React.useState(0)
  const [remainingSeconds, setRemainingSeconds] = React.useState(0)
  const [isRunning, setIsRunning] = React.useState(false)
  const audioRef = React.useRef(null)
  const alarmCountRef = React.useRef(0)

  // 🚀 SVG 圆环参数
  const RADIUS = 110; // 半径
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // 周长

  function addMinutes(min) {
    if (isRunning) return
    const add = min * 60
    setTotalSeconds((prev) => prev + add)
    setRemainingSeconds((prev) => prev + add)
  }

  function handleTest() {
    if (isRunning) return
    setTotalSeconds(3)
    setRemainingSeconds(3)
    setIsRunning(true)
  }

  function handleStart() {
    if (totalSeconds === 0) return
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds)
    }
    setIsRunning(true)
  }

  function stopAlarm() {
    const audio = audioRef.current
    if (!audio) return
    alarmCountRef.current = 0
    audio.pause()
    audio.currentTime = 0
  }

  function handleCancel() {
    setIsRunning(false)
    setTotalSeconds(0)
    setRemainingSeconds(0)
    stopAlarm()
  }

  React.useEffect(() => {
    if (!isRunning) return

    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = Math.max(0, prev - 1)
        if (next === 0) {
          setIsRunning(false)
          const audio = audioRef.current
          if (audio) {
            audio.currentTime = 0
            audio.play().catch((err) => console.log("Audio play failed:", err))
          }
        }
        return next
      })
    }, 1000)

    return () => clearInterval(id)
  }, [isRunning])

  // 🚀 计算进度条的偏移量 (关键设计逻辑)
  // 如果 totalSeconds 为 0，进度为 100%（全圆）
  const percentage = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - percentage);

  const displaySeconds = remainingSeconds
  const totalMinutes = Math.round(totalSeconds / 60)

  return (
    <div className="page">
      <div className="timer-card">
        <div className="circle">
          
          {/* 🚀 新增：SVG 进度环 */}
          <svg 
  className="progress-ring" 
  width="240" 
  height="240" 
  viewBox="0 0 240 240"  /* 确保画布足够大 */
  style={{ overflow: 'visible' }} /* 允许描边稍微溢出一点 */
>
  {/* 底色圆环 */}
  <circle
    stroke="#f0f0f2"
    strokeWidth="10"
    fill="transparent"
    r="100"          /* 半径 100，直径 200 */
    cx="120"         /* 中心点在 120 (240的一半)，四周就有 20px 留白 */
    cy="120"
  />
  {/* 动态进度环 */}
  <circle
    className="progress-ring__bar"
    stroke="#0071e3"
    strokeWidth="10"
    strokeLinecap="round"
    fill="transparent"
    r="100"
    cx="120"
    cy="120"
    style={{
      strokeDasharray: `${2 * Math.PI * 100} ${2 * Math.PI * 100}`,
      strokeDashoffset: strokeDashoffset,
      transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease',
      transform: 'rotate(-90deg)',
      transformOrigin: '120px 120px', /* 旋转中心必须和 cx/cy 一致 */
    }}
  />
</svg>

          {/* 原有的时间文字，改为绝对定位覆盖在 SVG 上 */}
          <div className="time-display" style={{
            position: 'absolute',
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', // 强制绝对居中
            display: 'flex',
           flexDirection: 'column',
            alignItems: 'center'
            }}>
            <div className="time">{formatTime(displaySeconds)}</div>
            <div className="total">
              {totalSeconds > 0 ? `${totalMinutes} min` : "Set time"}
            </div>
          </div>
        </div>

        <div className="buttons">
          
          <button 
            className="test-btn" 
            onClick={handleTest} 
            disabled={isRunning}
          >
            Dev Tool: Test (3s)
          </button>

          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => addMinutes(p.minutes)}
              disabled={isRunning}
            >
              {p.label}
            </button>
          ))}

          <button
            className="start"
            onClick={handleStart}
            disabled={isRunning || totalSeconds === 0}
          >
            Start
          </button>

          <button className="cancel" onClick={handleCancel}>
            Cancel
          </button>

          <audio 
            ref={audioRef} 
            src="/soda-sound.wav" 
            preload="auto"
            onEnded={() => {
              alarmCountRef.current += 1
              if (alarmCountRef.current < 3) {
                const audio = audioRef.current
                if (audio) {
                  audio.currentTime = 0
                  audio.play().catch(() => {})
                }
              } else {
                alarmCountRef.current = 0
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}