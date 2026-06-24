// frontend/src/api/attemptService.ts
const BASE_URL = 'http://localhost:8080/api/v1';

export const reviewCodeAttempt = async (attemptId: string, codeSnapshot: string, token: string) => {
  const response = await fetch(`${BASE_URL}/attempts/${attemptId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ codeSnapshot })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to review code');
  }

  return response.json();
};