import React, { useRef, useEffect } from 'react';

export default function ScrollPagination({
  loading,
  nextCursor,
  fetchMoreItems,
  children,
  rootSelector,     // e.g. ".page-content" for Framework7
  rootRef,          // or pass a ref to a custom scroll container
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (loading || !nextCursor) return;

    const rootEl =
      (rootRef && rootRef.current) ||
      (rootSelector ? document.querySelector(rootSelector) : null) ||
      null;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMoreItems();
      },
      {
        root: rootEl,           // <— key for inner scrolling containers
        rootMargin: '300px 0px',
        threshold: 0,           // fire as we approach the bottom
      }
    );

    const node = sentinelRef.current;
    if (node) obs.observe(node);
    return () => obs.disconnect();
  }, [loading, nextCursor, fetchMoreItems, rootSelector, rootRef]);

  return (
    <>
      {children}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
    </>
  );
}
