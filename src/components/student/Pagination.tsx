type Props = {
  page: number
  limit: number
  total: number
  setPage: (n: number) => void
  setLimit: (n: number) => void
}

export default function Pagination({ page, limit, total, setPage, setLimit }: Props) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div>
        <label>Items per page:</label>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="ml-2 border p-1 rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

      <div className="space-x-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded"
        >
          Prev
        </button>
        <span>{page}</span>
        <button
          disabled={(page * limit) >= total}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
    </div>
  )
}
