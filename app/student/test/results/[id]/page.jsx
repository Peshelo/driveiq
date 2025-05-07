"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronLeft, Flag, Clock, BarChart2 } from 'lucide-react'
import pb from '@/lib/connection'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function TestResultPage() {
    const params = useParams();
  const router = useRouter()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
    const fetchTestRecord = async () => {
      try {
        setLoading(true)
        const user = pb.authStore.model
        if (!user) {
          router.push('/auth/student/sign-in')
          return
        }

        const testRecord = await pb.collection('test_records').getOne(params.id, {
        //   expand: 'test'
        })
        
        // Verify the record belongs to the current student
        if (testRecord.student !== user.id) {
          throw new Error('You are not authorized to view this record')
        }

        setRecord(testRecord)

      } catch (err) {
        // setError(err.message)
        console.error('Error loading test record:', err)
        toast.error('Failed to load test results')
      } finally {
        setLoading(false)
      }
    }
  useEffect(() => {


    fetchTestRecord()
  }, [params])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading test results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading results</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.refresh()}>
            Retry
            </Button>
          <Button className="mt-4" onClick={() => router.push('/student/results')}>
            Back to Results
          </Button>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Test record not found</h2>
          <Button className="mt-4" onClick={() => router.push('/student/results')}>
            Back to Results
          </Button>
        </div>
      </div>
    )
  }

  const script = record.answer_script
  const testName = record.expand?.test?.name || script.test_name || "Test"
  const completedDate = new Date(script.completed_at)

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/student/test/results')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to All Results
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant={record.passed ? "default" : "destructive"}>
            {record.passed ? 'Passed' : 'Failed'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{testName}</CardTitle>
            <CardDescription>
              Completed on {completedDate.toLocaleDateString()} at {completedDate.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{script.summary.score}%</div>
                  <p className="text-sm text-muted-foreground">Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {script.summary.correct}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {script.summary.answered - script.summary.correct}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {Math.floor(script.summary.time_spent / 60)}m {script.summary.time_spent % 60}s
                  </div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Progress 
            value={script.summary.score} 
            className="h-3 flex-1" 
          />
          <span className="text-sm font-medium">
            {script.summary.score}% Overall
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Question Breakdown</h2>
        
        {script.questions.map((q, index) => (
          <Card key={index} className={`${!q.is_correct ? 'border-red-200' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Question {index + 1}</span>
                  {q.marked_for_review && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      Marked
                    </Badge>
                  )}
                </div>
                {q.is_correct ? (
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Correct
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Incorrect
                  </Badge>
                )}
              </div>

              <p className="mb-4">{q.question_text}</p>
              {q.image && (
                <div className="mb-4 max-w-xs">
                  <img src={q.image} alt="Question" className="rounded border" />
                </div>
              )}

              <div className="grid gap-2">
                {['a', 'b', 'c', 'd'].filter(opt => q.options[opt]).map(opt => (
                  <div 
                    key={opt}
                    className={`p-3 border rounded ${
                      q.correct_answer === `option_${opt}`
                        ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                        : q.selected_answer === `option_${opt}`
                          ? 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
                          : 'bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        q.correct_answer === `option_${opt}`
                          ? 'bg-green-500 text-white dark:bg-green-700 dark:text-green-200' 
                          : q.selected_answer === `option_${opt}`
                            ? 'bg-red-500 text-white dark:bg-red-700 dark:text-red-200'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {opt.toUpperCase()}
                      </div>
                      <span>{q.options[opt]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {!q.is_correct && q.correct_answer && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">
                    Correct Answer: {q.correct_answer.split('_')[1].toUpperCase()}
                  </p>
                  {q.explanation && (
                    <p className="mt-1 text-sm text-blue-700">{q.explanation}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}