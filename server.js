// 1️⃣ Import required packages
const express = require('express');      // Express framework
const mongoose = require('mongoose');    // MongoDB ODM
const cors = require('cors');            // To allow frontend requests
require('dotenv').config();              // Load .env variables

const app = express();

// 2️⃣ Middleware
app.use(cors());           // Enable CORS
app.use(express.json());   // Parse JSON request body

// 3️⃣ Mongoose Schema & Model
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' }
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

const Post = mongoose.model('Post', postSchema);

// 4️⃣ CREATE POST
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const post = new Post({
      title,
      content,
      author: author || 'Anonymous'
    });

    const savedPost = await post.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post: savedPost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 5️⃣ GET ALL POSTS
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6️⃣ UPDATE POST BY ID
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, author },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post updated successfully!',
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 7️⃣ DELETE POST BY ID
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully!',
      post: deletedPost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 8️⃣ ROOT ROUTE
app.get('/', (req, res) => {
  res.json({ message: 'Simple CRUD API running! Use /api/posts' });
});

// 9️⃣ CONNECT TO MONGODB AND START SERVER
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mypostdb';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Test POST → http://localhost:${PORT}/api/posts`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
  