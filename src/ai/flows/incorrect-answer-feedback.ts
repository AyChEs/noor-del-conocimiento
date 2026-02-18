'use server';

/**
 * @fileOverview A flow that generates a supportive one-sentence explanation when a trivia question is answered incorrectly.
 *
 * - incorrectAnswerFeedback - A function that generates the feedback.
 * - IncorrectAnswerFeedbackInput - The input type for the incorrectAnswerFeedback function.
 * - IncorrectAnswerFeedbackOutput - The return type for the incorrectAnswerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncorrectAnswerFeedbackInputSchema = z.object({
  question: z.string().describe('The trivia question that was answered incorrectly.'),
  correctAnswer: z.string().describe('The correct answer to the trivia question.'),
  userAnswer: z.string().describe('The answer provided by the user.'),
  language: z.string().describe('The language in which the explanation should be generated (e.g., "es", "en", "ma").'),
});
export type IncorrectAnswerFeedbackInput = z.infer<typeof IncorrectAnswerFeedbackInputSchema>;

const IncorrectAnswerFeedbackOutputSchema = z.object({
  explanation: z.string().describe('A supportive, one-sentence explanation of the correct answer.'),
});
export type IncorrectAnswerFeedbackOutput = z.infer<typeof IncorrectAnswerFeedbackOutputSchema>;

export async function incorrectAnswerFeedback(input: IncorrectAnswerFeedbackInput): Promise<IncorrectAnswerFeedbackOutput> {
  return incorrectAnswerFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'incorrectAnswerFeedbackPrompt',
  input: {schema: IncorrectAnswerFeedbackInputSchema},
  output: {schema: IncorrectAnswerFeedbackOutputSchema},
  prompt: `You are an AI assistant that provides supportive feedback for incorrect trivia answers.
  Generate a concise, one-sentence explanation about the correct answer, being understanding and encouraging. The response must be in the following language: {{{language}}}.

  Question: {{{question}}}
  Correct Answer: {{{correctAnswer}}}
  User's Answer: {{{userAnswer}}}

  Explanation: `,
});

const incorrectAnswerFeedbackFlow = ai.defineFlow(
  {
    name: 'incorrectAnswerFeedbackFlow',
    inputSchema: IncorrectAnswerFeedbackInputSchema,
    outputSchema: IncorrectAnswerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
