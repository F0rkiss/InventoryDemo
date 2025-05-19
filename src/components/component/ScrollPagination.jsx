import React, { useRef, useEffect, useCallback } from 'react';

function ScrollPagination({ loading, nextCursor, fetchMoreItems, children }) {
  const observer = useRef();

  const lastItemCallback = useCallback(
    (node) => {
      if (loading || !nextCursor) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchMoreItems();
          }
        },
        { threshold: 0.4 }
      );

      if (node) observer.current.observe(node);
    },
    [loading, nextCursor, fetchMoreItems]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const isEmpty = React.Children.count(children) === 0;

  return (
    <>

      {React.Children.map(children, (child, index) => {
        if (index === React.Children.count(children) - 1) {
          return React.cloneElement(child, {
            ref: lastItemCallback,
          });
        }
        return child;
      })}

    </>
  );
}

export default ScrollPagination;
