import { Resend } from "resend";
export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_fG8Nbe9f_FEMoieWNj2pCXDCwdvNzRPfL",
);
