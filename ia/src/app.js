import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const app = express();
app.use(express.json());

const REASON_LABELS = {
  wrong_size:       'Talla incorrecta',
  defective:        'Producto defectuoso',
  not_as_described: 'No coincide con descripción',
  other:            'Otro motivo',
};

app.post('/api/ia/analyze-alert', async (req, res) => {
  try {
    const { product } = req.body;

    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Datos del producto requeridos' });
    }

    const total = parseInt(product.total_returns) || 0;
    const wrongSize = parseInt(product.wrong_size) || 0;
    const defective = parseInt(product.defective) || 0;
    const notAsDescribed = parseInt(product.not_as_described) || 0;
    const other = parseInt(product.other) || 0;

    const reasonsBreakdown = [
      wrongSize > 0 && `- Talla incorrecta: ${wrongSize} casos (${Math.round(wrongSize/total*100)}%)`,
      defective > 0 && `- Producto defectuoso: ${defective} casos (${Math.round(defective/total*100)}%)`,
      notAsDescribed > 0 && `- No coincide con descripción: ${notAsDescribed} casos (${Math.round(notAsDescribed/total*100)}%)`,
      other > 0 && `- Otro motivo: ${other} casos (${Math.round(other/total*100)}%)`,
    ].filter(Boolean).join('\n');

    const dominantReason = [
      { key: 'wrong_size', count: wrongSize },
      { key: 'defective', count: defective },
      { key: 'not_as_described', count: notAsDescribed },
      { key: 'other', count: other },
    ].sort((a, b) => b.count - a.count)[0];

    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelKwargs: { response_format: { type: "json_object" } },
    });

    const systemPrompt = `Eres un experto consultor de e-commerce especializado en logística y gestión de devoluciones.
Tu tarea es generar un reporte rápido y altamente accionable para un vendedor sobre alertas de productos con demasiadas devoluciones.
Responde SIEMPRE en español de forma directa, empática y profesional.
DEBES devolver un objeto JSON estrictamente con la siguiente estructura y formato:
{
  "resumen": "string — 2 oraciones máximo resumiendo la urgencia y el problema principal",
  "causas": [
    { "titulo": "string", "descripcion": "string — 1-2 oraciones explicando la causa probable basada en los datos" }
  ],
  "recomendaciones": [
    { "prioridad": "alta|media|baja", "accion": "string — título corto de la acción", "detalle": "string — 1 oración explicando cómo ejecutarla" }
  ],
  "conclusion": "string — 1 oración alentadora para el vendedor"
}
Genera exactamente 2 causas probables y 3 recomendaciones (ordenadas por prioridad: alta, luego media, luego baja).`;

    const userPrompt = `Por favor, analiza los siguientes datos de devoluciones:

Producto: ${product.name} ${product.emoji_icon || ''}
Total de devoluciones (últimos 30 días): ${total}
Umbral superado: más de 5 devoluciones

Distribución de motivos:
${reasonsBreakdown}

El motivo predominante es "${REASON_LABELS[dominantReason.key]}" con ${dominantReason.count} casos.

Genera el análisis en el formato JSON indicado.`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    let report;
    try {
      report = JSON.parse(response.content.trim());
    } catch {
      return res.status(500).json({ success: false, error: 'Error al parsear respuesta del modelo' });
    }

    res.json({ success: true, data: report });
  } catch (err) {
    console.error('IA error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Error interno del servicio IA' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`IA service en http://localhost:${PORT}`));