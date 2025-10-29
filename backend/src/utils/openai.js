import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

export async function analyzeWithOpenAI(reportData) {
  let prompt = `Eres un analista financiero profesional. Genera un informe estadístico para Arcana Club siguiendo esta estructura:\n\n# Informe Estadístico Arcana Club\nPeriodo analizado: ${reportData.startDate} - ${reportData.endDate}\n\n## 1. Resumen General\n- Usuarios nuevos: ${reportData.users}\n- Usuarios totales: [calcular si posible]\n- Administradores: [calcular si posible]\n- Churn rate (bajas): ${reportData.churn}\n- Previsión de suscripciones: [estimar si posible]\n- Previsión de churn: [estimar si posible]\n\n## 2. Estadísticas de Gasto\n- Total de gastos: ${reportData.expenses}€\n- Detalle por categoría: [desglosar si hay datos]\n\n## 3. Estadísticas de Ingresos\n- Total de ingresos: ${reportData.income}€\n- Detalle por categoría: [desglosar si hay datos]\n\n## 4. Estadísticas de Tráfico Web\n- Visitas totales: [dato]\n- Usuarios únicos: [dato]\n- Páginas más visitadas: [lista]\n- Origen de tráfico: [dato]\n\n## 5. Estadísticas de Suscripciones y Bajas\n- Nuevas suscripciones: [dato]\n- Bajas: ${reportData.churn}\n- Motivos de baja: [lista si hay datos]\n\n## 6. Estadísticas de Lecturas de Post (Blog)\n- Total de lecturas: ${reportData.readings}\n- Posts más leídos: [lista]\n- Comentarios recibidos: [dato]\n\n## 7. Estadísticas de Ventas de Tienda\n- Ventas totales: [dato]\n- Productos más vendidos: [lista]\n- Ingresos por tienda: [dato]\n\n## 8. Estadísticas de Email (Brevo)\n${reportData.emailStats ? `- Emails transaccionales enviados: ${reportData.emailStats.totalEmails}\n- Emails abiertos: ${reportData.emailStats.openedEmails}\n- Emails no abiertos: ${reportData.emailStats.notOpened}\n- Tipo de email: ${reportData.emailStats.type}\n- Filtro usuario email: ${reportData.emailStats.filtroUsuario || 'N/A'}` : '- No hay datos de email.'}\n\n## 9. Estadísticas de Widgets y Modales Publicitarios\n- Impresiones de widgets: [dato]\n- Impresiones de modales: [dato]\n- Conversiones desde anuncios: [dato]\n\n## 10. Otras estadísticas relevantes\n- [Personalizar según nuevas métricas]\n\n## 11. Análisis y Conclusiones (IA)\nRedacta aquí un resumen profesional, destaca tendencias, riesgos, oportunidades y recomendaciones para el negocio.\n\n${reportData.filters && Object.keys(reportData.filters).length > 0 ? `Filtros aplicados: ${JSON.stringify(reportData.filters)}` : ''}\n${reportData.customPrompt && reportData.customPrompt.trim() ? `Personalización: ${reportData.customPrompt}` : ''}\n`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Eres un analista financiero profesional.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  });
  return completion.choices[0].message.content;
}
