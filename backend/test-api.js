// test-api.js
// Script para verificar si la API local está activa y funcional

const fetch = require('node-fetch');

async function testApi() {
  try {
    // Probar endpoint de modelos
    const modelsRes = await fetch('http://localhost:3000/api/models');
    const modelsData = await modelsRes.json();
    console.log('Respuesta de /api/models:', modelsData);

    // Probar endpoint principal
    const perplexityRes = await fetch('http://localhost:3000/api/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '¿API funcional?' }],
      }),
    });
    const perplexityData = await perplexityRes.json();
    console.log('Respuesta de /api/perplexity:', perplexityData);
  } catch (err) {
    console.error('Error al probar la API:', err);
  }
}

// Ejecutar la prueba
if (require.main === module) {
  testApi();
}
