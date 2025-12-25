'use client';

import Image from 'next/image';

interface SubjectAvatarProps {
    subjectId: string;
    subjectName: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

// Map subject IDs to avatar image files (when available)
const AVATAR_MAP: Record<string, string> = {
    'le-alc-2': '/avatars/darnell-washington.png',
    'sw-sub-1': '/avatars/sarah-mitchell.png',
    // More avatars can be added as they're generated
};

export default function SubjectAvatar({
    subjectId,
    subjectName,
    size = 'medium',
    className = '',
}: SubjectAvatarProps) {
    const sizeMap = {
        small: 32,
        medium: 64,
        large: 128,
    };

    const dimension = sizeMap[size];
    const avatarPath = AVATAR_MAP[subjectId];
    const initials = subjectName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    if (avatarPath) {
        return (
            <div
                className={`relative overflow-hidden ${className}`}
                style={{
                    width: dimension,
                    height: dimension,
                    border: '2px solid var(--border-color)',
                }}
            >
                <Image
                    src={avatarPath}
                    alt={subjectName}
                    width={dimension}
                    height={dimension}
                    className="object-cover"
                />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div
            className={`flex items-center justify-center font-bold ${className}`}
            style={{
                width: dimension,
                height: dimension,
                background: 'var(--bg-card)',
                border: '2px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: dimension * 0.35,
            }}
        >
            {initials}
        </div>
    );
}
