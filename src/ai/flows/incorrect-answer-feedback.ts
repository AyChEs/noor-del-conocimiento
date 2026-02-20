'use server';

/**
 * @fileOverview A flow that generates a supportive one-sentence explanation when a trivia question is answered incorrectly.
 *
 * - incorrectAnswerFeedback - A function that generates the feedback.
 * - IncorrectAnswerFeedbackInput - The input type for the incorrectAnswerFeedback function.
 * - IncorrectAnswerFeedbackOutput - The return type for the incorrectAnswerFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IncorrectAnswerFeedbackInputSchema = z.object({
  question: z.string().describe('The trivia question that was answered incorrectly.'),
  correctAnswer: z.string().describe('The correct answer to the trivia question.'),
  userAnswer: z.string().describe('The answer provided by the user.'),
  language: z.string().describe('The language in which the explanation should be generated (e.g., "es", "en", "ma").'),
});
export type IncorrectAnswerFeedbackInput = z.infer<typeof IncorrectAnswerFeedbackInputSchema>;

const IncorrectAnswerFeedbackOutputSchema = z.object({
  explanation: z.string().describe('A supportive, educational explanation of the correct answer and context (approx 2 sentences).'),
});
export type IncorrectAnswerFeedbackOutput = z.infer<typeof IncorrectAnswerFeedbackOutputSchema>;

export async function incorrectAnswerFeedback(input: IncorrectAnswerFeedbackInput): Promise<IncorrectAnswerFeedbackOutput> {
  return incorrectAnswerFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'incorrectAnswerFeedbackPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: IncorrectAnswerFeedbackInputSchema },
  output: { schema: IncorrectAnswerFeedbackOutputSchema },
  prompt: `You are an Islamic trivia teacher providing feedback for incorrect answers.
  Generate a brief, educational lesson (2-3 sentences max) explaining WHY the correct answer is correct and briefly contextualizing the user's mistake. Be understanding but focus on teaching. The response must be in the following language: {{{language}}}.

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
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error("Llamada a IA devolvió vacío");
      }
      return output;
    } catch (e: any) {
      console.error("Genkit Error in incorrectAnswerFeedbackFlow:", e.message || e);
      throw e;
    }
  }
);
