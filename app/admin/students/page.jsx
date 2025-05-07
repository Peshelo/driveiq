"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import pb from "@/lib/connection"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Filter, Search, Pencil, Trash2, MoreVertical, User } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"

// Zimbabwe National ID validation (format: 00-000000X00)
const zimbabweIdRegex = /^\d{8}[A-Z]\d{2}$/



export default function ManageStudents() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    national_id: z.string().regex(zimbabweIdRegex, "Invalid Zimbabwean ID format (e.g. 00000000X00)"),
    date_of_birth: z.date({
      required_error: "Date of birth is required",
    }),
    license_class: z.string().min(1, "License class is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    is_active: z.boolean().default(true),
    gender: z.string().min(1, "Gender is required"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    passwordConfirm: z.string().min(8, "Password must be at least 8 characters").optional(),
    avatar: z.instanceof(File).optional(),
  }).refine((data) => {
    if (!editMode) {
      return data.password === data.passwordConfirm
    }
    return true
  }, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  })
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byLicenseClass: {}
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      national_id: "",
      license_class: "",
      address: "",
      is_active: true,
      gender: "",
      password: "",
      passwordConfirm: "",
      avatar: undefined,
    },
  })

  const licenseClasses = [
    "Class 1 (Motorcycles)",
    "Class 2 (Light Vehicles)",
    "Class 3 (Heavy Vehicles)",
    "Class 4 (Passenger Vehicles)"
  ]

  const genders = [
    "MALE",
    "FEMALE"
  ]

  async function onSubmit(values) {
    try {
      const formData = new FormData()
      
      // Append all fields to formData
      Object.keys(values).forEach(key => {
        if (key === 'date_of_birth') {
          formData.append(key, format(values[key], 'yyyy-MM-dd'))
        } else if (key === 'avatar' && values[key]) {
          formData.append(key, values[key])
        } else if (key !== 'avatar' && values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })
      
      formData.append('emailVisibility', 'true')
      formData.append('role', 'STUDENT')
      formData.append("driving_school", pb.authStore.record.id);


      if (editMode && currentStudent) {
        // Update existing student - don't update password if not changed
        if (!values.password) {
          formData.delete('password')
          formData.delete('passwordConfirm')
        }
        await pb.collection('students').update(currentStudent.id, formData)
        toast.success("Student updated successfully")
      } else {
        // Create new student
        await pb.collection('students').create(formData)
        toast.success("Student created successfully")
      }

      fetchStudents()
      form.reset()
      setOpen(false)
      setEditMode(false)
      setCurrentStudent(null)
      setAvatarPreview("")
    } catch (error) {
      toast.error(error.message || "An error occurred")
      console.error(error)
    }
  }

  async function fetchStudents() {
    setLoading(true)
    try {
      const records = await pb.collection('students').getFullList({
        sort: '-created',
        expand: 'avatar',
      })
      setStudents(records)
      
      // Calculate stats
      const activeCount = records.filter(s => s.is_active).length
      const inactiveCount = records.length - activeCount
      
      const byLicenseClass = {}
      records.forEach(student => {
        const license = student.license_class || 'Unassigned'
        byLicenseClass[license] = (byLicenseClass[license] || 0) + 1
      })
      
      setStats({
        total: records.length,
        active: activeCount,
        inactive: inactiveCount,
        byLicenseClass
      })
    } catch (error) {
      toast.error("Failed to fetch students")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(student) {
    setEditMode(true)
    setCurrentStudent(student)
    setOpen(true)
    
    // Convert the student data to match the form structure
    const formValues = {
      ...student,
      date_of_birth: new Date(student.date_of_birth),
      password: "",
      passwordConfirm: "",
      avatar: undefined,
    }
    
    form.reset(formValues)
    
    // Set avatar preview if exists
    if (student.avatar) {
      setAvatarPreview(pb.getFileUrl(student, student.avatar))
    }
  }

  async function handleDelete(id) {
    try {
      await pb.collection('students').delete(id)
      toast.success("Student deleted successfully")
      fetchStudents()
    } catch (error) {
      toast.error("Failed to delete student")
      console.error(error)
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (file) {
      form.setValue('avatar', file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  function handleViewStudent(student) {
    setSelectedStudent(student)
    setDrawerOpen(true)
  }

  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === "all" || 
                         (filter === "active" && student.is_active) || 
                         (filter === "inactive" && !student.is_active)
    
    const matchesSearch = searchTerm === "" || 
                         student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.national_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phone_number.includes(searchTerm)
    
    return matchesFilter && matchesSearch
  })

  useEffect(() => {
    fetchStudents();
    pb.realtime.subscribe("students", (e) => {
      if (e.action === "insert") {
        setStudents((prev) => [e.record, ...prev])
      } else if (e.action === "update") {
        setStudents((prev) => prev.map((student) => student.id === e.record.id ? e.record : student))
      } else if (e.action === "delete") {
        setStudents((prev) => prev.filter((student) => student.id !== e.record.id))
      }
    }
  )
  }, [])  

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Badge variant="default" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Currently inactive students
            </p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Classes</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.byLicenseClass).map(([license, count]) => (
                <div key={license} className="flex items-center justify-between">
                  <span className="text-sm">{license}</span>
                  <div className="w-1/2 flex items-center gap-2">
                    <Progress value={(count / stats.total) * 100} className="h-2" />
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditMode(false)
            setCurrentStudent(null)
            setAvatarPreview("")
            form.reset()
          }
          setOpen(isOpen)
        }}>
          <DialogTrigger asChild>
            <Button>Add New Student</Button>
          </DialogTrigger>
          <DialogContent className="overflow-y-auto h-4/5">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Student" : "Register New Student"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="national_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID</FormLabel>
                        <FormControl>
                          <Input placeholder="00000000X00" {...field} />
                        </FormControl>
                        {/* <FormDescription>
                          Zimbabwean format (e.g. 00-000000X00)
                        </FormDescription> */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="student@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0771234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!editMode && (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="license_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a license class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {licenseClasses.map((license) => (
                              <SelectItem key={license} value={license}>
                                {license}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genders.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Harare" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 md:col-span-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Active Student
                          </FormLabel>
                          <FormDescription>
                            Uncheck to mark as inactive
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormItem className="md:col-span-2">
                    <FormLabel>Profile Photo</FormLabel>
                    <div className="flex items-center gap-4">
                      {avatarPreview ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No photo</span>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="max-w-xs"
                      />
                    </div>
                  </FormItem>
                </div>
                <Button type="submit" className="w-full">
                  {editMode ? "Update Student" : "Register Student"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Student Records</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={filter === "all"}
                  onCheckedChange={() => setFilter("all")}
                >
                  All Students
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filter === "active"}
                  onCheckedChange={() => setFilter("active")}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filter === "inactive"}
                  onCheckedChange={() => setFilter("inactive")}
                >
                  Inactive
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>National ID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>License Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.avatar ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={pb.getFileUrl(student, student.avatar)}
                            alt={student.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.national_id}</TableCell>
                    <TableCell>{student.gender || '-'}</TableCell>
                    <TableCell>
                      {student.license_class || (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(student.created), "PP")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(student)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          {selectedStudent && (
            <>
              <DrawerHeader className="text-left">
                <DrawerTitle>Student Details</DrawerTitle>
                <DrawerDescription>
                  View and manage student information
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-6">
                <div className="flex items-center gap-4">
                  {selectedStudent.avatar ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden">
                      <img
                        src={pb.getFileUrl(selectedStudent, selectedStudent.avatar)}
                        alt={selectedStudent.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                    <Badge variant={selectedStudent.is_active ? "default" : "secondary"}>
                      {selectedStudent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">National ID</h3>
                    <p>{selectedStudent.national_id}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                    <p>{selectedStudent.gender || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{selectedStudent.email}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p>{selectedStudent.phone_number}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                    <p>{format(new Date(selectedStudent.date_of_birth), "PPP")}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">License Class</h3>
                    <p>{selectedStudent.license_class || 'Not assigned'}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p>{selectedStudent.address}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Date Registered</h3>
                    <p>{format(new Date(selectedStudent.created), "PPP")}</p>
                  </div>
                </div>
              </div>
              <DrawerFooter className="pt-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleEdit(selectedStudent)}
                  >
                    Edit Student
                  </Button>
                  <Button onClick={() => router.push(`/student/${selectedStudent.id}`)}>
                    View Full Profile
                  </Button>
                </div>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}