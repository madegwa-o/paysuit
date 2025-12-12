"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Zap,
    Timer,
    CheckCircle2,
    XCircle,
    Trophy,
    Share2,
    RotateCcw,
    Sparkles,
    Wallet,
} from "lucide-react"
import Link from "next/link"
import {GlobeToMapTransform} from "@/components/globe2map";

// Fintech-focused question database
const questionDatabase: Question[] = [
    {
        type: "payments",
        question: "Which payment method can process the fastest?",
        options: ["M-Pesa STK Push", "Bank Transfer", "Credit Card", "Jenga API"],
        correct: 0,
    },
    {
        type: "payments",
        question: "What does API stand for?",
        options: [
            "Application Process Interface",
            "Application Programming Interface",
            "Advanced Payment Infrastructure",
            "Automated Process Integration",
        ],
        correct: 1,
    },
    {
        type: "fintech",
        question: "Which integration supports B2C payments?",
        options: ["M-Pesa", "Jenga", "Buni", "All of the above"],
        correct: 3,
    },
    {
        type: "fintech",
        question: "What's the primary benefit of using PayFlow's API?",
        options: ["Faster processing", "Multiple payment methods", "Unified integration", "All benefits"],
        correct: 3,
    },
    {
        type: "payments",
        question: "M-Pesa STK Push is used for:",
        options: ["Sending money", "Requesting payment", "Checking balance", "Transaction history"],
        correct: 1,
    },

    {
        type: "fintech",
        question: "Which framework is best for payment processing?",
        options: ["React", "Vue", "All work equally", "Framework doesn't matter"],
        correct: 3,
    },
    {
        type: "payments",
        question: "What does B2B stand for?",
        options: ["Bank to Business", "Business to Business", "Business to Bank", "Between Business"],
        correct: 1,
    },
    {
        type: "payments",
        question: "Credit card processing typically takes:",
        options: ["Instant", "1-3 seconds", "30 minutes", "24 hours"],
        correct: 1,
    },
    {
        type: "fintech",
        question: "How many payment methods does PayFlow support?",
        options: ["2", "3", "5+", "10+"],
        correct: 3,
    },
    {
        type: "payments",
        question: "B2C payments are used for:",
        options: ["Business to business", "Individual transfers", "Merchant payouts", "All merchant payments"],
        correct: 2,
    },

    {
        type: "fintech",
        question: "Which language is most used for fintech?",
        options: ["JavaScript", "Python", "Go", "All equally popular"],
        correct: 3,
    },
    {
        type: "payments",
        question: "Transaction security is ensured through:",
        options: ["Encryption", "Authentication", "PCI compliance", "All methods"],
        correct: 3,
    },
    {
        type: "fintech",
        question: "The highest transaction volume occurs at:",
        options: ["Morning", "Afternoon", "Evening", "Varies by region"],
        correct: 3,
    },
    {
        type: "payments",
        question: "Webhook notifications are used for:",
        options: ["Payment confirmation", "Error handling", "Transaction tracking", "All of above"],
        correct: 3,
    },
    {
        type: "fintech",
        question: "PayFlow's uptime guarantee is:",
        options: ["95%", "99%", "99.9%", "99.99%"],
        correct: 3,
    },
]

type GameState = "welcome" | "playing" | "results"
type QuestionType = "payments" | "fintech"

interface Question {
    type: QuestionType
    question: string
    options: string[]
    correct: number
}

interface GameStats {
    correctAnswers: number
    totalQuestions: number
    score: number
    percentile: number
    tier: string
    tierEmoji: string
}

const performanceTiers = [
    { min: 90, tier: "Payment Master", emoji: "👑", tagline: "You're a fintech expert!" },
    { min: 75, tier: "Payment Pro", emoji: "⚡", tagline: "You know your payments!" },
    { min: 60, tier: "Payment Ready", emoji: "🚀", tagline: "You're ready to integrate!" },
    { min: 45, tier: "Payment Learner", emoji: "📚", tagline: "Keep learning about payments!" },
    { min: 0, tier: "Payment Curious", emoji: "🤔", tagline: "Start your payment journey!" },
]

const getPerformanceTier = (percentage: number) => {
    return performanceTiers.find((tier) => percentage >= tier.min) || performanceTiers[performanceTiers.length - 1]
}

