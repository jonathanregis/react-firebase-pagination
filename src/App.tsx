import { useState, useEffect, useMemo } from 'react'
import {
  query,
  limit,
  Query,
  getDocs,
  startAfter,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  getCountFromServer,
  QueryDocumentSnapshot,
} from 'firebase/firestore'

type data = {
  totalDocs: number
  totalPages: number
  currentPage: number
  docs: QueryDocumentSnapshot[]
}

type hookReturnValue = {
  data: data
  error?: Error
  loading: boolean
  getNext: () => void
  getPrevious: () => void
}

type hookProps = {
  query: Query
  pageSize: number
  pageByPage?: boolean
  liveUpdate?: boolean
}

type usePaginateType = (props: hookProps) => hookReturnValue

const addQuery = (q: Query, fun: (val: any) => any, value: any) =>
  value ? query(q, fun(value)) : q

const usePagination: usePaginateType = ({
  pageSize = 10,
  query: mainQuery,
  pageByPage = false,
  liveUpdate = false,
}) => {
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)
  const [docs, setDocs] = useState<QueryDocumentSnapshot[]>([])
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot[]>([])
  const [query, setQuery] = useState(addQuery(mainQuery, limit, pageSize))
  const [totals, setTotals] = useState<Pick<data, 'totalDocs' | 'totalPages'>>({
    totalDocs: 0,
    totalPages: 0,
  })
  const [currentPage, setCurrentPage] = useState<number>(1);

  const onRes = (res: QuerySnapshot<DocumentData>) => {
    if (res.docs.length) {
      setCurrentPage(1);
      setLastSnap((e) => [...e, res.docs[pageSize - 1]])
      setDocs((e) => (pageByPage ? res.docs : [...e, ...res.docs]))
    }
    setLoading(false)
  }

  const onErr = (err: Error) => {
    setError(err)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    if (liveUpdate) {
      const unsubscribe = onSnapshot(query, onRes, onErr)
      return unsubscribe
    } else {
      getDocs(query).then(onRes).catch(onErr)
      return () => null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    setLoading(true)
    getCountFromServer(mainQuery).then((res) => {
      setQuery(addQuery(mainQuery, limit, pageSize))
      setTotals({
        totalDocs: res.data().count,
        totalPages: Math.ceil(res.data().count / pageSize),
      })
    })
  }, [mainQuery, pageSize, pageByPage])

  const getLastEle = (array: any[]) => array[array.length - 1]

  const getNext = () => {
    if (currentPage < totals.totalPages) {
      setCurrentPage(c => c+1);
      let q = addQuery(mainQuery, startAfter, getLastEle(lastSnap))
      q = addQuery(q, limit, pageSize)
      setQuery(q)
    }
  }

  const getPrevious = () => {
    if (pageByPage && currentPage > 1) {
      setCurrentPage(c => c-1);
      const newArray = lastSnap.slice(0, -2)
      setLastSnap(newArray)
      let q = addQuery(mainQuery, startAfter, getLastEle(newArray))
      q = addQuery(q, limit, pageSize)
      setQuery(q)
    }
  }

  return useMemo(
    () => ({
      error,
      loading,
      getNext,
      getPrevious,
      hasNext: currentPage < totals.totalPages,
      hasPrevious: pageByPage ? currentPage > 1 : false,
      data: {
        docs,
        ...totals,
        currentPage,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [docs,currentPage,totals],
  )
}

export default usePagination
