import { request } from '../utlis/helper/axiosConfig';

export const finalizeService = {
  finalizeReport: async (payload: any) => {
    try {
      const res = await request.post('/report/finalize', payload);
      return res.data;
    } catch (err: any) {
      console.error('❌ Finalize report error:', err?.response?.data || err.message);
      throw err;
    }
  },
};
