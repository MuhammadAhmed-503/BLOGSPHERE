import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'BlogSphere';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0284c7',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
          }}
        >
          BlogSphere
        </h1>
        <p
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Production-Grade Blogging Platform
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
