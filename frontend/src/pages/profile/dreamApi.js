import api from '../../api/apiClient.js';

export async function saveDream({ date, text, feelings, interpretation }) {
  // feelings debe ser string, nunca undefined
  const safeFeelings = typeof feelings === 'string' ? feelings : (Array.isArray(feelings) ? feelings.join(',') : '');
  const res = await api.post('/dreams', { date, text, feelings: safeFeelings, interpretation });
  return res.data.dream;
}
