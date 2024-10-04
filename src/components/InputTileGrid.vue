import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const generateWFCOutput = async (inputGrid: any[], dim: number, tilePixelSize: number): Promise<any> => {
  const response = await axios.post(`${API_URL}/wfc/generate`, { inputGrid, dim, tilePixelSize });
  return response.data.result;
};