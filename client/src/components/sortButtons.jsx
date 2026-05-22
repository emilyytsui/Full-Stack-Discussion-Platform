export default function SortButtons({ setSortType, currentSortType }) {
  return (
    <div className="mainSortButtons">
      <button
        id="newest"
        className={`sortButton ${currentSortType === "newest" ? "active" : ""}`}
        onClick={() => setSortType("newest")}>
        Newest
      </button>
      <button
        id="oldest"
        className={`sortButton ${currentSortType === "oldest" ? "active" : ""}`}
        onClick={() => setSortType("oldest")}>
        Oldest
      </button>
      <button
        id="active"
        className={`sortButton ${currentSortType === "active" ? "active" : ""}`}
        onClick={() => setSortType("active")}>
        Active
      </button>
    </div>
  );
}
