"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Check, HelpCircle, X } from "lucide-react"

export interface LessonQuizQuestion {
  question: string
  options: string[]
  answer: string
  explanation?: string | null
}

interface LessonQuizProps {
  questions: LessonQuizQuestion[]
}

export function LessonQuiz({ questions }: LessonQuizProps) {
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)

  const score = useMemo(() => {
    if (!showResults) {
      return 0
    }
    return questions.reduce((total, question, index) => {
      const response = responses[index]
      return response && response === question.answer ? total + 1 : total
    }, 0)
  }, [questions, responses, showResults])

  if (!questions || questions.length === 0) {
    return null
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const resetQuiz = () => {
    setResponses({})
    setShowResults(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preguntas rápidas</CardTitle>
        <CardDescription>
          Refuerza los conceptos clave antes de continuar con la siguiente lección.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, questionIndex) => {
          return (
            <Card key={`${question.question}-${questionIndex}`} className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  {questionIndex + 1}. {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
                  value={responses[questionIndex] ?? ""}
                  onValueChange={(value) =>
                    setResponses((prev) => ({
                      ...prev,
                      [questionIndex]: value,
                    }))
                  }
                  disabled={showResults}
                >
                  {question.options.map((option) => {
                    const isAnswer = showResults && option === question.answer
                    const isSelected = responses[questionIndex] === option

                    return (
                      <Label
                        key={option}
                        htmlFor={`${questionIndex}-${option}`}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                          showResults
                            ? isAnswer
                              ? "border-green-500/60 bg-green-500/10"
                              : isSelected
                              ? "border-destructive/60 bg-destructive/10"
                              : "border-border"
                            : isSelected
                            ? "border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <RadioGroupItem id={`${questionIndex}-${option}`} value={option} />
                        <span className="flex-1 text-sm">{option}</span>
                        {showResults && (
                          <span className="flex items-center gap-1 text-xs">
                            {isAnswer ? (
                              <>
                                <Check className="h-3 w-3" />
                                Correcta
                              </>
                            ) : isSelected ? (
                              <>
                                <X className="h-3 w-3" />
                                Incorrecta
                              </>
                            ) : null}
                          </span>
                        )}
                      </Label>
                    )
                  })}
                </RadioGroup>

                {showResults && question.explanation && (
                  <p className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2 inline-flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      Explicación
                    </Badge>
                    {question.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {showResults ? (
          <>
            <span className="text-sm font-medium">
              Tu puntuación: {score} / {questions.length}
            </span>
            <Button variant="ghost" onClick={resetQuiz}>
              Reiniciar
            </Button>
          </>
        ) : (
          <Button onClick={handleSubmit} disabled={Object.keys(responses).length !== questions.length}>
            Comprobar respuestas
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}