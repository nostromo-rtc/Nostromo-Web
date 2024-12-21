import React, { VideoHTMLAttributes, useEffect, useRef } from 'react';

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> 
{
    srcObject?: MediaStream;
}

export const Video: React.FC<VideoProps> = ({ srcObject, ...props }) =>
{
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() =>
    {
        if (!videoRef.current || !srcObject) 
        {
            return;
        }

        videoRef.current.srcObject = srcObject;
    }, [srcObject]);

    return <video ref={videoRef} {...props} />;
};
