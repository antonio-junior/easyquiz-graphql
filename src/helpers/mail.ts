import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

dotenv.config();

type hashParam = {
  quizId: number;
  email: string;
};

const hash = (object: hashParam): string => {
  const str = JSON.stringify(object);
  return CryptoJS.HmacSHA1(str, process.env.SECRET_KEY ?? 'secret').toString();
};

export const validate = (req: Request, res: Response): unknown => {
  const { e: email, q: quizId, h: hashValue } = req.query;
  const checkHash = hash({
    quizId: parseInt(quizId as string, 2),
    email: email as string
  });
  if (checkHash === hashValue) return res.status(200).json('ok');
  return res.status(400).json('error');
};

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT as string, 2),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendMail = async (
  quizId: number,
  toAddress: string
): Promise<string | null> => {
  const hashValue = hash({ quizId, email: toAddress });

  const link = `http://${process.env.HOST}:${process.env.PORT}/validate?e=${toAddress}&q=${quizId}&h=${hashValue}`;

  const result = await transport.sendMail({
    from: `"EasyQuiz Team" <${process.env.EMAIL}>`,
    to: toAddress,
    subject: 'Quiz Invitation',
    text: `Hey there! You were invited to answer a quiz. Please, follow the link: ${link}`,
    html: `<b>Hey there! </b><br> You were invited to answer a quiz. Please, follow the <a href="${link}">link</a>.`
  });

  return result.messageId ? link : null;
};

export default sendMail;
