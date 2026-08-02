import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/posts?tag=Freshers&search=google&page=1&limit=10 - list with tag filter, search, pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tag = req.query.tag;
    const search = req.query.search?.trim();

    const filter = {};
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name'),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
      total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/tags - distinct tag list, used to build the tag filter UI
router.get('/tags', async (req, res) => {
  try {
    const tags = await Post.distinct('tags');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/id/:id - fetch by id, used by the admin edit form (protected)
router.get('/id/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:slug - single post for the public detail page
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts - create (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, excerpt, content, tags, company, applyLink, coverImage } = req.body;

    let slug = slugify(title);
    const existing = await Post.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await Post.create({
      title,
      slug,
      excerpt,
      content,
      tags,
      company,
      applyLink,
      coverImage,
      author: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/posts/:id - update (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { title, excerpt, content, tags, company, applyLink, coverImage } = req.body;

    if (title && title !== post.title) {
      post.title = title;
      post.slug = slugify(title);
    }
    post.excerpt = excerpt ?? post.excerpt;
    post.content = content ?? post.content;
    post.tags = tags ?? post.tags;
    post.company = company ?? post.company;
    post.applyLink = applyLink ?? post.applyLink;
    post.coverImage = coverImage ?? post.coverImage;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id - delete (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
