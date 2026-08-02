export default function TagFilter({ tags, activeTag, onSelect }) {
  return (
    <div className="tag-filter">
      <button className={!activeTag ? 'active' : ''} onClick={() => onSelect('')}>
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={activeTag === tag ? 'active' : ''}
          onClick={() => onSelect(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
