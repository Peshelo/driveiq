"use client"

import { useState, useEffect, useMemo } from "react"
import pb from "@/lib/connection"
import { toast } from "sonner"
import { Plus, Trash2, Image as ImageIcon, Upload, Download, X, MoreVertical, Eye, Filter, Check, Edit, Delete, Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Papa from "papaparse"

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import AdminStats from "../../../components/dashboard-stats"

// Schemas
const testSchema = z.object({
  name: z.string().min(3, "Test name must be at least 3 characters"),
  description: z.string().optional(),
  passing_score: z.number().min(1).max(100),
  time_limit: z.number().min(1),
  is_active: z.boolean().default(true),
  questions: z.array(z.string()).min(1, "At least one question is required")
})

const questionSchema = z.object({
  question_text: z.string().min(5, "Question must be at least 5 characters"),
  option_a: z.string().min(1, "Option A is required"),
  option_b: z.string().min(1, "Option B is required"),
  option_c: z.string().min(1, "Option C is required"),
  correct_answer: z.enum(["option_a", "option_b", "option_c"]),
  category: z.enum(["ROAD_SIGNS", "TRAFFIC_LAWS", "SAFETY", "VEHICLE_CONTROL"]),
  explanation: z.string().optional(),
  image: z.any().optional()
})

export default function TestManagement() {
  // State for tests and questions
  const [tests, setTests] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState({
    tests: true,
    questions: true,
    batchUpload: false
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [processedCount, setProcessedCount] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  // Test creation state
  const [currentTest, setCurrentTest] = useState(null)
  const [sheetOpen, setSheetOpen] = useState({
    tests: false,
    viewTest: false,
    addQuestion: false
  })
  const [questionFilters, setQuestionFilters] = useState({
    search: '',
    category: '',
    hasImage: false
  })
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [imagePreviews, setImagePreviews] = useState({})

  // Forms
  const testForm = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      description: "",
      passing_score: 70,
      time_limit: 30,
      is_active: true,
      questions: []
    }
  })

  const questionForm = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      correct_answer: "option_a",
      category: "ROAD_SIGNS",
      explanation: "",
      image: null
    }
  })

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, tests: true, questions: true }))
      
      // Fetch tests with expanded questions
      const testRecords = await pb.collection('tests').getFullList({
        expand: 'questions',
        sort: '-created'
      })
      setTests(testRecords)

      // Fetch all questions
      const questionRecords = await pb.collection('questions').getFullList({
        sort: '-created'
      })
      setQuestions(questionRecords)
    } catch (error) {
      toast.error("Failed to load data: " + error.message)
    } finally {
      setLoading(prev => ({ ...prev, tests: false, questions: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter questions based on filters
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.question_text?.toLowerCase().includes(questionFilters.search.toLowerCase()) || 
                         q.explanation?.toLowerCase().includes(questionFilters.search.toLowerCase())
      const matchesCategory = !questionFilters.category || q.category === questionFilters.category
      const matchesImage = !questionFilters.hasImage || q.image
      
      return matchesSearch && matchesCategory && matchesImage
    })
  }, [questions, questionFilters])

  // Handle test creation/update
  const onSubmitTest = async (data) => {
    try {
      console.log("Submitting test with data:", data)
      console.log("Selected questions:", selectedQuestions)
      
      if (selectedQuestions.length === 0) {
        throw new Error("Please select at least one question")
      }

      setLoading(prev => ({ ...prev, tests: true }))
      
      const testData = {
        ...data,
        questions: selectedQuestions,
        driving_school: pb.authStore.record?.id || null
      }

      if (currentTest) {
        // Update existing test
        await pb.collection('tests').update(currentTest.id, testData)
        toast.success("Test updated successfully")
      } else {
        // Create new test
        await pb.collection('tests').create(testData)
        toast.success("Test created successfully")
      }

      // Refresh data and close sheet
      await fetchData()
      setSheetOpen({ ...sheetOpen, tests: false })
    } catch (error) {
      console.error("Error submitting test:", error)
      toast.error("Failed to save test: " + error.message)
    } finally {
      setLoading(prev => ({ ...prev, tests: false }))
    }
  }

  // Handle CSV upload for test questions
  const handleBatchUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setUploadStatus('idle')
      setUploadProgress(0)
      setProcessedCount(0)
      setLoading(prev => ({ ...prev, batchUpload: true }))
      
      // Parse CSV
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const validQuestions = results.data
              .filter(row => row?.question_text && row?.option_a && row?.option_b && row?.option_c)
              .map(row => ({
                question_text: row.question_text || "",
                option_a: row.option_a || "",
                option_b: row.option_b || "",
                option_c: row.option_c || "",
                correct_answer: ["option_a", "option_b", "option_c"].includes(row.correct_answer) 
                  ? row.correct_answer 
                  : "option_a",
                category: ["ROAD_SIGNS", "TRAFFIC_LAWS", "SAFETY", "VEHICLE_CONTROL"].includes(row.category)
                  ? row.category
                  : "ROAD_SIGNS",
                explanation: row.explanation || "",
                image: null,
                driving_school: null
             }))
            resolve(validQuestions)
          },
          error: (error) => {
            reject(error)
          }
        })
      })

      if (!results || results.length === 0) {
        throw new Error("No valid questions found in the CSV")
      }

      setTotalQuestions(results.length)
      setUploadStatus('uploading')

      // Create questions in bulk
      const createdQuestions = []
      const drivingSchoolId = pb.authStore.record?.id || null
      for (let i = 0; i < results.length; i++) {
        try {
          const question = results[i]
          question.driving_school = drivingSchoolId;
          const created = await pb.collection('questions').create(question)
          createdQuestions.push(created)
          
          // Update progress
          const progress = Math.floor(((i + 1) / results.length) * 100)
          setUploadProgress(progress)
          setProcessedCount(i + 1)
        } catch (error) {
          console.error(`Failed to create question ${i + 1}:`, error)
        }
      }

      // Add new question IDs to selection
      setSelectedQuestions(prev => [...prev, ...createdQuestions.map(q => q.id)])
      
      setUploadStatus('completed')
      toast.success(`Added ${createdQuestions.length} new questions to test`)
    } catch (error) {
      setUploadStatus('error')
      toast.error("Failed to process CSV: " + error.message)
    } finally {
      setLoading(prev => ({ ...prev, batchUpload: false }))
    }
  }

  // Handle creating a new question from the test form
  const onSubmitQuestion = async (data) => {
    try {
      setLoading(prev => ({ ...prev, questions: true }))
      
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })
      formData.append('driving_school', pb.authStore.record?.id || null)
      
      const createdQuestion = await pb.collection('questions').create(formData)
      
      // Add the new question to the selection and refresh questions
      setSelectedQuestions(prev => [...prev, createdQuestion.id])
      await fetchData()
      
      toast.success("Question created and added to test")
      questionForm.reset()
      setImagePreviews({})
      setSheetOpen({ ...sheetOpen, addQuestion: false })
    } catch (error) {
      toast.error("Failed to create question: " + error.message)
    } finally {
      setLoading(prev => ({ ...prev, questions: false }))
    }
  }

  // Bulk selection handlers
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map(q => q.id)
    setSelectedQuestions(prev => [...new Set([...prev, ...filteredIds])])
  }

  const handleClearSelection = () => {
    setSelectedQuestions([])
  }

  const handleToggleQuestion = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  // Open test sheet (create or edit)
  const openTestSheet = (test = null) => {
    setCurrentTest(test)
    if (test) {
      testForm.reset({
        name: test.name,
        description: test.description,
        passing_score: test.passing_score,
        time_limit: test.time_limit,
        is_active: test.is_active,
        questions: test.questions
      })
      setSelectedQuestions(test.questions || [])
    } else {
      testForm.reset()
      setSelectedQuestions([])
    }
    setSheetOpen(prev => ({ ...prev, tests: true }))
  }

  // Download CSV template
  const downloadCSVTemplate = () => {
    const template = [
      {
        question_text: "What does a red traffic light mean?",
        option_a: "Stop",
        option_b: "Go",
        option_c: "Caution",
        correct_answer: "option_a",
        category: "ROAD_SIGNS",
        explanation: "Red means stop at all times"
      },
      {
        question_text: "When should you use your turn signals?",
        option_a: "Only when turning",
        option_b: "When changing lanes or turning",
        option_c: "Only at night",
        correct_answer: "option_b",
        category: "TRAFFIC_LAWS",
        explanation: "Signals must be used for all lane changes and turns"
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'questions_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle image upload for question form
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      questionForm.setValue('image', file)
      setImagePreviews({ 0: URL.createObjectURL(file) })
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Tests List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Driving Tests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and manage driving tests for learners
            </p>
          </div>
          <Button onClick={() => openTestSheet()}>
            <Plus className="mr-2 h-4 w-4" />
            New Test
          </Button>
        </CardHeader>
        <CardContent>
          {loading.tests ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {test.name}
                      </div>
                    </TableCell>
                    <TableCell>{test.questions?.length || 0}</TableCell>
                    <TableCell>{test.passing_score}%</TableCell>
                    <TableCell>
                      <Badge variant={test.is_active ? "default" : "secondary"}>
                        {test.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            setCurrentTest(test)
                            setSheetOpen({...sheetOpen, viewTest: true})
                          }}>
                                                      <Eye className="h-4 w-4" />
                                                      Quick View
                          </DropdownMenuItem>
                  
                          <DropdownMenuItem onClick={() => openTestSheet(test)}>
                            <Edit className="h-4 w-4" color="blue" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this test?")) {
                                try {
                                  await pb.collection('tests').delete(test.id)
                                  setTests(tests.filter(t => t.id !== test.id))
                                  toast.success("Test deleted successfully")
                                } catch (error) {
                                  toast.error("Failed to delete test")
                                }
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" color="red" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Test Creation/Edit Sheet */}
      <Sheet open={sheetOpen.tests} onOpenChange={(open) => setSheetOpen({...sheetOpen, tests: open})} >
        <SheetContent className="w-screen sm:max-w-3/4 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {currentTest ? "Edit Test" : "Create New Test"}
            </SheetTitle>
          </SheetHeader>
          
          <form onSubmit={(e) => {
            console.log("Form submitted")
            e.preventDefault()

            onSubmitTest(testForm.getValues())
          }} className="space-y-6 p-4">
            {/* Display form errors */}
            {Object.keys(testForm.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm mb-4">
                Please fix the following errors:
                <ul className="list-disc pl-5">
                  {Object.entries(testForm.formState.errors).map(([key, error]) => (
                    <li key={key}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label>Test Name *</Label>
                <Input
                  {...testForm.register("name")}
                  placeholder="Road Signs Assessment"
                />
                {testForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{testForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...testForm.register("description")}
                  placeholder="Describe the purpose of this test..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Passing Score (%) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    {...testForm.register("passing_score", { valueAsNumber: true })}
                  />
                  {testForm.formState.errors.passing_score && (
                    <p className="text-sm text-destructive">{testForm.formState.errors.passing_score.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    {...testForm.register("time_limit", { valueAsNumber: true })}
                  />
                  {testForm.formState.errors.time_limit && (
                    <p className="text-sm text-destructive">{testForm.formState.errors.time_limit.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  id="test-active"
                  {...testForm.register("is_active")}
                />
                <Label htmlFor="test-active">Active Test</Label>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Test Questions *</Label>
                  <span className="text-sm text-muted-foreground">
                    Selected: {selectedQuestions.length}
                  </span>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSheetOpen({...sheetOpen, addQuestion: true})}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Question
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllFiltered}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Label htmlFor="batch-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Batch Upload
                        </Label>
                      </Button>
                      <Input
                        id="batch-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleBatchUpload}
                        className="hidden"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCSVTemplate}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Template
                    </Button>
                  </div>

                  {uploadStatus === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Upload Progress</Label>
                        <span className="text-sm text-muted-foreground">
                          {processedCount} / {totalQuestions} questions
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Search Questions</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Search questions..."
                        value={questionFilters.search}
                        onChange={e => setQuestionFilters({...questionFilters, search: e.target.value})}
                      />
                      <Select
                        value={questionFilters.category}
                        onValueChange={v => setQuestionFilters({...questionFilters, category: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="">All Categories</SelectItem> */}
                          <SelectItem value="ROAD_SIGNS">Road Signs</SelectItem>
                          <SelectItem value="TRAFFIC_LAWS">Traffic Laws</SelectItem>
                          <SelectItem value="SAFETY">Safety</SelectItem>
                          <SelectItem value="VEHICLE_CONTROL">Vehicle Control</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <ScrollArea className="h-64">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Question</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredQuestions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                No questions found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredQuestions.map(question => (
                              <TableRow 
                                key={question.id} 
                                className={`cursor-pointer ${selectedQuestions.includes(question.id) ? 'bg-green-200' : ''}`}
                                onClick={() => handleToggleQuestion(question.id)}
                              >
                                <TableCell>
                                  {/* <Checkbox
                                    checked={selectedQuestions.includes(question.id)}
                                    className="h-4 w-4 rounded"
                                  /> */}
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {question.image && (
                                      <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                                        <img
                                          src={pb.files.getURL(question, question.image)}
                                          alt="Question"
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                    )}
                                    <span className="line-clamp-1">{question.question_text}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={loading.tests}>
                {loading.tests ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Test"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Question Sheet */}
      <Sheet open={sheetOpen.addQuestion} onOpenChange={(open) => setSheetOpen({...sheetOpen, addQuestion: open})}>
        <SheetContent className="w-full sm:max-w-3/4 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Question</SheetTitle>
            <p className="text-sm text-muted-foreground">
              This question will be added to the current test
            </p>
          </SheetHeader>
          
          <form onSubmit={questionForm.handleSubmit(onSubmitQuestion)} className="space-y-6 p-4">
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                {...questionForm.register("question_text")}
                placeholder="What does this sign mean?"
              />
              {questionForm.formState.errors.question_text && (
                <p className="text-sm text-destructive">{questionForm.formState.errors.question_text.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Option A *</Label>
                <Input
                  {...questionForm.register("option_a")}
                  placeholder="Stop"
                />
                {questionForm.formState.errors.option_a && (
                  <p className="text-sm text-destructive">{questionForm.formState.errors.option_a.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Option B *</Label>
                <Input
                  {...questionForm.register("option_b")}
                  placeholder="Yield"
                />
                {questionForm.formState.errors.option_b && (
                  <p className="text-sm text-destructive">{questionForm.formState.errors.option_b.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Option C *</Label>
                <Input
                  {...questionForm.register("option_c")}
                  placeholder="Speed Limit"
                />
                {questionForm.formState.errors.option_c && (
                  <p className="text-sm text-destructive">{questionForm.formState.errors.option_c.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                <Select {...questionForm.register("correct_answer")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option_a">Option A</SelectItem>
                    <SelectItem value="option_b">Option B</SelectItem>
                    <SelectItem value="option_c">Option C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select {...questionForm.register("category")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROAD_SIGNS">Road Signs</SelectItem>
                    <SelectItem value="TRAFFIC_LAWS">Traffic Laws</SelectItem>
                    <SelectItem value="SAFETY">Safety</SelectItem>
                    <SelectItem value="VEHICLE_CONTROL">Vehicle Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <div className="flex items-center gap-3">
                <Label 
                  htmlFor="question-image-upload"
                  className="cursor-pointer"
                >
                                      <ImageIcon className="mr-2 h-4 w-4" />
                    {imagePreviews[0] ? "Change" : "Upload"}
                
                  <Input
                    id="question-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
                {imagePreviews[0] && (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                    <img
                      src={imagePreviews[0]}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-0 right-0 h-6 w-6 rounded-full bg-background/80 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation()
                        questionForm.setValue('image', null)
                        setImagePreviews({})
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <Textarea
                {...questionForm.register("explanation")}
                placeholder="Explain why this is the correct answer"
                rows={3}
              />
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={loading.questions}>
                {loading.questions ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Add Question"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* View Test Sheet */}
      <Sheet open={sheetOpen.viewTest} onOpenChange={(open) => setSheetOpen({...sheetOpen, viewTest: open})}>
        <SheetContent className="w-full sm:max-w-3/4 overflow-y-auto">
          {currentTest && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>{currentTest.name}</SheetTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={currentTest.is_active ? "default" : "secondary"}>
                    {currentTest.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Passing: {currentTest.passing_score}% • Time: {currentTest.time_limit} mins
                  </span>
                </div>
              </SheetHeader>
              <div className="py-6 p-4 space-y-6">
                {currentTest.description && (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <p className="text-sm">{currentTest.description}</p>
                  </div>
                )}

                <div className="space-y-4 p-4">
                  <Label>Test Questions ({currentTest.questions?.length || 0})</Label>
                  <div className="border rounded-lg divide-y">
                    {currentTest.expand?.questions?.length > 0 ? (
                      currentTest.expand.questions.map((question, index) => (
                        <div key={question.id} className="p-4">
                          <div className="flex items-start gap-4">
                            
                            <div className="flex-1">
                              <p className="font-medium">
                                {index + 1}. {question.question_text}
                              </p>
                              <div className="mt-3 space-y-2">
                                <div className={`p-2 rounded ${question.correct_answer === 'option_a' ? 'bg-green-50 border border-green-100' : 'bg-muted/50'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${question.correct_answer === 'option_a' ? 'text-green-600' : ''}`}>A.</span>
                                    <span>{question.option_a}</span>
                                  </div>
                                </div>
                                <div className={`p-2 rounded ${question.correct_answer === 'option_b' ? 'bg-green-50 border border-green-100' : 'bg-muted/50'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${question.correct_answer === 'option_b' ? 'text-green-600' : ''}`}>B.</span>
                                    <span>{question.option_b}</span>
                                  </div>
                                </div>
                                <div className={`p-2 rounded ${question.correct_answer === 'option_c' ? 'bg-green-50 border border-green-100' : 'bg-muted/50'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${question.correct_answer === 'option_c' ? 'text-green-600' : ''}`}>C.</span>
                                    <span>{question.option_c}</span>
                                  </div>
                                </div>
                              </div>
                              {question.explanation && (
                                <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                                  <Label>Explanation</Label>
                                  <p className="mt-1">{question.explanation}</p>
                                </div>
                              )}
                            </div>
                            {question.image && (
                              <div className="relative w-50 h-50 rounded-md overflow-hidden border flex-shrink-0">
                                <img
                                  src={pb.files.getURL(question, question.image)}
                                  alt="Question"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-muted-foreground">
                        No questions in this test
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Close</Button>
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}