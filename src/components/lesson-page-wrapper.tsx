"use client"

import { useState } from "react"
import { CourseSidebar } from "@/components/course-sidebar"
import { LessonPageClient } from "@/components/lesson-page-client"
import { ChatbotWidget } from "@/components/chatbot-widget"

interface LessonPageWrapperProps {
  courseId: string
  courseTitle: string
  lesson: any
  isLessonCompleted: boolean
  isCourseCompleted: boolean
  hasExistingReview: boolean
  userId: string
  previousLesson: { id: string; title: string } | null
  nextLesson: { id: string; title: string } | null
  modules: any[]
  progressPercentage: number
}

export function LessonPageWrapper(props: LessonPageWrapperProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        <CourseSidebar 
          courseId={props.courseId} 
          modules={props.modules} 
          progress={props.progressPercentage}
          onOpenChat={() => setChatOpen(true)}
        />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <LessonPageClient
            courseId={props.courseId}
            courseTitle={props.courseTitle}
            lesson={props.lesson}
            isLessonCompleted={props.isLessonCompleted}
            isCourseCompleted={props.isCourseCompleted}
            hasExistingReview={props.hasExistingReview}
            userId={props.userId}
            previousLesson={props.previousLesson}
            nextLesson={props.nextLesson}
          />
        </main>
      </div>
      
      {/* Chatbot móvil - Sheet controlado desde el header */}
      <div className="md:hidden">
        <ChatbotWidget 
          courseId={props.courseId} 
          courseName={props.courseTitle}
          isOpen={chatOpen}
          onOpenChange={setChatOpen}
          isMobile={true}
        />
      </div>
      
      {/* Chatbot desktop - botón flotante independiente */}
      <div className="hidden md:block">
        <ChatbotWidget 
          courseId={props.courseId} 
          courseName={props.courseTitle}
        />
      </div>
    </div>
  )
}
