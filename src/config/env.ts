const nodeEnv = process.env.NODE_ENV || 'development';

const port = Number(process.env.PORT) || 3000;

export const env = {
  nodeEnv,
  port,
};
