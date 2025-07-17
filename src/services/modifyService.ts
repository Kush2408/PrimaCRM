import { request } from '../utlis/helper/axiosConfig';

export const modifyService = {
  modifyReport: async (payload: any) => {
    try {
      const res = await request.post('/report/modify', payload);
      return res.data;
    } catch (err: any) {
      console.error('❌ Modify report error:', err?.response?.data || err.message);
      throw err;
    }
  },
};
