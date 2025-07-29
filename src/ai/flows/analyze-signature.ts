
'use server';
/**
 * @fileOverview Un agente de IA para analizar la legibilidad de una firma.
 *
 * - analyzeSignature - Una función que determina si una firma es legible o un simple garabato.
 * - AnalyzeSignatureInput - El tipo de entrada para la función analyzeSignature.
 * - AnalyzeSignatureOutput - El tipo de retorno para la función analyzeSignature.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeSignatureInputSchema = z.object({
  signatureDataUri: z
    .string()
    .describe(
      "Una imagen de una firma, como un data URI que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeSignatureInput = z.infer<typeof AnalyzeSignatureInputSchema>;

const AnalyzeSignatureOutputSchema = z.object({
  isLegible: z.boolean().describe('Si la firma es o no un intento legítimo de firma.'),
  reason: z.string().describe('La razón por la cual la firma se considera legible o no. Por ejemplo: "Parece una firma real", "Es solo una línea recta", "Es un garabato simple".'),
});
export type AnalyzeSignatureOutput = z.infer<typeof AnalyzeSignatureOutputSchema>;


export async function analyzeSignature(input: AnalyzeSignatureInput): Promise<AnalyzeSignatureOutput> {
  return analyzeSignatureFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeSignaturePrompt',
  input: { schema: AnalyzeSignatureInputSchema },
  output: { schema: AnalyzeSignatureOutputSchema },
  prompt: `Eres un experto en análisis de documentos y tu tarea es determinar si la imagen proporcionada es una firma real o un simple garabato sin sentido.

Analiza la imagen de la firma y determina si parece un intento genuino de escribir un nombre/firma o si es algo como una línea, una 'X', un círculo, un emoji o un garabato muy simple.

- Si parece una firma real (incluso si es estilizada o difícil de leer), establece isLegible en true.
- Si es claramente un garabato de baja complejidad, una forma geométrica simple, o un dibujo, establece isLegible en false.

Proporciona una razón concisa para tu decisión en el campo 'reason'.

Firma: {{media url=signatureDataUri}}`,
});

const analyzeSignatureFlow = ai.defineFlow(
  {
    name: 'analyzeSignatureFlow',
    inputSchema: AnalyzeSignatureInputSchema,
    outputSchema: AnalyzeSignatureOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
