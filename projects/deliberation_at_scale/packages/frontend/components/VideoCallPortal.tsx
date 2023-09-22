"use client";
import { ReactNode } from "react";
import ReactDOM from "react-dom";

interface Props {
    children: ReactNode;
}

export default function VideoCallPortal(props: Props) {
    const { children } = props;
    const portalContainer = document.getElementById('video-call-portal');

    if (!portalContainer) {
        return null;
    }

    return ReactDOM.createPortal(
        children,
        portalContainer
    );
}
