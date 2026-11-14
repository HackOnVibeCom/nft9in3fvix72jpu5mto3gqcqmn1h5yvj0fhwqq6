import React, { type AnchorHTMLAttributes, type PropsWithChildren } from "react";
export default function Link({ href, children, ...props }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) { return <a href={href} {...props}>{children}</a>; }
