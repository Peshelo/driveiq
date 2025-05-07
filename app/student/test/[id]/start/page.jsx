"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Flag, CheckCircle, Clock, Grid, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import pb from '@/lib/connection'
import Link from 'next/link'

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id

  const [userId, setUserId] = useState(null)
  const [showQuestionMap, setShowQuestionMap] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isShowingResult, setIsShowingResult] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [markedForReview, setMarkedForReview] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)

  // Load initial state from localStorage
  useEffect(() => {
    const user = pb.authStore.model
    if (user) {
      setUserId(user.id)
    } else {
      router.replace('/auth/student/sign-in')
      return
    }

    const savedState = localStorage.getItem(`quizState_${user?.id}_${testId}`)
    if (savedState) {
      const { index, answers, time, marked } = JSON.parse(savedState)
      setCurrentQuestionIndex(index || 0)
      setAnswers(answers || {})
      setTimeLeft(time || 0)
      setMarkedForReview(marked || [])
    }
  }, [testId, router])

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true)
        
        const testRecord = await pb.collection('tests').getOne(testId, {
          expand: 'questions'
        })
        setTest(testRecord)
        
        if (timeLeft === 0) {
          setTimeLeft(testRecord.time_limit * 60)
        }

        const questionRecords = await pb.collection('questions').getFullList({
          filter: testRecord.questions.map(id => `id="${id}"`).join('||')
        })
        setQuestions(questionRecords)

        if (answers[questionRecords[currentQuestionIndex]?.id]) {
          setSelectedOption(answers[questionRecords[currentQuestionIndex].id])
        }
      } catch (error) {
        console.error('Error loading test:', error)
        toast.error('Failed to load test data')
      } finally {
        setLoading(false)
      }
    }

    if (testId && userId) fetchTestData()
  }, [testId, userId])

  // Persist state to localStorage
  useEffect(() => {
    if (userId && testId) {
      const stateToSave = {
        index: currentQuestionIndex,
        answers,
        time: timeLeft,
        marked: markedForReview
      }
      localStorage.setItem(`quizState_${userId}_${testId}`, JSON.stringify(stateToSave))
    }
  }, [currentQuestionIndex, answers, markedForReview, userId, testId])

  // Submit test on page if time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
    }
  }, [timeLeft])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (option) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: option
    }
    setSelectedOption(option)
    setAnswers(newAnswers)
  }

  const navigateToQuestion = (index) => {
    setCurrentQuestionIndex(index)
    setSelectedOption(answers[questions[index]?.id] || null)
    setShowQuestionMap(false)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1)
    }
  }

  const toggleMarkForReview = () => {
    const newMarked = markedForReview.includes(currentQuestion.id)
      ? markedForReview.filter(id => id !== currentQuestion.id)
      : [...markedForReview, currentQuestion.id]
    setMarkedForReview(newMarked)
  }

  const handleFinalize = () => {
    setIsFinalizing(true)
    setShowQuestionMap(true)
  }

  const calculateScore = () => {
    let correctAnswers = 0
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === q.correct_answer) {
        correctAnswers++
      }
    })
    return Math.round((correctAnswers / questions.length) * 100)
  }

  const handleSubmit = async () => {
    try {
      const score = calculateScore()
      const passed = score >= test.passing_score
      
      // Show result before saving
      setTestResult({ score, passed })
      setIsShowingResult(true)

      // Create comprehensive test record
      const testRecordData = {
        student: userId,
        test: testId,
        score: score.toString(),
        passing_score: test.passing_score.toString(),
        passed,
        time_completed: new Date().toISOString(),
        time_limit: test.time_limit,
        answer_script: JSON.stringify({
          test_id: testId,
          test_name: test.name,
          student_id: userId,
          started_at: new Date(Date.now() - (test.time_limit * 60 * 1000) + (timeLeft * 1000)).toISOString(),
          completed_at: new Date().toISOString(),
          time_spent: (test.time_limit * 60) - timeLeft,
          questions: questions.map(q => ({
            question_id: q.id,
            question_text: q.question_text,
            options: {
              a: q.option_a,
              b: q.option_b,
              c: q.option_c
            },
            correct_answer: q.correct_answer,
            selected_answer: answers[q.id] || null,
            is_correct: answers[q.id] === q.correct_answer,
            marked_for_review: markedForReview.includes(q.id),
            image: q.image ? pb.files.getUrl(q, q.image) : null,
            explanation: q.explanation || null,
            category: q.category || null
          })),
          summary: {
            total_questions: questions.length,
            answered: Object.keys(answers).length,
            correct: questions.filter(q => answers[q.id] === q.correct_answer).length,
            marked_for_review: markedForReview.length,
            score,
            passed
          }
        }),
        performance_data: JSON.stringify({
          by_category: questions.reduce((acc, q) => {
            const category = q.category || 'uncategorized'
            if (!acc[category]) acc[category] = { correct: 0, total: 0 }
            acc[category].total++
            if (answers[q.id] === q.correct_answer) acc[category].correct++
            return acc
          }, {})
        })
      }
      
      // Save to test_records collection
      const testRecord = await pb.collection('test_records').create(testRecordData)

      // Update student's test history (without overwriting)
      const student = await pb.collection('students').getOne(userId)
      const testHistory = student.test_history ? JSON.parse(student.test_history) : {}
      
      const updatedHistory = {
        ...testHistory,
        [testRecord.id]: {
          test_id: testId,
          test_name: test.name,
          date: new Date().toISOString(),
          score,
          passed,
          time_spent: (test.time_limit * 60) - timeLeft
        }
      }

      await pb.collection('students').update(userId, {
        test_history: JSON.stringify(updatedHistory),
        [`test_scores.${testId}`]: {
          latest_score: score,
          best_score: Math.max(score, student.test_scores?.[testId]?.best_score || 0),
          attempts: (student.test_scores?.[testId]?.attempts || 0) + 1,
          last_attempt: new Date().toISOString()
        }
      })

      localStorage.removeItem(`quizState_${userId}_${testId}`)
      
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit test results')
    } finally {
      setIsFinalizing(false)
      setShowQuestionMap(false)
      setIsShowingResult(true)
      localStorage.removeItem(`quizState_${userId}_${testId}`)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  function ResultDisplay({ result, test, onClose }) {
    if (!result) return null
  
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${result.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        <div className="text-center p-8 max-w-md">
          <h2 className="text-4xl font-bold mb-4">
            {result.passed ? 'Congratulations!' : 'Test Failed'}
          </h2>
          <div className="text-6xl font-bold mb-6">{result.score}%</div>
          <p className="text-xl mb-6">
            {result.passed 
              ? `You passed with ${result.score}% (Required: ${test.passing_score}%)`
              : `You needed ${test.passing_score}% to pass (Your score: ${result.score}%)`}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push('/student')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white"
            >
              Return to Dashboard
            </Button>
            <Button 
              onClick={onClose}
              className={`${result.passed ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800'}`}
              size="lg"
            >
              View Detailed Results
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading test...</p>
        </div>
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Test not found</h2>
          <p className="text-muted-foreground">The requested test could not be loaded</p>
          <Button className="mt-4" onClick={() => router.push('/student/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Navigation Bar with Timer */}
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {test.name}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <Progress 
            value={(timeLeft / (test.time_limit * 60)) * 100} 
            className="w-32 h-2" 
          />
          {!isFinalizing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQuestionMap(!showQuestionMap)}
              className="text-white border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Grid className="h-4 w-4 mr-2" />
              {showQuestionMap ? 'Hide Questions' : 'Show Questions'}
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        {showQuestionMap ? (
          <div className="space-y-6">
            <QuestionMap 
              questions={questions}
              answers={answers}
              markedForReview={markedForReview}
              currentIndex={currentQuestionIndex}
              onSelect={navigateToQuestion}
            />
            {isFinalizing && (
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsFinalizing(false)
                    setShowQuestionMap(false)
                  }}
                >
                  Back to Test
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 dark:text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Submit Test
                </Button>
              </div>
            )}
          </div>
        ) : (
          <QuestionComponent 
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            questionsCount={questions.length}
            selectedOption={selectedOption}
            onOptionSelect={handleOptionSelect}
            markedForReview={markedForReview}
            onToggleMark={toggleMarkForReview}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFinalize={handleFinalize}
            pb={pb}
          />
        )}
      </main>

      {/* Result Display */}
      {isShowingResult && testResult && (
        <ResultDisplay 
          result={testResult} 
          test={test} 
          onClose={() => router.push('/student/test/results')}
        />
      )}
    </div>
  )
}

function QuestionMap({ questions, answers, markedForReview, currentIndex, onSelect }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Review Your Answers</h2>
      <div className="grid grid-cols-5 gap-3">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => onSelect(index)}
            className={`p-3 rounded-md flex items-center justify-center text-sm border transition-colors ${
              currentIndex === index
                ? 'bg-blue-500 text-white border-blue-600'
                : answers[q.id]
                  ? 'bg-green-100 dark:bg-green-400 dark:text-green-100 text-green-800 border-green-200 hover:bg-green-200'
                  : markedForReview.includes(q.id)
                    ? 'bg-yellow-100 dark:bg-yellow-500 dark:text-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {index + 1}
            {answers[q.id] && (
              <span className="ml-1">✓</span>
            )}
            {markedForReview.includes(q.id) && (
              <span className="ml-1">🔴</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
          <span className="text-sm">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
          <span className="text-sm">Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
          <span className="text-sm">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
          <span className="text-sm">Unanswered</span>
        </div>
      </div>
    </div>
  )
}

function QuestionComponent({ 
  currentQuestion, 
  currentQuestionIndex, 
  questionsCount,
  selectedOption,
  onOptionSelect,
  markedForReview,
  onToggleMark,
  onPrevious,
  onNext,
  onFinalize,
  pb
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
      <div className="mb-2 text-sm text-gray-500">
        Question {currentQuestionIndex + 1} of {questionsCount}
      </div>

      <h2 className="text-xl font-semibold mb-6 dark:text-white">{currentQuestion.question_text}</h2>

      <div className='flex flex-col lg:flex-row gap-6 w-full'>
        <div className={`grid gap-3 h-fit w-full ${currentQuestion.image ? 'lg:w-2/3' : 'w-full'}`}>
          {['option_a', 'option_b', 'option_c'].map((option) => (
            <div 
              key={option}
              className={`p-4 border rounded-lg dark:text-white cursor-pointer transition-colors ${
                selectedOption === option 
                  ? 'bg-green-100 border-green-500 dark:bg-green-500 dark:text-white' 
                  : 'hover:bg-gray-50 dark:text-black'
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <div className="flex items-center gap-3">
                {/* <div className={`w-6 h-6 rounded flex items-center justify-center ${
                  selectedOption === option 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200'
                }`}>
                  {option.split('_')[1].toUpperCase()}
                </div> */}
                <span>{currentQuestion[option]}</span>
              </div>
            </div>
          ))}
        </div>

        {currentQuestion.image && (
          <div className="w-full lg:w-1/3">
            <img 
              src={pb.files.getUrl(currentQuestion, currentQuestion.image)} 
              alt="Question illustration" 
              className="w-full h-auto max-h-64 object-contain rounded-md border"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-between mt-8">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className="dark:text-white dark:border"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={onNext}
            disabled={currentQuestionIndex === questionsCount - 1}
            className="dark:text-white dark:border"

          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant={markedForReview.includes(currentQuestion.id) ? "default" : "outline"}
            onClick={onToggleMark}
            className="dark:text-white dark:bg-transparent dark:border"

          >
            <Flag className="h-4 w-4 mr-2" />
            {markedForReview.includes(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
          </Button>
          <Button 
            onClick={onFinalize}
            className="bg-blue-600 hover:bg-blue-700 dark:text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalize Test
          </Button>
        </div>
      </div>
    </div>
  )
}