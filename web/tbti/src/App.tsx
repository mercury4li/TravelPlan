import { useMemo, useState } from 'react'
import questionsPayload from './data/questions.json'
import typesPayload from './data/types.json'
import { Landing } from './components/Landing'
import { QuizQuestion } from './components/QuizQuestion'
import { ResultCard } from './components/ResultCard'
import { computeQuizResult, type Question, type TravelType } from './lib/scoring'
import './App.css'

const quizQuestions = questionsPayload.questions as Question[]
const travelTypes = typesPayload.types as TravelType[]

type Screen = 'landing' | 'quiz' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const result = useMemo(() => {
    if (screen !== 'result') return null
    return computeQuizResult(answers, quizQuestions, travelTypes)
  }, [screen, answers])

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
        {screen === 'landing' ? <Landing onStart={startQuiz} /> : null}
        {screen === 'quiz' ? (
          <QuizQuestion
            question={quizQuestions[index]!}
            index={index}
            total={quizQuestions.length}
            selectedId={answers[quizQuestions[index]!.id]}
            onSelect={pickOption}
            onBack={goBackInQuiz}
          />
        ) : null}
        {screen === 'result' && result ? (
          <ResultCard result={result} onRestart={restart} />
        ) : null}
      </main>
    </div>
  )
}

export default App
