import { request } from '../utlis/helper/axiosConfig';

export const reportService = {
  generateReport: async (payload: any, token: string, signal?: AbortSignal) => {
    try {
      const res = await request({
        url: '/report/generate',
        method: 'POST',
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
         signal, 
      });

      if (res.status === 200 && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return {
          success: true,
          content: res.data.data[0].content,
        };
      }

      return { success: false, message: 'Unexpected response from server' };
    } catch (err: any) {
      console.error('❌ Report generation error:', err?.response?.data || err.message);
      throw err;
    }
  },
};
