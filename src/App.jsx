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
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`
}

export default function App() {
  const [totalSeconds, setTotalSeconds] = React.useState(0) // 你设定的总时间（会累加）
  const [remainingSeconds, setRemainingSeconds] = React.useState(0) // 真正在倒数的值
  const [isRunning, setIsRunning] = React.useState(false)
  const audioRef = React.useRef(null)
  const alarmCountRef = React.useRef(0)



  function addMinutes(min) {
    if (isRunning) return
    const add = min * 60
    setTotalSeconds((prev) => prev + add)
    setRemainingSeconds((prev) => prev + add)
  }

  function handleStart() {
    if (totalSeconds === 0) return
    if (remainingSeconds === 0) {
      // 万一剩余是0（比如刚取消过），就用总时间重置
      setRemainingSeconds(totalSeconds)
    }
    setIsRunning(true)
  }

function startAlarm(times = 3) {
  const audio = audioRef.current
  if (!audio) return

  alarmCountRef.current = 0

  // 开播第一次
  audio.currentTime = 0
  audio.play().catch(() => {
    console.log("audio play blocked")
  })
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


  const audio = audioRef.current
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}


  // 倒计时：每秒 -1
 React.useEffect(() => {
  if (!isRunning) return

  const id = setInterval(() => {
    setRemainingSeconds((prev) => {
      const next = Math.max(0, prev - 1)

      if (next === 0) {
        // 1️⃣ 停止计时
        setIsRunning(false)

        // 2️⃣ 播放音频
        const audio = audioRef.current
        if (audio) {
          audio.currentTime = 0
          audio.play().catch(() => {
            console.log("audio play blocked")
          })
        }
      }

      return next
    })
  }, 1000)

  return () => clearInterval(id)
}, [isRunning])


  const displaySeconds = isRunning ? remainingSeconds : remainingSeconds
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
          src="/alarm.wav" 
          preload="auto"
          onEnded={() => {
            alarmCountRef.current += 1

            if (alarmCountRef.current <3) {
              const audio = audioRef.current
              if (!audio) return
              audio.currentTime = 0
              audio.play().catch(() => {})
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