export default function FintechQuizGame() {
    const [gameState, setGameState] = useState<GameState>("welcome")
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [questions, setQuestions] = useState<Question[]>([])
    const [timeLeft, setTimeLeft] = useState(8)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [gameStats, setGameStats] = useState<GameStats | null>(null)

    const initializeGame = useCallback(() => {
        const shuffled = [...questionDatabase].sort(() => Math.random() - 0.5)
        setQuestions(shuffled.slice(0, 15))
        setCurrentQuestionIndex(0)
        setCorrectAnswers(0)
        setTimeLeft(8)
        setSelectedAnswer(null)
        setShowFeedback(false)
    }, [])

    const finishGame = useCallback(() => {
        const percentage = Math.round((correctAnswers / 15) * 100)
        const percentile = Math.min(95, Math.max(5, percentage))
        const tier = getPerformanceTier(percentage)

        setGameStats({
            correctAnswers,
            totalQuestions: 15,
            score: percentage,
            percentile,
            tier: tier.tier,
            tierEmoji: tier.emoji,
        })
        setGameState("results")
    }, [correctAnswers])

    const handleAnswer = useCallback((answerIndex: number) => {
        if (showFeedback) return

        setSelectedAnswer(answerIndex)
        setShowFeedback(true)

        const isCorrect = answerIndex === questions[currentQuestionIndex].correct
        if (isCorrect) {
            setCorrectAnswers((prev) => prev + 1)
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1)
                setTimeLeft(8)
                setSelectedAnswer(null)
                setShowFeedback(false)
            } else {
                finishGame()
            }
        }, 1000)
    }, [showFeedback, questions, currentQuestionIndex, finishGame])

    useEffect(() => {
        if (gameState === "playing" && timeLeft > 0 && !showFeedback) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else if (timeLeft === 0 && !showFeedback) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleAnswer(-1)
        }
    }, [gameState, timeLeft, showFeedback, handleAnswer])

    const startGame = () => {
        initializeGame()
        setGameState("playing")
    }

    const restartGame = () => {
        setGameState("welcome")
        setGameStats(null)
    }

    const shareScore = () => {
        if (!gameStats) return
        const tier = getPerformanceTier(gameStats.score)
        const text = `I scored ${gameStats.score}% on Paysuit's fintech quiz! 🎯\n\n${tier.tier} • ${tier.tagline}\n\nCan you beat my score? Try Paysuit's payment integrations.`

        if (navigator.share) {
            navigator.share({
                title: "Paysuit Fintech Quiz Results",
                text,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(text)
            alert("Score copied to clipboard!")
        }
    }


    if (gameState === "welcome") {
        return (
            <section className="relative min-h-screen py-20 px-4 overflow-hidden flex items-center">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-slate-400/5 to-slate-500/5 rounded-full blur-3xl opacity-40" />
                    <div className="absolute -top-32 left-1/3 w-96 h-96 bg-gradient-to-br from-slate-300/5 to-slate-400/5 rounded-full blur-3xl opacity-30" />
                </div>

                <div className="max-w-6xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="inline-block mb-4 px-3 py-1 bg-muted rounded-full border border-border/50">
                                <p className="text-xs text-muted-foreground font-medium">New: M-Pesa STK Push now available</p>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
                                <span className="text-foreground">  It Pays</span>
                                <br />
                                <span className="text-foreground"> To Be Here.</span>
                                <br />
                                <span className="bg-gradient-to-r from-green-600 to-green-400 dark:from-green-600 dark:to-green-200 bg-clip-text text-transparent">
                                    Paysuit
                                  </span>
                                <br />
                                <span className="text-foreground">Fintech</span>
                            </h1>

                            <p className="text-lg text-foreground/70 mb-8 max-w-xl leading-relaxed">Learn how we measure your M-pesa Familiarity by taking our test.</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={startGame}
                                    size="lg"
                                    className="bg-foreground text-background hover:bg-foreground/90 text-base h-12 px-8"
                                >
                                    Start Quiz →
                                </Button>

                                <Link href="/docs">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="text-base h-12 px-8 border-border/50 hover:bg-muted bg-transparent"
                                    >
                                        View Docs
                                    </Button>
                                </Link>
                            </div>


                        </div>

                        <GlobeToMapTransform />
                    </div>
                </div>
            </section>
        )
    }

    if (gameState === "playing") {
        const currentQuestion = questions[currentQuestionIndex]
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100

        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 py-20">
                <div className="w-full max-w-lg">
                    <Card className="bg-card rounded-3xl shadow-xl p-6 border border-border">
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-muted-foreground" />
                                    <div className={`text-3xl font-black ${timeLeft <= 2 ? "text-red-500" : "text-foreground"}`}>
                                        {timeLeft}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full bg-muted rounded-full h-2 mb-6">
                                <div
                                    className="bg-slate-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <div className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                {currentQuestion.type}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground leading-tight">{currentQuestion.question}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {currentQuestion.options.map((option, index) => {
                                let buttonClass = "w-full p-4 text-left font-medium rounded-2xl transition-all duration-200 border-2 "
                                let icon = null

                                if (showFeedback) {
                                    if (index === currentQuestion.correct) {
                                        buttonClass +=
                                            "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                                        icon = <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-600 dark:text-emerald-400" />
                                    } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                                        buttonClass +=
                                            "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
                                        icon = <XCircle className="w-5 h-5 ml-auto text-red-600 dark:text-red-400" />
                                    } else {
                                        buttonClass += "bg-muted text-muted-foreground border-border"
                                    }
                                } else {
                                    buttonClass +=
                                        "bg-card hover:bg-muted text-foreground border-border hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer"
                                }

                                return (
                                    <Button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={showFeedback}
                                        className={buttonClass}
                                    >
                                        <span className="font-bold mr-3 text-muted-foreground">{String.fromCharCode(65 + index)}.</span>
                                        <span className="text-base flex-1">{option}</span>
                                        {icon}
                                    </Button>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    if (gameState === "results") {
        if (!gameStats) return null

        const tier = getPerformanceTier(gameStats.score)

        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 py-20">
                <div className="w-full max-w-lg">
                    <Card className="bg-card rounded-3xl shadow-xl p-8 border border-border relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 w-8 h-8 text-slate-400 animate-pulse" />
                        <Trophy className="absolute top-8 left-4 w-7 h-7 text-slate-500 animate-bounce" />
                        <Wallet className="absolute bottom-6 right-8 w-6 h-6 text-slate-400 animate-pulse" />
                        <Zap className="absolute bottom-4 left-6 w-7 h-7 text-slate-500 animate-bounce" />

                        <div className="text-center mb-8 relative z-10">
                            <div className="text-6xl mb-4 animate-pulse">{tier.emoji}</div>
                            <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 dark:from-slate-300 dark:via-slate-400 dark:to-slate-500 text-transparent bg-clip-text">
                                <h1 className="text-4xl font-black mb-2">YOU&#39;RE A</h1>
                                <h2 className="text-3xl font-black uppercase tracking-wide">{tier.tier}!</h2>
                            </div>
                            <p className="text-lg font-medium text-muted-foreground mt-2">{tier.tagline}</p>
                        </div>

                        <div className="text-center mb-8 relative z-10">
                            <div className="text-5xl font-black text-foreground mb-2">{gameStats.score}%</div>
                            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">SCORE</div>
                            <div className="text-sm text-muted-foreground mt-2">
                                {gameStats.correctAnswers}/15 correct • Top {gameStats.percentile}%
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <Button
                                onClick={shareScore}
                                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-400 dark:to-slate-500 text-white dark:text-slate-900 py-4 text-lg font-bold rounded-2xl hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-500 dark:hover:to-slate-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                                <Share2 className="w-5 h-5 mr-2" />
                                Share My Score
                            </Button>

                            <Button
                                onClick={restartGame}
                                className="w-full bg-card text-foreground py-4 text-lg font-medium rounded-2xl border-2 border-border hover:bg-muted hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Try Again
                            </Button>

                            <Link href="/docs" className="block">
                                <Button className="w-full bg-muted text-foreground py-4 text-lg font-medium rounded-2xl border border-border hover:bg-muted/80 transition-all duration-200">
                                    Get Started with Integrations
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    return null
}
