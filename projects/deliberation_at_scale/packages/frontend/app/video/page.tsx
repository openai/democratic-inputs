"use client";

import dynamic from 'next/dynamic';

const DynamicRoom = dynamic(() => import('./room'), { ssr: false });

export default function Video() {
    return (
        <DynamicRoom />
    );
}