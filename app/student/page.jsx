"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, Clock, Award, Calendar, FileText, 
  ChevronRight, AlertCircle, CheckCircle, XCircle, 
  BarChart2, TrendingUp, User, Rocket, GraduationCap,
  Eye, ChevronLeft
} from 'lucide-react'
import pb from '@/lib/connection'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function StudentDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [testRecords, setTestRecords] = useState([])
  const [loading, setLoading] = useState(true)
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
    const fetchData = async () => {
      try {
        setLoading(true)
        const user = pb.authStore.model
        if (!user) {
          router.push('/auth/student/sign-in')
          return
        }

        // Fetch student details
        const studentData = await pb.collection('students').getOne(user.id)
        setStudent(studentData)

        // Fetch test records with expanded test data
        const records = await pb.collection('test_records').getFullList({
          filter: `student = "${user.id}"`,
          expand: 'test',
          sort: '-created',
          limit: 5
        })
        setTestRecords(records)

        // Calculate statistics from test records
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
        console.error('Error loading dashboard:', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  const recentTestsData = () => {
    return testRecords.map(record => {
      const script = record.answer_script
      return {
        id: record.id,
        name: record.expand?.test?.name || script.test_name || "Test",
        date: new Date(script.completed_at).toLocaleDateString(),
        score: script.summary.score,
        passed: record.passed,
        correct: script.summary.correct,
        total: script.summary.total_questions,
        timeSpent: script.summary.time_spent
      }
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
 

      {/* Student Profile Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6" />
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{student?.name || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{student?.student_id || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Join Date</p>
                <p className="font-medium">
                  {student?.created ? new Date(student.created).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6" />
              Learning Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="font-medium">{student?.level || 'Beginner'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
                <p className="font-medium">{stats.totalTests}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Active</p>
                <p className="font-medium">
                  {student?.last_login ? new Date(student.last_login).toLocaleString() : 'Recently'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold capitalize">{stats.strongestCategory || 'N/A'}</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Recent Test Attempts
          </CardTitle>
          <CardDescription>Your most recent test performances</CardDescription>
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
                {recentTestsData().map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={test.score} 
                          className="h-2 w-20" 
                        />
                        <span>{test.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={test.passed ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {test.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {test.correct}/{test.total} correct • {Math.floor(test.timeSpent / 60)}m {test.timeSpent % 60}s
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/student/test/results/${test.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/student/test')}>
          <BookOpen className="h-6 w-6" />
          <span>Take a Test</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/student/test/results')}>
          <FileText className="h-6 w-6" />
          <span>View All Results</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/student/profile')}>
          <User className="h-6 w-6" />
          <span>Update Profile</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/student/study-materials')}>
          <BookOpen className="h-6 w-6" />
          <span>Study Materials</span>
        </Button>
      </div>
    </div>
  )
}