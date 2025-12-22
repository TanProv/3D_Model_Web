import * as tripoService from '../services/tripoService.js';
import Model3D from '../models/Model3D.js';
import fs from 'fs';
import path from 'path';

/**
 * Generate 3D model from text prompt
 */
export const generateFromText = async (req, res) => {
  try {
    const { prompt, name, description } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    console.log('\n🎨 Text-to-3D generation request:', prompt);

    // Send immediate response
    res.status(202).json({
      message: 'Generation started',
      status: 'processing',
      prompt: prompt,
      estimatedTime: '2-5 minutes'
    });

    // Continue in background
    (async () => {
      try {
        console.log('🚀 Starting background generation...');
        
        const result = await tripoService.generate3DFromText(prompt);

        console.log('📦 Generation result:', {
          taskId: result.taskId,
          fileSize: result.fileSize,
          path: result.relativePath
        });

        // Save to database
        const newModel = await Model3D.create({
          name: name || `AI: ${prompt.substring(0, 50)}`,
          description: description || `Generated from prompt: "${prompt}"`,
          modelPath: result.relativePath,
          thumbnailPath: null,
          fileSize: result.fileSize,
          format: 'glb'
        });

        console.log('✅ Model saved to database, ID:', newModel.modelID);
      } catch (bgError) {
        console.error('❌ Background generation error:', bgError.message);
        console.error(bgError.stack);
      }
    })();

  } catch (error) {
    console.error('❌ Generate from text error:', error);
    res.status(500).json({
      message: 'Failed to start generation',
      error: error.message
    });
  }
};

/**
 * Generate 3D model from image URL
 */
export const generateFromImageUrl = async (req, res) => {
  try {
    const { imageUrl, name, description } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    console.log('\n🖼️ Image URL-to-3D generation request:', imageUrl);

    res.status(202).json({
      message: 'Generation started',
      status: 'processing',
      imageUrl: imageUrl,
      estimatedTime: '2-5 minutes'
    });

    // Continue in background
    (async () => {
      try {
        // Download image first
        const tempDir = path.join(process.cwd(), 'data', 'temp');

        fs.mkdirSync(tempDir, { recursive: true });

        const tempImagePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
        
        // Download image from URL
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.arrayBuffer();
        fs.writeFileSync(tempImagePath, Buffer.from(buffer));

        console.log('✅ Image downloaded to:', tempImagePath);

        // Generate 3D model
        const result = await tripoService.generate3DFromImage(tempImagePath);

        // Clean up temp image
        fs.unlinkSync(tempImagePath);

        // Save to database
        const newModel = await Model3D.create({
          name: name || `AI: Generated from Image`,
          description: description || `Generated from image: ${imageUrl}`,
          modelPath: result.relativePath,
          thumbnailPath: null,
          fileSize: result.fileSize,
          format: 'glb'
        });

        console.log('✅ Model saved to database, ID:', newModel.modelID);
      } catch (bgError) {
        console.error('❌ Background generation error:', bgError.message);
        console.error(bgError.stack);
      }
    })();

  } catch (error) {
    console.error('❌ Generate from image URL error:', error);
    res.status(500).json({
      message: 'Failed to start generation',
      error: error.message
    });
  }
};

/**
 * Generate 3D model from uploaded image file
 */
export const generateFromImageFile = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    console.log('\n📸 Image file-to-3D generation request:', imageFile.originalname);
    console.log('📂 File saved at:', imageFile.path);

    res.status(202).json({
      message: 'Generation started',
      status: 'processing',
      filename: imageFile.originalname,
      estimatedTime: '2-5 minutes'
    });

    // Continue in background
    (async () => {
      try {
        console.log('🚀 Starting background generation from file...');

        // Generate 3D model
        const result = await tripoService.generate3DFromImage(imageFile.path);

        console.log('✅ Generation completed:', {
          taskId: result.taskId,
          fileSize: result.fileSize,
          path: result.relativePath
        });

        // Clean up uploaded image
        if (fs.existsSync(imageFile.path)) {
          fs.unlinkSync(imageFile.path);
          console.log('🗑️  Cleaned up temp file:', imageFile.path);
        }

        // Save to database
        const newModel = await Model3D.create({
          name: name || `AI: ${imageFile.originalname}`,
          description: description || `Generated from uploaded image: ${imageFile.originalname}`,
          modelPath: result.relativePath,
          thumbnailPath: null,
          fileSize: result.fileSize,
          format: 'glb'
        });

        console.log('✅ Model saved to database, ID:', newModel.modelID);
        console.log('🎉 Full workflow completed successfully!\n');
      } catch (bgError) {
        console.error('❌ Background generation error:', bgError.message);
        console.error(bgError.stack);
        
        // Clean up on error
        if (imageFile && fs.existsSync(imageFile.path)) {
          fs.unlinkSync(imageFile.path);
          console.log('🗑️  Cleaned up temp file after error');
        }
      }
    })();

  } catch (error) {
    console.error('❌ Generate from image file error:', error);
    
    // Clean up on immediate error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: 'Failed to start generation',
      error: error.message
    });
  }
};

/**
 * Check generation status
 */
export const checkGenerationStatus = async (req, res) => {
  try {
    const { taskId } = req.params;

    const status = await tripoService.getTaskStatus(taskId);

    res.json({
      taskId: taskId,
      status: status.status,
      progress: status.progress || 0,
      data: status
    });
  } catch (error) {
    console.error('❌ Check status error:', error);
    res.status(500).json({
      message: 'Failed to check status',
      error: error.message
    });
  }
};