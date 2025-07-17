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



// // src/services/authService.ts
// import { authRequest } from '../utlis/helper/authConfig';

// interface Credentials {
//   username: string;
//   password: string;
// }

// export const authService = {
//   login: async (credentials: Credentials) => {
//     try {
//       const res = await authRequest.post('auth/login', credentials);
//       return res.data;
//     } catch (err: any) {
//       console.error('Login error:', err?.response?.data || err.message);
//       throw err;
//     }
//   },
// };
