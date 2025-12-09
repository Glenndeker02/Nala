
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useToast } from '@/components/ui/use-toast';

interface Question {
    id: string;
    text: string;
    type: string;
    options: string[];
}

interface TheoryExamProps {
    onPass: () => void;
}

export default function TheoryExam({ onPass }: TheoryExamProps) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [result, setResult] = useState<{ passed: boolean; score: number; results: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questions.length > 0 && !result) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [questions, result]);

    const fetchQuestions = async () => {
        try {
            console.log('[THEORY_EXAM] Fetching questions...');

            // Get token from localStorage
            const token = localStorage.getItem('token');
            console.log('[THEORY_EXAM] Token from localStorage:', token ? 'present' : 'missing');

            if (!token) {
                setError('You must be logged in to take the exam.');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/certification/questions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('[THEORY_EXAM] Response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[THEORY_EXAM] Error response:', errorText);
                throw new Error('Failed to fetch questions');
            }

            const data = await res.json();
            console.log('[THEORY_EXAM] Received data:', data);

            // Check if data has the success wrapper
            const questions = data.success ? data.data : data;
            console.log('[THEORY_EXAM] Questions array:', questions);

            if (!questions || questions.length === 0) {
                setError('No exam questions available. Please contact support.');
                return;
            }
            setQuestions(questions);
        } catch (err) {
            console.error('[THEORY_EXAM] Fetch error:', err);
            setError('Could not load exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questions[currentQuestionIndex].id]: value,
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/certification/submit-theory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers }),
            });

            if (res.status === 403) {
                const msg = await res.text();
                setError(msg);
                return;
            }

            if (!res.ok) throw new Error('Submission failed');

            const data = await res.json();
            setResult(data);
            if (data.passed) {
                toast({
                    title: "Congratulations!",
                    description: "You passed the exam.",
                });
                setTimeout(onPass, 2000);
            } else {
                toast({
                    title: "Exam Failed",
                    description: "You did not pass. Please review the material and try again.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            setError('Failed to submit exam. Please try again.');
            toast({
                title: "Error",
                description: "Failed to submit exam. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return (
        <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center text-red-600">
                <AlertTriangle className="mx-auto mb-2" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
        </Card>
    );

    if (result) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className={result.passed ? "text-green-600" : "text-red-600"}>
                        {result.passed ? "Exam Passed!" : "Exam Failed"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <div className="text-4xl font-bold mb-2">{result.score.toFixed(1)}%</div>
                        <p className="text-gray-500 mb-6">Passing score: 85%</p>

                        {!result.passed && (
                            <div className="text-left bg-gray-50 p-4 rounded-md">
                                <h4 className="font-semibold mb-2">Breakdown:</h4>
                                <ul className="space-y-2 text-sm">
                                    {result.results.map((r: any, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            {r.isCorrect ? (
                                                <span className="text-green-500">✓</span>
                                            ) : (
                                                <span className="text-red-500">✗</span>
                                            )}
                                            <span>Question {i + 1}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    {!result.passed && <Button onClick={() => window.location.reload()}>Retake Exam</Button>}
                </CardFooter>
            </Card>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="py-6">
                <h3 className="text-lg font-medium mb-6">{currentQ.text}</h3>

                <RadioGroup
                    value={answers[currentQ.id] || ''}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                >
                    {currentQ.options.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value={opt} id={`opt-${i}`} />
                            <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        disabled={!answers[currentQ.id]}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < questions.length}
                    >
                        {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Submit Exam
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
