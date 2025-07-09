import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.APP_DASH_SCOPE_API_KEY, // 从环境变量读取
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});
const dimension = process.env.APP_VECTOR_DIMENTIONS ? parseInt(process.env.APP_VECTOR_DIMENTIONS) : 1024; // 默认向量维度为1024

export async function getEmbedding(input: string, dimensions: number = dimension, encoding_format: "float" | "base64" = "float") {
  try {
    const completion = await openai.embeddings.create({
      model: "text-embedding-v4",
      input: input,
      dimensions: dimensions, // 指定向量维度（仅 text-embedding-v3及 text-embedding-v4支持该参数）
      encoding_format: encoding_format
    });
    return completion.data[0].embedding; // 返回第一个结果的向量
  } catch (error) {
    throw error
  }
}