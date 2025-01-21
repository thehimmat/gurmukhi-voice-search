import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const DEBUG = true; // Toggle this for debugging

export const transliterate = async (
  text: string, 
  inputFormat: string, 
  outputFormat: string
): Promise<string> => {
  try {
    if (DEBUG) {
      console.log('Request:', {
        url: `${API_BASE_URL}/transliterate`,
        body: { text, inputFormat, outputFormat }
      });
    }

    const response = await axios.post(`${API_BASE_URL}/transliterate`, {
      text,
      inputFormat,
      outputFormat
    });
    
    if (DEBUG) {
      console.log('Response:', response.data);
    }

    if (response.data.result !== undefined) {
      return response.data.result;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    if (DEBUG) {
      console.error('Error details:', {
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        message: error instanceof Error ? error.message : String(error)
      });
    }

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        throw new Error(`Server error: ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        // No response received
        throw new Error('No response from server. Is the backend running?');
      }
    }
    // Other errors
    throw new Error('Failed to transliterate text: ' + (error as Error).message);
  }
}; 