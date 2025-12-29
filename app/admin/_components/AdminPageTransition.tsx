"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useMemo, createRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export default function AdminPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const transitionKey = pathname ?? "";

  const nodeRef = useMemo(() => {
    return createRef<HTMLDivElement>();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={transitionKey}
        nodeRef={nodeRef}
        classNames="slide"
        timeout={500}
        exit={false}
        unmountOnExit
      >
        <div ref={nodeRef} style={{ width: "100%" }}>
          {children}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}
