"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, BookOpen, Clock, Award, Calendar, ChevronLeft, Pencil, X, Save, Phone } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    national_id: '',
    phone_number: '',
    gender: '',
    address: '',
    license_class: '',
    date_of_birth: ''
  })

  const fields = [
    { label: "National ID", name: "national_id" },
    { label: "Phone Number", name: "phone_number" },
    { label: "Gender", name: "gender" },
    { label: "Address", name: "address" },
    { label: "License Class", name: "license_class" },
    { label: "Date of Birth", name: "date_of_birth" },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const currentUser = pb.authStore.model
        if (!currentUser) {
          router.push('/auth/student/sign-in')
          return
        }

        const userData = await pb.collection('students').getOne(currentUser.id)
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          national_id: userData.national_id || '',
          phone_number: userData.phone_number || '',
          gender: userData.gender || '',
          address: userData.address || '',
          license_class: userData.license_class || '',
          date_of_birth: userData.date_of_birth || ''
        })

      } catch (err) {
        console.error('Error loading user data:', err)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const updated = await pb.collection('students').update(user.id, formData)
      setUser(updated)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <Button className="mt-4" onClick={() => router.push('/student')}>
            Back to Dashboard
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-center">{user.name}</CardTitle>
              <CardDescription className="text-center">{user.email}</CardDescription>
              <Badge variant="outline" className="mt-2">
                {user.license_class || 'No License Class'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.created).toLocaleDateString()}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-6"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing ? "Update your profile details" : "Your personal information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fields.map(({ label, name }) => (
                  <div key={name} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label htmlFor={name} className="text-gray-700 font-medium">
                      {label}
                    </Label>
                    {isEditing ? (
                      <Input
                        id={name}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleInputChange}
                        className="col-span-2"
                      />
                    ) : (
                      <p className="col-span-2 text-gray-800 px-3 py-2 bg-gray-50 rounded">
                        {user[name] || "—"}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex justify-end space-x-3 pt-6">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveProfile} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false)
                          setFormData(user)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.test_history?.length || 0}</div>
                <Progress 
                  value={(user.passed_tests || 0 / user.test_history?.length || 1) * 100} 
                  className="h-2 mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {user.passed_tests || 0} passed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((user.total_study_hours || 0) / 60)}h {(user.total_study_hours || 0) % 60}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}