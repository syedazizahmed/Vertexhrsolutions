import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import PostCard from '../components/PostCard.jsx';
import TagFilter from '../components/TagFilter.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from '../config/site.js';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/tags').then((res) => setTags(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/posts', { params: { tag: activeTag, search, page, limit: 10 } })
      .then((res) => {
        setPosts(res.data.posts);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [activeTag, search, page]);

  const handleTagSelect = (tag) => {
    setActiveTag(tag);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const title = activeTag ? `${activeTag} Jobs | ${SITE_NAME}` : `${SITE_NAME} | ${DEFAULT_DESCRIPTION}`;
  const description = activeTag
    ? `Latest ${activeTag.toLowerCase()} job openings and recruitment drives.`
    : DEFAULT_DESCRIPTION;

  return (
    <main className="container">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={SITE_URL} />
      </Helmet>
      <h1>Latest Job Openings</h1>
      <SearchBar onSearch={handleSearch} />
      <TagFilter tags={tags} activeTag={activeTag} onSelect={handleTagSelect} />

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}
