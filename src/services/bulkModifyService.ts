import { request } from '../utlis/helper/axiosConfig';

export const bulkModifyService = {
  bulkModifyReports: async (payload: any) => {
    try {
      const res = await request.post('/report/bulk', payload);
      return res.data;
    } catch (err: any) {
      console.error('❌ Bulk modify error:', err?.response?.data || err.message);
      throw err;
    }
  },
};
