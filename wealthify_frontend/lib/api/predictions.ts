import { supabase } from '../supabaseClient';

export const predictionsAPI = {
  generatePrediction: async (income: number) => {
    // Call backend endpoint for prediction
    const response = await fetch('/api/v1/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income })
    });
    if (!response.ok) throw new Error('Failed to generate prediction');
    return response.json();
  },
  getSixMonthForecast: async (income: number) => {
    // Call backend endpoint for forecast
    const response = await fetch('/api/v1/predictions/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income })
    });
    if (!response.ok) throw new Error('Failed to get forecast');
    return response.json();
  }
};

export default predictionsAPI;
