'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  startAfter,
  query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface UseCollectionOptions {
  limit?: number;
  orderBy?: [string, 'asc' | 'desc'];
}

export function useCollection<T extends DocumentData>(
  q: Query<DocumentData> | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const baseQuery = useMemo(() => {
    if (!q) return null;
    let newQuery = q;
    if (options?.orderBy) {
      newQuery = query(newQuery, orderBy(...options.orderBy));
    }
    if (options?.limit) {
      newQuery = query(newQuery, limit(options.limit));
    }
    return newQuery;
  }, [q, options?.orderBy, options?.limit]);

  useEffect(() => {
    if (!baseQuery) {
      setData([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as T[];
        setData(newData);
        const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastDoc(newLastDoc || null);
        setHasMore(snapshot.docs.length === options?.limit);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        const permissionError = new FirestorePermissionError({
            path: 'collection', // It's hard to get the exact path from a query object
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [baseQuery, options?.limit]);

  const loadMore = useCallback(async () => {
    if (!baseQuery || !lastDoc || !hasMore || loading) return;

    setLoading(true);
    
    let nextQuery = query(baseQuery, startAfter(lastDoc));

    try {
        const documentSnapshots = await getDocs(nextQuery);
        const newDocs = documentSnapshots.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as T[];

        setData(prevData => [...prevData, ...newDocs]);
        
        const newLastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastDoc(newLastDoc || null);
        setHasMore(documentSnapshots.docs.length === options?.limit);
    } catch(err) {
        console.error(err);
         const permissionError = new FirestorePermissionError({
            path: 'collection',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setLoading(false);
    }

  }, [baseQuery, lastDoc, hasMore, loading, options?.limit]);

  return { data, loading, loadMore, hasMore, setData };
}
