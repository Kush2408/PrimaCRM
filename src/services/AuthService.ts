import { request } from "../utlis/helper/axiosConfig";

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      });

      return res.data;
    } catch (err: any) {
      console.error('Login error:', err?.response?.data || err.message);
      throw err;
    }
  },
};
