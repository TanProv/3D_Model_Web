import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const extractModelUrl = (output) => {
  if (!output) return null;

  // PBR model
  if (output.pbr_model) {
    return output.pbr_model;
  }

  // Old formats (fallback)
  if (Array.isArray(output.models)) {
    const glbModel = output.models.find(m => m.format === 'glb');
    if (glbModel?.url) return glbModel.url;
  }

  if (output.model?.glb) {
    return output.model.glb;
  }

  if (output.glb) {
    return output.glb;
  }

  return null;
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_API_BASE = 'https://api.tripo3d.ai';

if (!TRIPO_API_KEY) {
  console.warn('⚠️ TRIPO_API_KEY is missing');
}

const tripoAPI = axios.create({
  baseURL: TRIPO_API_BASE,
  timeout: 300000,
  headers: {
    Authorization: `Bearer ${TRIPO_API_KEY}`,
    Accept: 'application/json'
  }
});

tripoAPI.interceptors.request.use(cfg => {
  console.log(`🚀 ${cfg.method.toUpperCase()} ${cfg.url}`);
  return cfg;
});

tripoAPI.interceptors.response.use(
  res => {
    console.log(`✅ ${res.status}`);
    return res;
  },
  err => {
    console.error('❌ API Error:', {
      status: err.response?.status,
      code: err.response?.data?.code,
      message: err.response?.data?.message
    });
    return Promise.reject(err);
  }
);

/* ========================= VALIDATE API KEY ========================= */
export const validateApiKey = async () => {
  const res = await tripoAPI.get('/v2/openapi/user/balance');
  if (res.data?.code !== 0) {
    throw new Error('Invalid API key');
  }
  console.log('✅ API key validated');
  return true;
};

/* ========================= UPLOAD IMAGE ========================= */
export const uploadImageFile = async (imagePath) => {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`File not found: ${imagePath}`);
  }
  
  console.log('📤 Uploading:', imagePath);
  
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath), {
    filename: path.basename(imagePath)
  });
  
  const res = await tripoAPI.post('/v2/openapi/upload/sts', form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${TRIPO_API_KEY}`
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });
  
  const imageToken = res.data?.data?.image_token;
  if (!imageToken) {
    throw new Error('Upload failed: no image_token');
  }
  
  console.log('✅ Uploaded, token:', imageToken);
  return imageToken;
};

/* ========================= CREATE TASK - NEW FORMAT ========================= */
export const createImageTo3DTask = async (imageToken) => {
  console.log('🎨 Creating task with token:', imageToken);
  
  // Try format 1: Using 'file' object (NEW API format)
  const payload = {
    type: 'image_to_model',
    file: {
      type: 'image_token',
      token: imageToken
    }
  };
  
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const res = await tripoAPI.post('/v2/openapi/task', payload);
    const task = res.data?.data;
    
    if (!task?.task_id) {
      throw new Error('No task_id returned');
    }
    
    console.log('✅ Task created:', task.task_id);
    return task;
  } catch (error) {
    // If failed, try alternative format
    console.log('⚠️ First format failed, trying alternative...');
    
    const altPayload = {
      type: 'image_to_model',
      file: {
        type: 'png', // or 'jpg'
        file_token: imageToken
      }
    };
    
    console.log('📦 Alt Payload:', JSON.stringify(altPayload, null, 2));
    
    const res = await tripoAPI.post('/v2/openapi/task', altPayload);
    const task = res.data?.data;
    
    if (!task?.task_id) {
      throw new Error('No task_id returned');
    }
    
    console.log('✅ Task created:', task.task_id);
    return task;
  }
};

/* ========================= TEXT TO 3D ========================= */
export const createTextTo3DTask = async (prompt) => {
  console.log('📝 Creating text task:', prompt);
  
  const payload = {
    type: 'text_to_model',
    prompt: prompt
  };
  
  const res = await tripoAPI.post('/v2/openapi/task', payload);
  const task = res.data?.data;
  
  if (!task?.task_id) {
    throw new Error('No task_id');
  }
  
  console.log('✅ Task created:', task.task_id);
  return task;
};

/* ========================= GET TASK STATUS ========================= */
export const getTaskStatus = async (taskId) => {
  const res = await tripoAPI.get(`/v2/openapi/task/${taskId}`);
  return res.data?.data;
};

/* ========================= WAIT FOR TASK ========================= */
export const waitForTask = async (taskId, maxAttempts = 120, interval = 15000) => {
  console.log(`⏳ Waiting for task ${taskId}...`);
  
  for (let i = 1; i <= maxAttempts; i++) {
    const task = await getTaskStatus(taskId);
    console.log(`📊 [${i}/${maxAttempts}] ${task.status}`);
    
   if (task.status === 'success') {
  console.log('✅ Task output:', JSON.stringify(task.output, null, 2));
  return task;
}

    
    if (task.status === 'failed') {
      throw new Error(`Task failed: ${task.error || 'Unknown'}`);
    }
    
    await new Promise(r => setTimeout(r, interval));
  }
  
  throw new Error('Timeout');
};

/* ========================= DOWNLOAD FILE ========================= */
export const downloadFile = async (url, savePath) => {
  console.log('⬇️ Downloading:', url);
  
  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 300000
  });
  
  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(savePath);
    res.data.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  
  console.log('✅ Downloaded:', savePath);
  return savePath;
};

/* ========================= FULL WORKFLOWS ========================= */
export const generate3DFromImage = async (imagePath) => {
  console.log('\n🎬 Image → 3D workflow...');

  await validateApiKey();
  const imageToken = await uploadImageFile(imagePath);
  const task = await createImageTo3DTask(imageToken);
  const result = await waitForTask(task.task_id);

  const modelUrl = extractModelUrl(result.output);
  if (!modelUrl) {
    console.error('❌ Output:', JSON.stringify(result.output, null, 2));
    throw new Error('No model URL');
  }

  const modelsDir = path.join(__dirname, '..', 'data', 'models');
  fs.mkdirSync(modelsDir, { recursive: true });

  const filename = `tripo_${Date.now()}.glb`;
  const savePath = path.join(modelsDir, filename);

  await downloadFile(modelUrl, savePath);

  return {
    success: true,
    taskId: task.task_id,
    modelUrl,
    localPath: savePath,
    relativePath: `/models/${filename}`,
    fileSize: fs.statSync(savePath).size
  };
};


export const generate3DFromText = async (prompt) => {
  console.log('\n🎬 Text → 3D workflow...');
  
  await validateApiKey();
  const task = await createTextTo3DTask(prompt);
  const result = await waitForTask(task.task_id);
  
  const extractModelUrl = (output) => {
  if (!output) return null;

  // Case 1: output.models[]
  if (Array.isArray(output.models)) {
    const glbModel = output.models.find(m => m.format === 'glb');
    if (glbModel?.url) return glbModel.url;
  }

  // Case 2: output.model.glb
  if (output.model?.glb) {
    return output.model.glb;
  }

  // Case 3: output.glb (fallback, hiếm)
  if (output.glb) {
    return output.glb;
  }

  return null;
};
  const modelUrl = extractModelUrl(result.output);
  if (!modelUrl) {
    throw new Error('No model URL');
  }
  
  const modelsDir = path.join(__dirname, '..', 'data', 'models');
  fs.mkdirSync(modelsDir, { recursive: true });
  
  const filename = `tripo_text_${Date.now()}.glb`;
  const savePath = path.join(modelsDir, filename);
  
  await downloadFile(modelUrl, savePath);
  
  return {
    success: true,
    taskId: task.task_id,
    modelUrl,
    localPath: savePath,
    relativePath: `/models/${filename}`,
    fileSize: fs.statSync(savePath).size
  };
};

export default {
  validateApiKey,
  uploadImageFile,
  createImageTo3DTask,
  createTextTo3DTask,
  getTaskStatus,
  waitForTask,
  downloadFile,
  generate3DFromImage,
  generate3DFromText
};