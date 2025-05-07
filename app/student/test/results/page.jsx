"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronLeft, Eye, BookOpen, Flag, BarChart2, Award, Clock, TrendingUp, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import pb from '@/lib/connection'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TestResultsPage() {
  const router = useRouter()
  const [testRecords, setTestRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedScript, setSelectedScript] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [stats, setStats] = useState({
    totalTests: 0,
    passedTests: 0,
    averageScore: 0,
    bestScore: 0,
    weakestCategory: '',
    strongestCategory: '',
    averageTime: 0
  })

  useEffect(() => {
    const fetchTestRecords = async () => {
      try {
        setLoading(true)
        const user = pb.authStore.model
        if (!user) {
          router.push('/auth/student/sign-in')
          return
        }

        const records = await pb.collection('test_records').getFullList({
          expand: 'test',
          sort: '-created'
        })
        setTestRecords(records)

        // Calculate statistics
        if (records.length > 0) {
          const passedTests = records.filter(r => r.passed).length
          const totalScore = records.reduce((sum, record) => {
            const script = record.answer_script
            return sum + script.summary.score
          }, 0)
          const bestScore = Math.max(...records.map(record => {
            const script = record.answer_script
            return script.summary.score
          }))
          
          // Calculate category performance
          const categoryStats = {}
          records.forEach(record => {
            const script = record.answer_script
            if (script.questions) {
              script.questions.forEach(q => {
                const category = q.category || 'Uncategorized'
                if (!categoryStats[category]) {
                  categoryStats[category] = { correct: 0, total: 0 }
                }
                categoryStats[category].total++
                if (q.is_correct) categoryStats[category].correct++
              })
            }
          })

          // Find strongest/weakest categories
          let weakestCategory = ''
          let strongestCategory = ''
          let minPercentage = 100
          let maxPercentage = 0
          
          Object.entries(categoryStats).forEach(([category, data]) => {
            const percentage = (data.correct / data.total) * 100
            if (percentage < minPercentage) {
              minPercentage = percentage
              weakestCategory = category
            }
            if (percentage > maxPercentage) {
              maxPercentage = percentage
              strongestCategory = category
            }
          })

          // Calculate average time
          const totalTime = records.reduce((sum, record) => {
            const script = record.answer_script
            return sum + script.summary.time_spent
          }, 0)

          setStats({
            totalTests: records.length,
            passedTests,
            averageScore: Math.round(totalScore / records.length),
            bestScore,
            weakestCategory: weakestCategory.replace('_', ' '),
            strongestCategory: strongestCategory.replace('_', ' '),
            averageTime: Math.round(totalTime / records.length)
          })
        }

      } catch (err) {
        // setError(err.message)
        console.error('Error loading test records:', err)
        toast.error('Failed to load test history')
      } finally {
        setLoading(false)
      }
    }

    fetchTestRecords()
  }, [router])

  const performanceByCategory = () => {
    if (testRecords.length === 0) return []
    
    const categoryStats = {}
    testRecords.forEach(record => {
      const script = record.answer_script
      if (script.questions) {
        script.questions.forEach(q => {
          const category = q.category || 'Uncategorized'
          if (!categoryStats[category]) {
            categoryStats[category] = { correct: 0, total: 0 }
          }
          categoryStats[category].total++
          if (q.is_correct) categoryStats[category].correct++
        })
      }
    })

    return Object.entries(categoryStats).map(([name, data]) => ({
      name: name.replace('_', ' '),
      value: Math.round((data.correct / data.total) * 100),
      total: data.total
    }))
  }

  const scoreTrendData = () => {
    return testRecords.map(record => {
      const script = record.answer_script
      return {
        name: new Date(script.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: script.summary.score
      }
    }).reverse() // Show oldest first
  }

  const openAnswerScript = (script) => {
    setSelectedScript(script)
    setIsDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your test history...</p>
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
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/student')}
        className="mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <Progress 
              value={(stats.passedTests / stats.totalTests) * 100 || 0} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.passedTests} passed ({Math.round((stats.passedTests / stats.totalTests) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress 
                value={stats.averageScore} 
                className="h-2 flex-1" 
              />
              <span className="text-xs text-muted-foreground">
                vs {stats.bestScore}% best
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Strongest Area</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stats.strongestCategory}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Highest accuracy category
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.averageTime / 60)}m {stats.averageTime % 60}s
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Per test attempt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
            <CardDescription>Your accuracy across different question categories</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceByCategory()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Accuracy"]}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="value" name="Accuracy" radius={[4, 4, 0, 0]}>
                  {performanceByCategory().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <CardDescription>Your progress over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendData()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Score"]}
                  labelFormatter={(label) => `Test on ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Test Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div> */}

      {/* Test History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Your Test History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No test attempts found</p>
              <Button className="mt-4" onClick={() => router.push('/student/test')}>
                Take a Test
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testRecords.map((record) => {
                  const script = record.answer_script
                  const testName = record.expand?.test?.name || script.test_name || "Test"
                  const date = new Date(script.completed_at)
                  const formattedDate = date.toLocaleDateString()
                  const formattedTime = date.toLocaleTimeString()

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{testName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formattedDate}</span>
                          <span className="text-xs text-muted-foreground">{formattedTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={script.summary.score} 
                            className="h-2 w-20" 
                          />
                          <span>{script.summary.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.passed ? "default" : "destructive"}
                          className="capitalize"
                        >
                          {record.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {script.summary.correct}/{script.summary.total_questions} correct
                        </div>
                      </TableCell>
                      <TableCell className="text-right flex flex-row items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAnswerScript(script)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Quick View
                        </Button>
                        <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/student/test/results/${record.id}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Answer Script Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[90vh]">
          <div className="mx-auto w-full max-w-4xl overflow-auto p-6">
            <DrawerHeader>
              <DrawerTitle>{selectedScript?.test_name} Answer Script</DrawerTitle>
              <DrawerDescription>
                Completed on {selectedScript && new Date(selectedScript.completed_at).toLocaleString()}
              </DrawerDescription>
            </DrawerHeader>

            {selectedScript && (
              <div className="mt-6 space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{selectedScript.summary.score}%</div>
                      <p className="text-sm text-muted-foreground">Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedScript.summary.correct}
                      </div>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedScript.summary.answered - selectedScript.summary.correct}
                      </div>
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {Math.floor(selectedScript.summary.time_spent / 60)}m {selectedScript.summary.time_spent % 60}s
                      </div>
                      <p className="text-sm text-muted-foreground">Time Spent</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Question Breakdown</h3>
                  {selectedScript.questions.map((q, index) => (
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
                          {['a', 'b', 'c'].map(opt => (
                            <div 
                              key={opt}
                              className={`p-3 border rounded ${
                                q.correct_answer === `option_${opt}`
                                  ? 'bg-green-50 border-green-200'
                                  : q.selected_answer === `option_${opt}`
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                  q.correct_answer === `option_${opt}`
                                    ? 'bg-green-500 text-white'
                                    : q.selected_answer === `option_${opt}`
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-200'
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
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}