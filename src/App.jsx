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

  function addMinutes(min) {
    if (isRunning) return
    const add = min * 60
    setTotalSeconds((prev) => prev + add)
    setRemainingSeconds((prev) => prev + add)
  }

  // 🚀 新增：专门用来测试 3 秒的函数
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

  const displaySeconds = remainingSeconds
  const totalMinutes = Math.round(totalSeconds / 60)

  return (
    <div className="page">
      <div className="timer-card">
        <div className="circle">
          <div className="time">{formatTime(displaySeconds)}</div>
          <div className="total">
            {totalSeconds > 0 ? `${totalMinutes} min` : "Set time"}
          </div>
        </div>

        <div className="buttons">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => addMinutes(p.minutes)}
              disabled={isRunning}
            >
              {p.label}
            </button>
          ))}

          {/* 🎯 调试神器：3秒测试按钮 */}
          <button 
            className="test-btn" 
            onClick={handleTest} 
            disabled={isRunning}
            style={{ backgroundColor: '#FFD700', color: '#000' }} 
          >
            Test (3s)
          </button>

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

          {/* 🔊 音频标签 - 确保路径是 /soda-sound.wav */}
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