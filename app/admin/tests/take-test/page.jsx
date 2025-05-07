"use client"

import { useState, useEffect } from "react"
import pb from "@/lib/connection"
import { useRouter } from "next/navigation"
import { Search, Clock, CheckCircle, XCircle, List, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestListingPage() {
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // 'all', 'active', 'inactive'
    category: '', // test category if you have it
    minQuestions: 0,
    passingScore: 0
  })

  // Fetch tests data
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true)
        const records = await pb.collection('tests').getFullList({
          expand: 'questions',
          sort: '-created'
        })
        setTests(records)
      } catch (error) {
        console.error("Failed to fetch tests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  // Filter tests based on filters
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                         test.description?.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && test.is_active) || 
                         (filters.status === 'inactive' && !test.is_active)
    const matchesMinQuestions = test.questions?.length >= filters.minQuestions
    const matchesPassingScore = test.passing_score >= filters.passingScore

    return matchesSearch && matchesStatus && matchesMinQuestions && matchesPassingScore
  })

  // Handle test card click
  const handleTestClick = (testId) => {
    router.push(`/admin/test/take-test/${testId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Available Tests</h1>
          <p className="text-muted-foreground">
            {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} available
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Tabs 
            value={viewMode} 
            onValueChange={setViewMode}
            className="hidden sm:block"
          >
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setFilters({
            search: '',
            status: 'all',
            category: '',
            minQuestions: 0,
            passingScore: 0
          })}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-muted/50 rounded-lg p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Questions</Label>
            <Input
              type="number"
              min="0"
              value={filters.minQuestions}
              onChange={(e) => setFilters({...filters, minQuestions: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Passing Score</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={filters.passingScore}
              onChange={(e) => setFilters({...filters, passingScore: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[...Array(6)].map((_, i) => (
            viewMode === 'grid' ? (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ) : (
              <Skeleton key={i} className="h-24 rounded-lg" />
            )
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-medium mb-2">No tests found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Grid View */}
      {!loading && filteredTests.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <Card 
              key={test.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
              onClick={() => handleTestClick(test.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge variant={test.is_active ? "default" : "secondary"}>
                    {test.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {test.description && (
                  <CardDescription className="line-clamp-2">
                    {test.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="font-medium">{test.questions?.length || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="font-medium">{test.passing_score}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Time Limit</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.time_limit} mins
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className="font-medium">
                      {test.passing_score >= 80 ? (
                        <span className="text-red-500">Hard</span>
                      ) : test.passing_score >= 60 ? (
                        <span className="text-yellow-500">Medium</span>
                      ) : (
                        <span className="text-green-500">Easy</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex items-center gap-2">
                  {test.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {test.is_active ? "Available" : "Unavailable"}
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  Take Test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && filteredTests.length > 0 && viewMode === 'list' && (
        <div className="space-y-4">
          {filteredTests.map(test => (
            <Card 
              key={test.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTestClick(test.id)}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start">
                    <CardTitle>{test.name}</CardTitle>
                    <Badge variant={test.is_active ? "default" : "secondary"}>
                      {test.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {test.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {test.description}
                    </CardDescription>
                  )}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="font-medium">{test.questions?.length || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Passing Score</p>
                      <p className="font-medium">{test.passing_score}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Time Limit</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {test.time_limit} mins
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Difficulty</p>
                      <p className="font-medium">
                        {test.passing_score >= 80 ? (
                          <span className="text-red-500">Hard</span>
                        ) : test.passing_score >= 60 ? (
                          <span className="text-yellow-500">Medium</span>
                        ) : (
                          <span className="text-green-500">Easy</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t sm:border-t-0 sm:border-l flex items-center justify-end sm:w-48">
                  <Button className="w-full sm:w-auto">
                    Take Test
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}