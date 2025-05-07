"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, Clock, Award, Users, FileText, ChevronLeft,
  BarChart2, TrendingUp, CheckCircle, XCircle, Flag 
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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminStats() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTests: 0,
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    flaggedScripts: 0,
    recentActivity: []
  })
  const [testRecords, setTestRecords] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const user = pb.authStore.model
        if (!user) {
          router.push('/auth/admin/sign-in')
          return
        }

        // Fetch all test records
        const records = await pb.collection('test_records').getFullList({
          expand: 'student,test',
          sort: '-created',
          limit: 50
        })
        setTestRecords(records)

        // Fetch all students
        const studentList = await pb.collection('students').getFullList()
        setStudents(studentList)

        // Calculate statistics
        const totalTests = records.length
        const passedTests = records.filter(r => r.passed).length
        const totalScore = records.reduce((sum, record) => sum + (record.answer_script?.summary?.score || 0), 0)
        const flaggedScripts = records.filter(r => r.answer_script?.questions?.some(q => q.marked_for_review)).length

        // Calculate category performance
        const categoryStats = {}
        records.forEach(record => {
          const script = record.answer_script
          if (script?.questions) {
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

        // Prepare recent activity
        const recentActivity = records.slice(0, 5).map(record => ({
          id: record.id,
          student: record.expand?.student?.name || 'Unknown',
          test: record.expand?.test?.name || 'Test',
          score: record.answer_script?.summary?.score || 0,
          date: new Date(record.created).toLocaleDateString(),
          passed: record.passed
        }))

        setStats({
          totalTests,
          totalStudents: studentList.length,
          averageScore: totalTests > 0 ? Math.round(totalScore / totalTests) : 0,
          passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
          flaggedScripts,
          recentActivity,
          categoryStats
        })

      } catch (err) {
        console.error('Error loading dashboard data:', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  const performanceByCategory = () => {
    if (!stats.categoryStats) return []
    
    return Object.entries(stats.categoryStats).map(([name, data]) => ({
      name: name.replace('_', ' '),
      value: Math.round((data.correct / data.total) * 100),
      total: data.total
    }))
  }

  const scoreDistributionData = () => {
    const distribution = Array(10).fill(0).map((_, i) => ({
      range: `${i*10}-${(i+1)*10}%`,
      count: 0
    }))

    testRecords.forEach(record => {
      const score = record.answer_script?.summary?.score || 0
      const index = Math.floor(score / 10)
      if (index >= 0 && index < 10) {
        distribution[index].count++
      }
    })

    return distribution
  }

  const studentPerformanceData = () => {
    return students.slice(0, 10).map(student => {
      const studentTests = testRecords.filter(r => r.student === student.id)
      const avgScore = studentTests.length > 0 
        ? Math.round(studentTests.reduce((sum, r) => sum + (r.answer_script?.summary?.score || 0), 0) / studentTests.length)
        : 0
      
      return {
        name: student.name,
        tests: studentTests.length,
        average: avgScore
      }
    }).sort((a, b) => b.average - a.average)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {stats.totalStudents} Students
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {stats.totalTests} Tests
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Conducted to date
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Of all attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Flagged Scripts</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedScripts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requiring review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
            <CardDescription>Accuracy across question categories</CardDescription>
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
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>How scores are distributed across all tests</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistributionData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="range"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {scoreDistributionData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Activity</CardTitle>
            <CardDescription>Latest test attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.student}</TableCell>
                    <TableCell>{activity.test}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={activity.score} className="h-2 w-20" />
                        <span>{activity.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{activity.date}</TableCell>
                    <TableCell>
                      <Badge variant={activity.passed ? "default" : "destructive"}>
                        {activity.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Students with highest average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={studentPerformanceData()}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Average Score"]}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="average" name="Average Score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Scripts Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flagged Answer Scripts
          </CardTitle>
          <CardDescription>Tests requiring manual review</CardDescription>
        </CardHeader>
        <CardContent>
          {testRecords.filter(r => r.answer_script?.questions?.some(q => q.marked_for_review)).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Flagged Questions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testRecords
                  .filter(r => r.answer_script?.questions?.some(q => q.marked_for_review))
                  .slice(0, 5)
                  .map(record => {
                    const flaggedCount = record.answer_script.questions.filter(q => q.marked_for_review).length
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.expand?.student?.name || 'Unknown'}</TableCell>
                        <TableCell>{record.expand?.test?.name || 'Test'}</TableCell>
                        <TableCell>
                          <Badge variant={record.passed ? "default" : "destructive"}>
                            {record.answer_script?.summary?.score || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {flaggedCount} question{flaggedCount !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/admin/results/${record.id}`)}
                          >
                            Review Script
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No flagged scripts requiring review
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}