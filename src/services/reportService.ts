// import { request } from '../utlis/helper/axiosConfig';

// export const reportService = {
//   generateReport: async (payload: any, token: string, signal?: AbortSignal) => {
//     try {
//       const res = await request({
//         url: '/report/generate',
//         method: 'POST',
//         data: payload,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         signal,
//       });

//       if (res.status === 200 && res.data?.data) {
//         return {
//           success: true,
//           content: res.data.data, // directly use object
//         };
//       }


//       return { success: false, message: 'Unexpected response from server' };
//     } catch (err: any) {
//       console.error('❌ Report generation error:', err?.response?.data || err.message);
//       throw err;
//     }
//   },
// };



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

      if (res.status === 200) {
        const data = res.data?.data;
        const topLevelReportId = res.data?.report_id ?? null;
        const maybeReportId = (data && typeof data === 'object' && !Array.isArray(data)) ? (data.report_id ?? null) : null;

        const content =
          Array.isArray(data) ? data
          : (data && typeof data === 'object' && data.content && Array.isArray(data.content)) ? data.content
          : [];

        return {
          success: true,
          report_id: maybeReportId ?? topLevelReportId ?? null,
          content,
        };
      }

      return { success: false, message: 'Unexpected response from server' };
    } catch (err: any) {
      console.error('❌ Report generation error:', err?.response?.data || err.message);
      throw err;
    }
  },
};