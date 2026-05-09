import { useMemo, useState } from 'react'
import questionsPayload from './data/questions.json'
import typesPayload from './data/types.json'
import { Landing } from './components/Landing'
import { QuizQuestion } from './components/QuizQuestion'
import { ResultCard } from './components/ResultCard'
import { computeQuizResult, type Question, type QuizResult, type TravelType } from './lib/scoring'
import './App.css'

const quizQuestions = questionsPayload.questions as Question[]
const travelTypes = typesPayload.types as TravelType[]

type Screen = 'landing' | 'quiz' | 'result'

function createSecondaryDemoResult(types: TravelType[]): QuizResult {
  const primary = types.find((type) => type.code === '一人成团')!
  const secondary = types.find((type) => type.code === '比价CPU')!
  const normalized = { xing: 0.42, qian: -0.58, xian: 0.08, ren: 0.95 }

  return {
    raw: { xing: 0, qian: 0, xian: 0, ren: 0 },
    normalized,
    bounds: {
      xing: { min: -27, max: 26 },
      qian: { min: -15, max: 20 },
      xian: { min: -16, max: 22 },
      ren: { min: -35, max: 26 },
    },
    ranked: [
      { type: primary, distance: 0.61 },
      { type: secondary, distance: 1.06 },
    ],
    primary,
    secondary,
    secondaryMatch: {
      type: secondary,
      kind: 'complement',
      axis: 'qian',
      distance: 1.06,
      gap: 0.45,
    },
    borderline: false,
  }
}

function App() {
  const isSecondaryDemo = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('demo') === 'secondary'
  }, [])
  const [screen, setScreen] = useState<Screen>('landing')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const result = useMemo(() => {
    if (isSecondaryDemo) return createSecondaryDemoResult(travelTypes)
    if (screen !== 'result') return null
    return computeQuizResult(answers, quizQuestions, travelTypes)
  }, [isSecondaryDemo, screen, answers])

  const startQuiz = () => {
    setAnswers({})
    setIndex(0)
    setScreen('quiz')
  }

  const goBackInQuiz = () => {
    if (index <= 0) {
      setScreen('landing')
      return
    }
    setIndex((i) => i - 1)
  }

  const pickOption = (optionId: string) => {
    const q = quizQuestions[index]!
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }))
    if (index >= quizQuestions.length - 1) {
      setScreen('result')
    } else {
      setIndex((i) => i + 1)
    }
  }

  const restart = () => {
    setAnswers({})
    setIndex(0)
    setScreen('landing')
  }

  return (
    <div className="tbti-app">
      <header className="tbti-header">
        <span className="tbti-header__brand">旅格测试</span>
        <span className="tbti-header__abbr">TBTI</span>
      </header>

      <main className="tbti-main">
        {!isSecondaryDemo && screen === 'landing' ? <Landing totalQuestions={quizQuestions.length} onStart={startQuiz} /> : null}
        {!isSecondaryDemo && screen === 'quiz' ? (
          <QuizQuestion
            question={quizQuestions[index]!}
            index={index}
            total={quizQuestions.length}
            selectedId={answers[quizQuestions[index]!.id]}
            onSelect={pickOption}
            onBack={goBackInQuiz}
          />
        ) : null}
        {(isSecondaryDemo || screen === 'result') && result ? (
          <ResultCard result={result} onRestart={restart} />
        ) : null}
      </main>
    </div>
  )
}

export default App
